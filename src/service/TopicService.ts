import {
    Status,
    UserStatus,
} from "../core/type";
import { Chat } from "../model/Chat";
import { Op } from "sequelize";
import { User } from "../model/User";
import { Topic } from "../model/Topic";

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
            ip_address: ipAddress,
        }).catch((e) => {
            console.log('Error: create from TopicService', e);
            return null;
        });

    }

    public get(id: number): Promise<Topic | null> {
        return Topic.findByPk(id);
    }



}
