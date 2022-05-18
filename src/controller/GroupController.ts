import {Group} from "../model/Group";
import {
    AttendeeType,
    Status,
    UserStatus,
} from "../core/type";
import {Op} from "sequelize";
import { AttendeeController } from "./AttendeeController";
import { User } from "../model/User";
import { RoomController } from "./RoomController";
import { Room } from "../model/Room";

export class GroupController {

    public create(meta: any): Promise<Group> {
        const roomController: RoomController = new RoomController();

        return Group.create(meta).then((group: Group) => {
            return roomController.create(meta.user_id, group.id).then((room: Room) => {
                return group;
            });
        });
    }

    public get(id: number): Promise<Group | null> {
        return Group.findOne({
                where: {
                    status: Status.NORMAL,
                    id,
                },
                include: [
                    {
                        model: User,
                        as: 'target',
                        required: false,
                        attributes: ['id', 'name'],
                        where: {
                            status: {[Op.ne]: UserStatus.REMOVED},
                        }

                    },
                    {
                        model: User,
                        as: 'user',
                        required: false,
                        attributes: ['id', 'name'],
                        where: {
                            status: {[Op.ne]: UserStatus.REMOVED},
                        }

                    },
                ],
            }
        )
    }

    public getListById(ids: number[], attributes: string[]): Promise<Group[]> {
        return Group.findAll(
            {
                attributes,
                where: {
                    status: Status.NORMAL,
                    id: ids,
                },
                include: [
                    {
                        model: User,
                        as: 'target',
                        required: false,
                        attributes: ['id', 'name'],
                        where: {
                            status: {[Op.ne]: UserStatus.REMOVED},
                        }

                    },
                    {
                        model: User,
                        as: 'user',
                        required: false,
                        attributes: ['id', 'name'],
                        where: {
                            status: {[Op.ne]: UserStatus.REMOVED},
                        }

                    },
                ],
            }
        )
    }

    public getFriendGroup(userId: number, targetId: number): Promise<Group | null> {
        return Group.findOne({
            where: {
                status: Status.NORMAL,
                [Op.or]: [
                    {
                        user_id: userId,
                        target_id: targetId,
                    },
                    {
                        target_id: userId,
                        user_id: targetId,
                    },
                ],
            }
        });
    }


    public createFriendGroup(
        userId: number,
        targetId: number,
        groupName: string,
        ipAddress: string | null = null,
    ): Promise<Group | null> {
        const attendeeController: AttendeeController = new AttendeeController();

        return this.getFriendGroup(userId, targetId).then((result: Group | null) => {
            if (result) {
                return result;
            }

            return this.create(
                {
                    user_id: userId,
                    target_id: targetId,
                    name: groupName,
                    ip_address: ipAddress,
                    status: Status.NORMAL,
                }
            ).then((group: Group | null) => {

                if(!group) {
                    return null;
                }

                attendeeController.create(AttendeeType.GROUP, userId, group!!.id);
                attendeeController.create(AttendeeType.GROUP, targetId, group!!.id);

               return group;
            });
        });

    }

    public getGroupList(userId: number, attributes: string[]): Promise<Group[] | null> {
        const attendeeController: AttendeeController = new AttendeeController();
        return attendeeController.getList(AttendeeType.GROUP, userId).then((attendeeIds: number[] | null) => {
            if (!attendeeIds) {
                return null;
            }

            return this.getListById(attendeeIds, attributes);
        });
    }

}
