import {
    LiveMessage,
    Status,
    UserStatus,
} from "../core/type";
import { Chat } from "../model/Chat";
import { Op } from "sequelize";
import { User } from "../model/User";
import { AttachService } from "./AttachService";
import { Attach } from "../model/Attach";

export class ChatService {

    public getList(
        roomId: number,
        topicId: string | null,
        date: Date,
        offset: number = 0,
        limit: number = 15,
        isFuture: boolean = false,
        ): Promise<Chat[]> {

        return Chat.findAll(
            {
                attributes: [
                    'id',
                    'category',
                    'content',
                    'user_id',
                    'room_id',
                    'topic_id',
                    'status',
                    'meta',
                    'createdAt',
                    'updatedAt',
                ],
                where: {
                    status: Status.NORMAL,
                    room_id: roomId,
                    topic_id: topicId,
                    createdAt: {[isFuture ? Op.gt : Op.lte]: date},
                },
                include: {
                    model: User,
                    as: 'user',
                    required: false,
                    attributes: ['id', 'name', 'color'],
                    where: {
                        status: {[Op.ne]: UserStatus.REMOVED},
                    }

                },
                order: [
                    ['createdAt', 'DESC'],
                ],
                offset,
                limit,
            }
        )
    }


    public getRefreshedMeta(
        attachService: AttachService,
        meta: any,
    ): any {
        const attaches: any[] = [];
        
        meta?.attaches?.forEach((attach: any) => {
            attaches.push({
                urls: attachService.getUrls({
                    binary_name: attach.binary_name,
                } as Attach),
                binary_name: attach.binary_name,
                type: attach.type,
                name: attach.name,
                extension: attach.extension,
                mimetype: attach.mimetype,
                size: attach.size,
                status: attach.status,
            });

        });

        if(meta?.attaches) {
            meta.attaches = attaches;
        }

        return meta;
    }


    public get(id: string): Promise<Chat | null> {
        return Chat.findByPk(id);
    }

    public async save(chat: Chat): Promise<Chat> {
        return chat.save()
    }

}
