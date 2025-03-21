import {
    ChatCategory,
    CommunicationType,
    LiveMessage,
    Status,
    UserStatus,
} from "../core/type";
import { Chat } from "../model/Chat";
import { Op } from "sequelize";
import { User } from "../model/User";
import { Topic } from "../model/Topic";
import { ChatService } from "./ChatService";
import { LiveRoomService } from "./LiveRoomService";
import { Room } from "../model/Room";
import { Space } from "../model/Space";
import { ClientService } from "./ClientService";
import { util } from "../core/util";

export class TopicService {

    public async save(topic: Topic): Promise<Topic> {
        return topic.save();
    }

    public create(
        id: string,
        name: string,
        roomId: number,
        parentId: string,
        category: string | null,
        chatId: string | null,
        userId: number,
        meta: string | null = null,
        spaceId: string | null = null,
        status: Status = Status.NORMAL,
        ipAddress: string | null = null,
        ): Promise<Topic> {


        return Topic.create({
            id,
            name,
            chat_id: chatId,
            room_id: roomId,
            parent_id: parentId,
            user_id: userId,
            meta,
            status,
            space_id: spaceId,
            ip_address: ipAddress,
        }).catch((e) => {
            console.log('Error: create from TopicService', e);
            return new Promise((resolve, reject) => {
                reject(e);
            });
        });

    }

    public sendTopicCardToChat(
        liveRoomService: LiveRoomService,
        clientService: ClientService,
        id: string,
        name: string,
        room: Room,
        parentId: string,
        chat: Chat,
        userId: number,
    ) {
        const user: User = new User();

        user.id = userId;
        //user.name = name;
        
        const liveMessage: LiveMessage = {
            id: chat?.id!!,
            category: ChatCategory.TOPIC_PREVIEW,
            T: CommunicationType.CHAT,
            createdAt: new Date(),
            user,
            content: name,
            topic_id: parentId,
            meta: {
                child_topic_id: id,
                chat, 
            }

        };

        liveRoomService.send(clientService, this ,room?.id!!, liveMessage, room, parentId);
    }

    public add(
        liveRoomService: LiveRoomService,
        clientService: ClientService,
        name: string,
        room: Room,
        parentId: string,
        category: string | null,
        chat: Chat | null,
        userId: number,
        meta: string | null = null,
        spaceId: string | null = null,
        status: Status = Status.NORMAL,
        ipAddress: string | null = null,
    ): Promise<Topic> {

        if (chat) {
            return this.getByChatId(chat?.id!!).then((topic: Topic | null) => {
                if (topic) {

                    this.sendTopicCardToChat(
                        liveRoomService,
                        clientService,
                        topic?.id,
                        name,
                        room,
                        parentId,
                        chat,
                        userId,
                    );
            
                    return topic;
                }

                return this.generateIdAndCreate(
                    liveRoomService,
                    clientService,
                    name,
                    room,
                    parentId,
                    category,
                    chat,
                    userId,
                    meta,
                    spaceId,
                    status,
                    ipAddress,
                );
    
            }).catch((error: any) => {
                console.log('Error: add from TopicService', error);
                return new Promise((resolve, reject) => {
                    reject(error);
                });
            }
            );    

        }

        return this.generateIdAndCreate(
            liveRoomService,
            clientService,
            name,
            room,
            parentId,
            category,
            chat,
            userId,
            meta,
            spaceId,
            status,
            ipAddress,
        );
    }

    public generateIdAndCreate(
        liveRoomService: LiveRoomService,
        clientService: ClientService,
        name: string,
        room: Room,
        parentId: string,
        category: string | null,
        chat: Chat | null,
        userId: number,
        meta: string | null = null,
        spaceId: string | null = null,
        status: Status = Status.NORMAL,
        ipAddress: string | null = null,
    ) {
        return util.getNotDuplicatedId(Topic).then((id: string) => {
            this.sendTopicCardToChat(
                liveRoomService,
                clientService,
                id,
                name,
                room,
                parentId,
                chat,
                userId,
            );
            
            return this.create(
                id,
                name,
                room?.id!!,
                parentId,
                category,
                chat?.id!!,
                userId,
                meta,
                spaceId,
                status,
                ipAddress,
            ).then((topic: Topic | null) => {
                return topic;
            });

        }).catch((error: any) => {
            console.log('Error: add from TopicService', error);
            return null;
        });
    }

    public get(id: string): Promise<Topic | null> {
        return Topic.findOne({
            where: {
                status: Status.NORMAL,
                id,
            },
            include: [
                {
                    model: Space,
                    as: 'space',
                    required: false,
                    attributes: ['id', 'key'],

                },
                {
                    model: Chat,
                    as: 'chat',
                    required: false,
                    attributes: ['id', 'category', 'content', 'createdAt', 'meta'],
                    include: [
                        {
                            model: User,
                            as: 'user',
                            required: false,
                            attributes: ['id', 'name', 'color'],
                        },
                    ],
                }
            ],
        }).catch((e) => {
            console.log('Error: get from TopicService', e);
            return new Promise((resolve, reject) => {
                reject(e);
            });
        });
    }

    public getByChatId(chatId: string): Promise<Topic | null> { 
        return Topic.findOne({
            where: {
                chat_id: chatId,
            }
        }).catch((e) => {
            console.log('Error: getByChatId from TopicService', e);
            return null;
        });
    }



}
