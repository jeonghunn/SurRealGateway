import {
    CommunicationType,
    LiveMessage,
    Status,
} from "../core/type";
import { ChatService } from "./ChatService";
import { Chat } from "../model/Chat";
import { FirebaseService } from "./FirebaseService";
import { Room } from "../model/Room";
import { Topic } from "../model/Topic";
import { v4 } from 'uuid';

const config = require('../config/config');

export class LiveRoomService {

    public rooms: any = new Map();
    private chatService: ChatService = new ChatService();
    private firebaseService: FirebaseService = new FirebaseService();

    public join(
        id :number,
        userId: number,
        socket: any,
        topicId: number | null = null,
        ): void {
        let liveRoom: any = this.rooms.get(id);

        if(!liveRoom) {
            liveRoom = this.create(id);
        }

        console.log(liveRoom);

        liveRoom.push(
            {
                id,
                userId,
                topic: topicId,
                socket,
            }
        );
    }

    public create(id: number): any[] {
        return this.rooms.set(id, []).get(id);
    }

    public getUUID(): string {
        const tokens: string[] = v4().split('-');
        return tokens[2] + tokens[1] + tokens[0] + tokens[3] + tokens[4];
    }


    public send(
        id: number,
        message: LiveMessage,
        room: Room = null,
        topicId: number | null = null,
        ): void {

        switch (message.T) {
            case CommunicationType.CHAT:
                const chatId: string = this.getUUID();
                message.id = chatId;

                this.sendSocketMessageToRoom(id, JSON.stringify(message), topicId);

                const chat: Chat = new Chat();

                chat.id = chatId;
                chat.user_id = message.user?.id!!;
                chat.createdAt = message.createdAt!!;
                chat.room_id = id;
                chat.topic_id = topicId;
                chat.content = message.content!!;
                chat.status = Status.NORMAL;
                chat.meta = message.meta;

                this.chatService.save(chat);
                this.sendNotification(room.group_id, room, message);
                break;
            case CommunicationType.LIVE:
                this.sendSocketMessageToRoom(id, message.content);
                console.log("Live Message", message.content);
                break;
        }

    }

    public sendNotification(
        groupId: number,
        room: Room,
        message: LiveMessage,
    ): void {
        console.log('group', room?.group);
        let title: string = `${room?.name} - ${room?.group?.name!!}`;
        let body: string = `${message.user?.name!!}\n${message.content}`;
        let url: string = config.frontUrl + `/group/${groupId}/room/${room?.id}`;


        if (room?.group?.target_id)  {
            title = message.user?.name!!;
            body = message.content;
        }

        this.firebaseService.sendNotificationToTopic(room.group_id, title, body, url, message);
    }

    public sendSocketMessageToRoom(
        id: number,
        content: any,
        topicId: number | null = null,
        ): void {
        this.rooms?.get(id).forEach((user: any) => {
            user?.socket?.send(content);
        });

    }

    public close(id: number, userId: number, socket: any): void {
        console.log(`Live Left: ID: ${id}, User: ${userId}`);

       this.rooms?.get(id)?.splice(this.rooms?.get(id).findIndex((liveUser: any) => {
            return (liveUser.userId === userId && liveUser.socket === socket);
        }), 1);
    }



}
