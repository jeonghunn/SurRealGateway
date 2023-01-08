import { Room } from "../model/Room";
import {
    AttendeePermission,
    AttendeeType,
    AuthMessage,
    CommunicationType,
    LiveMessage,
    SimpleUser,
    Status,
} from "../core/type";
import { AttendeeService } from "./AttendeeService";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import { User } from "../model/User";

const config = require('../config/config');

export class RoomService {

    public get(groupId: number, id: number, isSecure: boolean = true): Promise<Room | null> {

        const exclude: string[] = isSecure ? ['ip_address'] : [];

        return Room.findOne({
                where: {
                    status: Status.NORMAL,
                    id,
                    group_id: groupId,
                },
            attributes: {
                exclude,
            }
            }
        ).catch((result) => {
            console.log('Error: get from RoomService', result);
            return null;
        });

    }

    public create(
        user_id: number,
        group_id: number,
        name?: string,
        description?: string,
        ip_address?: string,
        limit: number = 10,

    ): Promise<Room> {
        const attendeeService: AttendeeService = new AttendeeService();

        return Room.create({
            user_id,
            group_id,
            name,
            description,
            ip_address,
            limit,
            status: Status.NORMAL,
        }).then((room: Room) => {

            attendeeService.create(
                AttendeeType.ROOM,
                user_id,
                room.id,
                AttendeePermission.ADMIN,
            )

            return room;
        });
    }


    public getList(
        group_id: number,
        before: Date,
        offset: number = 0,
        limit: number = 15,
        isSecure: boolean = true,
        ): Promise<Room[]> {

        const exclude: string[] = isSecure ? ['ip_address'] : [];

        return Room.findAll(
            {
                where: {
                    status: Status.NORMAL,
                    group_id,
                    createdAt: {[Op.lte]: before},
                },
                order: [
                    ['id', 'DESC'],
                ],
                offset,
                limit,
                attributes: {
                    exclude,
                }
            }
        )
    }

    public getVerifiedUser(authMessage: string): SimpleUser | null {
        try {
            const auth: AuthMessage = JSON.parse(authMessage);
            const jwtInfo: any = jwt.verify(auth.token?.split(" ")[1]!, 'TEST_SERVER_SECRET');

            return {
                id: jwtInfo.id,
                name: jwtInfo.name,
            };
        } catch (e: any) {
            console.log('Error: getVerifiedUser from RoomService', e);
            return null;
        }
    }

    public parseMessage(content: any, me: SimpleUser): LiveMessage | undefined {

        switch (content[0]) {
            case '{':
                const message: LiveMessage = JSON.parse(content);

                message.createdAt = new Date();

                const user: User = new User();
                user.name = me.name!;
                user.id = me.id!;

                message.user = user;

                return message;
            default:

                const liveMessage: LiveMessage = new LiveMessage();
                liveMessage.content = content;
                liveMessage.T = CommunicationType.LIVE;
                return liveMessage;

        }


    }
}
