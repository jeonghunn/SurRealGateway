import {Group} from "../model/Group";
import {
    AttendeeType,
    Status,
    UserStatus,
} from "../core/type";
import {Op} from "sequelize";
import { AttendeeController } from "./AttendeeController";
import { User } from "../model/User";

export class GroupController {

    public create(meta: any): Promise<Group> {

        return Group.create(meta);
    }

    public getListBtId(ids: number[], attributes: string[]): Promise<Group[]> {
        return Group.findAll(
            {
                attributes,
                where: {
                    status: Status.NORMAL,
                    id: ids,
                },
                include: {
                    model: User,
                    as: 'target',
                    required: false,
                    attributes: ['id', 'name'],
                    where: {
                        status: {[Op.ne]: UserStatus.REMOVED},
                    }

                },
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

    public getGroupList(userId: number, attributes: string[]): Promise<Group[]> {
        const attendeeController: AttendeeController = new AttendeeController();
        return attendeeController.getList(AttendeeType.GROUP, userId).then((attendeeIds: number[]) => {
            return this.getListBtId(attendeeIds, attributes);
        });
    }

}
