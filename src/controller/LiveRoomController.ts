import {
    CommunicationType,
    LiveMessage,
    Status,
} from "../core/type";
import { ChatController } from "./ChatController";
import { Chat } from "../model/Chat";

const config = require('../config/config');

export class LiveRoomController {

    public rooms: any = new Map();
    private chatController: ChatController = new ChatController();

    public join(id :number, userId: number, socket: any): void {
        let liveRoom: any = this.rooms.get(id);

        if(!liveRoom) {
            liveRoom = this.create(id);
        }

        console.log(liveRoom);

        liveRoom.push(
            {
                id,
                userId,
                socket,
            }
        );
    }

    public create(id: number): any[] {
        return this.rooms.set(id, []).get(id);
    }

    public send(id: number, message: LiveMessage): void {
        this.rooms?.get(id).forEach((user: any) => {
            user?.socket?.send(JSON.stringify(message));
        });

        if (message.T === CommunicationType.CHAT) {
            const chat: Chat = new Chat();

            chat.user_id = message.user?.id!!;
            chat.createdAt = message.createdAt!!;
            chat.room_id = id;
            chat.content = message.content!!;
            chat.status = Status.NORMAL;

            this.chatController.save(chat);
        }
    }

    public close(id: number, userId: number, socket: any): void {
        console.log(`Live Left: ID: ${id}, User: ${userId}`);

       this.rooms?.get(id)?.splice(this.rooms?.get(id).findIndex((liveUser: any) => {
            return (liveUser.userId === userId && liveUser.socket === socket);
        }), 1);
    }



}
