import {Group} from "../model/Group";
import {
    AttendeePermission,
    AttendeeType,
    PrivacyType,
    Status,
    UserStatus,
} from "../core/type";
import {Op} from "sequelize";
import { AttendeeService } from "./AttendeeService";
import { User } from "../model/User";
import { RoomService } from "./RoomService";
import { Room } from "../model/Room";
import { FirebaseService } from "./FirebaseService";
import { ClientService } from "./ClientService";
import { util } from "../core/util";

export class GroupService {

    public create(meta: any): Promise<Group> {
        const roomService: RoomService = new RoomService();
        
        return util.getNotDuplicatedId(Group).then((id: string) => {
            console.log('GroupService: create: id: ', id);
            meta.id = id;
            return Group.create(meta).then((result: Group) => {
                return roomService.create(meta.user_id, result.id).then((room: Room) => {
                    return result;
                });
            });
        });
    }


    public get(id: string): Promise<Group | null> {
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
                        attributes: ['id', 'name', 'color'],
                        where: {
                            status: {[Op.ne]: UserStatus.REMOVED},
                        }

                    },
                    {
                        model: User,
                        as: 'user',
                        required: false,
                        attributes: ['id', 'name', 'color'],
                        where: {
                            status: {[Op.ne]: UserStatus.REMOVED},
                        }

                    },
                ],
            }
        )
    }

    public getListById(ids: string[], attributes: string[]): Promise<Group[]> {
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
                        attributes: ['id', 'name', 'color'],
                        where: {
                            status: {[Op.ne]: UserStatus.REMOVED},
                        }

                    },
                    {
                        model: User,
                        as: 'user',
                        required: false,
                        attributes: ['id', 'name', 'color'],
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
        const attendeeService: AttendeeService = new AttendeeService();
        const firebaseService: FirebaseService = new FirebaseService();
        const clientService: ClientService = new ClientService();

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
                    privacy: PrivacyType.PRIVATE,
                }
            ).then((group: Group | null) => {

                if(!group) {
                    return null;
                }

                attendeeService.add(
                    AttendeeType.GROUP,
                    userId,
                    group!!.id,
                    AttendeePermission.MEMBER,
                    firebaseService,
                    clientService,
                    );
                attendeeService.add(
                    AttendeeType.GROUP,
                    targetId,
                    group!!.id,
                    AttendeePermission.MEMBER,
                    firebaseService,
                    clientService,
                    );

               return group;
            });
        });

    }

    public getGroupList(userId: number, attributes: string[]): Promise<Group[] | null> {
        const attendeeService: AttendeeService = new AttendeeService();
        return attendeeService.getList(AttendeeType.GROUP, userId).then((attendeeIds: (string | number)[] | null) => {
            if (!attendeeIds) {
                return null;
            }

            return this.getListById(attendeeIds as string[], attributes);
        });
    }

}
