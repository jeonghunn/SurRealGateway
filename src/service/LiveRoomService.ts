import {
    ChatCategory,
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
    public spaces: any = new Map();
    private chatService: ChatService = new ChatService();
    private firebaseService: FirebaseService = new FirebaseService();
    private isLocked: number = 0;

    public getLiveListInstance(isSpace: boolean): any {
        return isSpace ? this.spaces : this.rooms;
    }


    public join(
        id: number | string,
        userId: number,
        socket: any,
        isSpace: boolean = false,
        ): void {
        this.isLocked++;
        

        let currentRoom: any = this.getLiveListInstance(isSpace).get(id);

        if(!currentRoom) {
            currentRoom = this.create(id, isSpace);
        }

        currentRoom.push(
            {
                id,
                userId,
                socket,
            }
        );

        this.isLocked--;
    }

    public create(id: number | string, isSpace: boolean = false): any[] {
        return this.getLiveListInstance(isSpace).set(id, []).get(id);
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
                message.category = message.category || ChatCategory.MESSAGE;

                this.sendSocketMessageToRoom(id, JSON.stringify(message), false);

                const chat: Chat = new Chat();

                chat.id = chatId;
                chat.category = message.category;
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
                this.sendSocketMessageToRoom(id, message.content, true);
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

        if (message?.topic_id) {
            url += `/topic/${message.topic_id}`;
        }

        if (room?.group?.target_id)  {
            title = message.user?.name!!;
            body = message.content;
        }

        this.firebaseService.sendNotificationToTopic(room.group_id, title, body, url, message);
    }

    public sendSocketMessageToRoom(
        id: number | string,
        content: any,
        isSpace: boolean = false,
        ): void {

        this.getLiveListInstance(isSpace)?.get(id)?.forEach((user: any) => {
            this.sendSocketMessageToUser(user, content);
        });

    }

    public sendSocketMessageToUser(user: any, content: any, retry: number = 0): void {
        user?.socket?.send(content);
    }

    public close(
        id: number,
        userId: number,
        socket: any,
        isSpace: boolean = false,
        ): void {
        console.log(`Live Left (${isSpace ? 'Space' : 'Chat'}): ID: ${id}, User: ${userId}`);

        const currentRoom: any = this.getLiveListInstance(isSpace).get(id);

        if (currentRoom && this.isLocked === 0) {
            console.log('Cleaning Dead Sockets');
            this.getLiveListInstance(isSpace).set(id, currentRoom.filter((user: any) => {
                return user?.socket?.readyState === 1;
            }));
        }
    }



}
