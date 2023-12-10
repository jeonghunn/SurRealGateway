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

export class TopicService {

    public async save(topic: Topic): Promise<Topic> {
        return topic.save();
    }

    public create(
        name: string,
        roomId: number,
        parentId: number,
        category: string | null,
        chatId: string | null,
        userId: number,
        meta: string | null = null,
        spaceId: string | null = null,
        status: Status = Status.NORMAL,
        ipAddress: string | null = null,
        ): Promise<Topic> {


        return Topic.create({
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

    public add(
        liveRoomService: LiveRoomService,
        name: string,
        room: Room,
        parentId: number,
        category: string | null,
        chatId: string | null,
        userId: number,
        meta: string | null = null,
        spaceId: string | null = null,
        status: Status = Status.NORMAL,
        ipAddress: string | null = null,
    ): Promise<Topic> {
        return this.create(
            name,
            room?.id!!,
            parentId,
            category,
            chatId,
            userId,
            meta,
            spaceId,
            status,
            ipAddress,
        ).then((topic: Topic | null) => {
            const user: User = new User();

            user.id = userId;
            user.name = name;
            
            const liveMessage: LiveMessage = {
                id: topic?.chat_id!!,
                category: ChatCategory.TOPIC_PREVIEW,
                T: CommunicationType.CHAT,
                user,
                content: topic?.name!!,
                topic_id: parentId,
                meta: {
                    child_topic_id: topic?.id!!,
                }

            };
            liveRoomService.send(room?.id!!, liveMessage, room, parentId);

            return topic;
        }).catch((error: any) => {
            console.log('Error: add from TopicService', error);
            return null;
        });
    }

    public get(id: number): Promise<Topic | null> {
        return Topic.findByPk(id).catch((e) => {
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
