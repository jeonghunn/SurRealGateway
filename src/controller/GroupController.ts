import { Room } from "../model/Room";
import {Group} from "../model/Group";
import {Status} from "../core/type";
import {Op} from "sequelize";

const config = require('../config/config');

export class GroupController {

    public create(meta: any): Promise<Group> {

        return Group.create(meta);
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
        const groupController: GroupController = new GroupController();

        return groupController.getFriendGroup(userId, targetId).then((result: Group | null) => {
            if (result) {
                return result;
            }

            return groupController.create(
                {
                    user_id: userId,
                    target_id: targetId,
                    ip_address: ipAddress,
                    status: Status.NORMAL,
                }
            )
        });

    }

}
