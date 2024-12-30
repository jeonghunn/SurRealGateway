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
import { AttachService } from "./AttachService";
import { Attach } from "../model/Attach";
import { Group } from "../model/Group";
import { ClientService } from "./ClientService";
import { FirebaseService } from "./FirebaseService";
import { ChatService } from "./ChatService";

const config = require('../config/config');

export class RoomService {

    public get(groupId: string, id: number, isSecure: boolean = true): Promise<Room | null> {

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

    public getById(id: number) {
        return Room.findOne({
            where: {
                status: Status.NORMAL,
                id,
            },
            include: [
                {
                    model: Group,
                    as: 'group',
                    required: false,
                    attributes: ['id', 'name', 'target_id'],

                },
            ],
        }
    ).catch((result) => {
        console.log('Error: get from RoomService', result);
        return null;
    });
    }

    public create(
        user_id: number,
        group_id: string,
        letter?: string,
        name?: string,
        description?: string,
        ip_address?: string,
        limit: number = 10,

    ): Promise<Room> {
        const attendeeService: AttendeeService = new AttendeeService();
        const clientService: ClientService = new ClientService();
        const firebaseService: FirebaseService = new FirebaseService();

        return Room.create({
            user_id,
            group_id,
            name,
            letter,
            description,
            ip_address,
            limit,
            status: Status.NORMAL,
        }).then((room: Room) => {

            attendeeService.add(
                AttendeeType.ROOM,
                user_id,
                room.id,
                AttendeePermission.ADMIN,
                firebaseService,
                clientService,
            )

            return room;
        }).catch((result) => {
            console.log('Error: create from RoomService', result);
            return null;
        });
    }


    public getList(
        group_id: string,
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
            const jwtInfo: any = jwt.verify(auth.token?.split(" ")[1]!, config.jwt.secret);

            return {
                id: jwtInfo.id,
                name: jwtInfo.name,
                color: jwtInfo.color,
            };
        } catch (e: any) {
            console.log('Error: getVerifiedUser from RoomService', e);
            return null;
        }
    }

    public getChatMessage(
        chatService: ChatService,
        attachService: AttachService,
        me: SimpleUser,
        message: LiveMessage,
        ): LiveMessage {
                
        message.createdAt = new Date();

        const user: User = new User();
        user.name = me.name!;
        user.id = me.id!;
        user.color = me.color!;

        message.user = user;

        message.meta = chatService.getRefreshedMeta(attachService, message.meta);
        
        return message;
    }

    public getFormattedMessage(
        chatService: ChatService,
        attachService: AttachService,
        content: any,
        me: SimpleUser,
        ): LiveMessage {
        const message: LiveMessage = JSON.parse(content);

        switch (message.T) {
            case CommunicationType.CHAT:
                return this.getChatMessage(
                    chatService,
                    attachService,
                    me,
                    message,
                );
            case CommunicationType.TOPIC:
                return message;
            default:
                return message;
        }
    }

    public parseMessage(
        chatService: ChatService,
        attachService: AttachService,
        content: any,
        me: SimpleUser,
        ): LiveMessage | undefined {

        switch (content[0]) {
            case 123:
                return this.getFormattedMessage(
                    chatService,
                    attachService,
                    content,
                    me,
                );
            default:

                const liveMessage: LiveMessage = new LiveMessage();
                liveMessage.content = content;
                liveMessage.T = CommunicationType.LIVE;
                return liveMessage;

        }


    }
}
