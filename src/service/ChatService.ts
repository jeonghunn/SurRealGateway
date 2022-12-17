import {
    Status,
    UserStatus,
} from "../core/type";
import { Chat } from "../model/Chat";
import { Op } from "sequelize";
import { User } from "../model/User";

export class ChatService {

    public getList(roomId: number, before: Date, offset: number = 0, limit: number = 15): Promise<Chat[]> {
        return Chat.findAll(
            {
                attributes: [
                    'id',
                    'category',
                    'content',
                    'user_id',
                    'room_id',
                    'status',
                    'createdAt',
                    'updatedAt',
                ],
                where: {
                    status: Status.NORMAL,
                    room_id: roomId,
                    createdAt: {[Op.lte]: before},
                },
                include: {
                    model: User,
                    as: 'user',
                    required: false,
                    attributes: ['id', 'name'],
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

    public async save(chat: Chat): Promise<Chat> {
        return chat.save()
    }

}
