import {
    Status,
    UserStatus,
} from "../core/type";
import { Chat } from "../model/Chat";
import { Op } from "sequelize";
import { User } from "../model/User";

export class ChatService {

    public getList(
        roomId: number,
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
                    'status',
                    'meta',
                    'createdAt',
                    'updatedAt',
                ],
                where: {
                    status: Status.NORMAL,
                    room_id: roomId,
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
                    ['id', 'DESC'],
                ],
                offset,
                limit,
            }
        )
    }

    public get(id: number): Promise<Chat | null> {
        return Chat.findByPk(id);
    }

    public async save(chat: Chat): Promise<Chat> {
        return chat.save()
    }

}
