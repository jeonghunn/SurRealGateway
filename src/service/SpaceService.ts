import {
    ChatCategory,
    CommunicationType,
    LiveMessage,
    SpaceStatus,
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
        groupId: string,
        version: number,
        meta: string | null = null,
        status: SpaceStatus = SpaceStatus.NORMAL,
        topic_id: string | null = null,
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
                topic_id,
            }).catch((e) => {
                console.log('Error: create from SpaceService', e);
                return null;
            });
        }

    public get(id: number): Promise<Space | null> {
        return Space.findByPk(id);
    }

    public getByKey(key: string): Promise<Space | null> {
        return Space.findOne({
            where: {
                key,
                status: Status.NORMAL,
            },
            order: [
                ['version', 'DESC'],
                ['id', 'DESC'],
            ],
            limit: 1,
        });
    }

    public getByCategory(
        roomId: number,
        topicId: string,
        category: string,
        ): Promise<Space | null> {
        return Space.findOne({
            where: {
                room_id: roomId,
                topic_id: topicId,
                category,
                status: Status.NORMAL,
            },
            order: [
                ['updatedAt', 'DESC'],
            ],
            limit: 1,
        });
    }

    public add(
        category: string,
        userId: number,
        roomId: number,
        groupId: string,
        meta: string | null = null,
        status: SpaceStatus = SpaceStatus.NORMAL,
        title: string = '',
        content: string | null = null,
        topicId: string | null = null,
        ): Promise<Space | null> {
        return this.create(
            v4().toString(),
            category,
            title,
            content,
            userId,
            roomId,
            groupId,
            1,
            meta,
            status,
            topicId,
        );
    }

    public disableOldVersions(key: string): Promise<[ count: number ]> {
        return Space.update(
            {
                status: SpaceStatus.DEACTIVATED,
            },
            {
                where: {
                    key,
                    status: SpaceStatus.NORMAL,
                },
            },
        );
    }
}
