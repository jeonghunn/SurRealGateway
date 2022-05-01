import { Room } from "../model/Room";
import {
    AttendeePermission,
    AttendeeType,
    AuthMessage,
    ChatMessage,
    SimpleUser,
    Status,
} from "../core/type";
import { AttendeeController } from "./AttendeeController";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import { User } from "../model/User";
import {getOptions} from "sequelize-typescript";
import {Chat} from "../model/Chat";

const config = require('../config/config');

export class RoomController {

    public get(groupId: number, id: number): Promise<Room | null> {
        return Room.findOne({
                where: {
                    status: Status.NORMAL,
                    id,
                    group_id: groupId,
                },
            }
        ).catch((result) => {
            console.log('Error: get from RoomController', result);
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
        const attendeeController: AttendeeController = new AttendeeController();

        return Room.create({
            user_id,
            group_id,
            name,
            description,
            ip_address,
            limit,
            status: Status.NORMAL,
        }).then((room: Room) => {

            attendeeController.create(
                AttendeeType.ROOM,
                user_id,
                room.id,
                AttendeePermission.ADMIN,
            )

            return room;
        });
    }


    public getList(group_id: number, before: Date, offset: number = 0, limit: number = 15): Promise<Room[]> {
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
            console.log('Error: getVerifiedUser from RoomController', e);
            return null;
        }
    }

    public parseChatMessage(content: string, me: SimpleUser): ChatMessage {
        const chat: ChatMessage = JSON.parse(content);

        chat.createdAt = new Date();

        const user: User = new User();
        user.name = me.name!;
        user.id = me.id!;

        chat.user = user;

        return chat;
    }

}
