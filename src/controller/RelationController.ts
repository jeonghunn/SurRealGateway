import {Relation} from "../model/relation";
import {RelationCategory, RelationStatus} from "../model/type";
import {UserController} from "./UserController";
import {User} from "../model/user";
import {Op} from "sequelize";

const config = require('../config/config');

export class RelationController {

    public create(
        userId: number,
        targetId: number,
        category: RelationCategory,
        status: RelationStatus,

    ): Promise<Relation | null> {

        return Relation.create({
            user_id: userId,
            target_id: targetId,
            category,
            status,
        }).catch((e) => {
            console.log(e);
            return null;
        });
    }

    public delete(
        userId: number,
        targetId: number,
        category: RelationCategory,
    ): Promise<[number, Relation[]] | null> {

        return Relation.update(
            {
                status: RelationStatus.REMOVED,
            },
        {
            where: {
                user_id: userId,
                target_id: targetId,
                category,
                status: {
                    [Op.ne]: RelationStatus.REMOVED,
                },
            },
        },
    ).catch((e) => {
            console.log(e);
            return null;
        });
    }


    public getList(
        userId: number,
        targetId: number,
    ): Promise<Relation[] | null> {

        return Relation.findAll({
            where: {
                user_id: userId,
                target_id: targetId,
                status: {
                    [Op.ne] : RelationStatus.REMOVED,
                }
            },
            order: [
                ['id', 'DESC'],
            ],
        }).catch((e) => {
            console.log(e);
            return null;
        });
    }

    public accept(category: RelationCategory, userId: number, targetId: number): Promise<[number, Relation[]]> {
        return Relation.update({
                status: RelationStatus.NORMAL,
            },
            {
                where: {
                    user_id: userId,
                    target_id: targetId,
                    status: {
                        [Op.or]: [
                            RelationStatus.PENDING,
                            RelationStatus.REQUEST_RECEIVED,
                        ],
                    },
                    category,
                }
            },
        ).catch((e) => {
            console.log(e);
            throw e;
        });
    }

    public getLastFriendStatus(userId: number, targetId: number): Promise<RelationStatus> {
        return this.getList(userId, targetId).then((list: Relation[] | null) => {
            if (!list || list?.length === 0) {
                return RelationStatus.REMOVED;
            }

            return list[0]?.status;
        });
    }

    public sendFriendRequest(
        userId: number,
        targetId: number,
    ): Promise<boolean> {
        const userController: UserController = new UserController();

        return userController.getById(targetId).then((user: User | null) => {
            if (!user) {
                return false;
            }

            return this.getLastFriendStatus(userId, targetId).then((lastStatus: RelationStatus) => {

                switch (lastStatus) {
                    case RelationStatus.NORMAL:
                        return false;
                    case RelationStatus.PENDING:
                        return false;
                    case RelationStatus.REQUEST_RECEIVED:
                        return this.accept(
                            RelationCategory.FRIEND,
                            userId,
                            targetId,
                        ).then(((relation) => {
                            return this.accept(RelationCategory.FRIEND, targetId, userId).then(
                                (result: [number, Relation[]]) => {
                                    return relation[0] > 0;
                            });
                        }));
                    case RelationStatus.REMOVED:
                        return this.create(
                            userId,
                            targetId,
                            RelationCategory.FRIEND,
                            RelationStatus.PENDING,
                        ).then((relation) => {
                            this.create(targetId, userId, RelationCategory.FRIEND, RelationStatus.REQUEST_RECEIVED);
                            return relation !== null;
                        });
                }

                return false;
            })
        });
    }

    public unfriend(userId: number, targetId: number): Promise<[number, Relation[]] | null> {
        const userController: UserController = new UserController();

        return userController.getById(targetId).then((user: User | null) => {
            return this.delete(userId, targetId, RelationCategory.FRIEND).then((relation) => {
                this.delete(targetId, userId, RelationCategory.FRIEND);

                return relation;
            });
        });
    }


}
