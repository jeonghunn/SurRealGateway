import {
    ChatCategory,
    CommunicationType,
    LiveMessage,
    Status,
    TopicCategory,
} from "../core/type";
import { ChatService } from "./ChatService";
import { Chat } from "../model/Chat";
import { FirebaseService } from "./FirebaseService";
import { Room } from "../model/Room";
import { Topic } from "../model/Topic";
import { v4 } from 'uuid';
import { ClientService } from "./ClientService";
import { TopicService } from "./TopicService";
import { util } from "../core/util";

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


    public send(
        clientService: ClientService,
        topicService: TopicService,
        id: number,
        message: LiveMessage,
        room: Room = null,
        topicId: string | null = null,
        ): void {

        switch (message.T) {
            case CommunicationType.CHAT:
                this.sendChat(
                    clientService,
                    topicService,
                    id,
                    message,
                    room,
                    topicId,
                );
                break;
            case CommunicationType.LIVE:
                this.sendSocketMessageToRoom(id, message.content, true);
                console.log("Live Message", message.content);
                break;
        }

    }

    public sendChat(
        clientService: ClientService,
        topicService: TopicService,
        id: number,
        message: LiveMessage,
        room: Room,
        topicId: string | null = null,
    ) {
        const chatId: string = util.getUUID();
        message.id = chatId;
        message.category = message.category || ChatCategory.MESSAGE;

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


        if (message?.meta?.reply_to) {
             topicService.add(
                this,
                clientService,
                null,
                room,
                topicId,
                TopicCategory.REPLY,
                message?.meta?.reply_to,
                message.user?.id!!,
             ).then((topic: Topic | null) => {
                    if (topic) {
                        message.topic_id = topic.id;
                        chat.topic_id = topic.id;
                        this.postChat(clientService, id, message, room, chat);
                    }
                });
    
            return;
        }

        this.postChat(clientService, id, message, room, chat);
    }

    public postChat(
        clientService: ClientService,
        id: number,
        message: LiveMessage,
        room: Room,
        chat: Chat,
    ): void {
        this.sendSocketMessageToRoom(id, JSON.stringify(message), false);
        this.chatService.save(chat);
        this.sendNotification(
            room.group_id,
            room,
            message,
            [],
            chat.user_id,
            clientService,
        );
    }


    public sendNotification(
        groupId: string,
        room: Room,
        message: LiveMessage,
        tokens: string[] = [],
        excludedUserId: number = null,
        clientService: ClientService = null,
    ): void {
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
        
        if (!(tokens?.length >= 1) && clientService) {
            clientService.getAttendeeTokens(groupId, excludedUserId).then((attendeeTokens: string[]) => {
                if (attendeeTokens.length === 0) {
                    return;
                }
                
                this.firebaseService.sendPushMultiple(attendeeTokens, title, body, url, message);
            });
            return;

        }

        this.firebaseService.sendPushMultiple(tokens, title, body, url, message);
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
