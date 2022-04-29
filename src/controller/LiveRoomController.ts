import {
    ChatMessage,
} from "../core/type";

const config = require('../config/config');

export class LiveRoomController {

    public rooms: any = new Map();

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

    public send(id: number, chatMessage: ChatMessage): void {
        this.rooms?.get(id).forEach((user: any) => {
            user?.socket?.send(JSON.stringify(chatMessage));
        });
    }

    public close(id: number, userId: number, socket: any): void {

    }



}
