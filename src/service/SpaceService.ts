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
import { ChatService } from "./ChatService";
import { LiveRoomService } from "./LiveRoomService";
import { Room } from "../model/Room";
import { Space } from "../model/Space";
import { v4 } from "uuid";

export class SpaceService {

    public async save(space: Space): Promise<Space> {
        return space.save();
    }

    public create(
        key: string,
        category: string,
        title: string,
        content: string | null,
        userId: number,
        roomId: number,
        groupId: number,
        version: number,
        meta: string | null = null,
        status: Status = Status.NORMAL,
        ): Promise<Space> {
            return Space.create({
                key,
                category,
                title,
                content,
                user_id: userId,
                room_id: roomId,
                group_id: groupId,
                version,
                meta,
                status,
            }).catch((e) => {
                console.log('Error: create from SpaceService', e);
                return null;
            });
        }

    public get(id: number): Promise<Space | null> {
        return Space.findByPk(id);
    }

    public add(
        category: string,
        userId: number,
        roomId: number,
        groupId: number,
        meta: string | null = null,
        status: Status = Status.NORMAL,
        ): Promise<Space | null> {
        return this.create(
            v4().toString(),
            category,
            null,
            null,
            userId,
            roomId,
            groupId,
            1,
            meta,
            status,
        );
    }
}
