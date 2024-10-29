import {
    NextFunction,
    Response,
} from "express";
import { RoomService } from "../service/RoomService";
import { AiService } from "../service/AiService";
import { expressjwt } from "express-jwt";
import { Room } from "../model/Room";
import {
    param,
    query,
} from "express-validator";
import {
    AttendeePermission,
    AttendeeType,
    SpaceStatus,
} from "../core/type";
import { AttendeeService } from "../service/AttendeeService";
import { ChatService } from "../service/ChatService";
import { Chat } from "../model/Chat";
import { ClientService } from "../service/ClientService";
import { FirebaseService } from "../service/FirebaseService";
import { SpaceService } from "../service/SpaceService";
import { AttachService } from "../service/AttachService";
import { util } from "../core/util";

const config = require('../config/config');
const express = require('express');
const topicRouter = require('./topic');
const spaceRouter = require('./space');
const router = express.Router({ mergeParams: true });
const roomService: RoomService = new RoomService();

router.post(
    '/',
    util.validate([
        param('group_id').isString(),
    ]),
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    util.requirePermission(AttendeeType.GROUP, AttendeePermission.MEMBER),
    (request: any, response: Response, next: NextFunction) => {

        const ipAddress: string = util.getIPAddress(request);
        const groupId: string = request.params.group_id;
        const userId: number = parseInt(request.auth.id);

        roomService.create(
            userId,
            groupId,
            request.body.letter,
            request.body.name,
            request.body.description,
            ipAddress,
            request.body.limit,
        ).then((room: Room) => {
            response.json(room);
        });

    });


router.get(
    '/:id',
    util.validate([
        param('id').isInt(),
        param('group_id').isString(),
    ]),
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    util.requirePermission(AttendeeType.GROUP, AttendeePermission.MEMBER),
    (request: any, response: Response, next: NextFunction) => {
        const roomService: RoomService = new RoomService();
        const attendeeService: AttendeeService = new AttendeeService();
        const clientService: ClientService = new ClientService();
        const firebaseService: FirebaseService = new FirebaseService();

        const id: number = parseInt(request.params.id);
        const groupId: string = request.params.group_id;
        const userId: number = parseInt(request.auth.id);

        roomService.get(groupId, id).then((room: Room | null) => {
            attendeeService.add(
                AttendeeType.ROOM,
                userId,
                id,
                AttendeePermission.MEMBER,
                firebaseService,
                clientService,
                );

            response.status(200).json({
                room,
            });
        });

    });


router.get(
    '/:id/chat',
    util.validate([
        param('id').isInt(),
        param('group_id').isString(),
        query('topic_id').isInt().optional({ nullable: true }),
        query('offset').isInt(),
        query('limit').isInt(),
    ]),
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    util.requirePermission(AttendeeType.GROUP, AttendeePermission.MEMBER),
    (request: any, response: Response, next: NextFunction) => {
                const chatService: ChatService = new ChatService();

        const id: number = parseInt(request.params.id);
        const topicId: number | null = request.query.topic_id ? parseInt(request.query.topic_id) : null;
        const offset: number = parseInt(request.query.offset);
        const limit: number = parseInt(request.query.limit);
        const future: boolean = parseInt(request.query.future) === 1;
        const date: Date = request.query.date ? new Date(parseFloat(request.query.date) * 1000) : new Date();
        
        chatService.getList(
            id,
            topicId,
            date,
            offset,
            limit,
            future,
            ).then((chats: Chat[]) => {
            chats.reverse();
            response.status(200).json({
                room_id: id,
                chats,
            });
            });


    });

router.get(
        '/:id/summary',
        util.validate([
            param('group_id').isString(),
            query('offset').isInt(),
            query('limit').isInt(),
            query('force').isBoolean().optional({ nullable: true }),
        ]),
        
        (request: any, response: Response, next: NextFunction) => {
            const chatService: ChatService = new ChatService();
            const spaceService: SpaceService = new SpaceService();
            const aiService: AiService = new AiService();

            const id: number = parseInt(request.params.id);
            const topicId: number | null = request.query.topic_id ? parseInt(request.query.topic_id) : null;
            const offset: number = parseInt(request.query.offset);
            const limit: number = parseInt(request.query.limit);
            const future: boolean = parseInt(request.query.future) === 1;
            const date: Date = request.query.date ? new Date(parseInt(request.query.date) * 1000) : new Date();
            const isForce: boolean = request.query.force === 'true';

            return spaceService.getByCategory(isForce ? 0 : id, topicId, 'summary').then((space: any) => {
                if (space) {
                    return response.status(200).json({
                        spaceKey: space.key,
                    });
                }
            
                return chatService.getList(id, topicId, date, offset, limit, future).then((chats: Chat[]) => {
                    const chatContents: string[] = chats.map(chat => `${chat?.user?.name}: ${chat.content} `);
                    return aiService.getChatGPTAnswer(
                       chatContents.reverse().join('\n')
                    ).then((aiResponse: string) => {
                        const title: string = aiResponse.split('\n')[0];
                        const content: string = aiResponse.split('\n').slice(1).join('\n');

                        return spaceService.add(
                            'summary',
                            null,
                            id,
                            null,
                            null,
                            SpaceStatus.NORMAL,
                            title,
                            content,
                            topicId,
                        ).then((space: any) => {
                            return response.status(200).json({
                                spaceKey: space.key,
                            });
                        });

                    });

                });
        });

    });
    

router.get(
    '/',
    util.validate([
        param('group_id').isString(),
        query('offset').isInt(),
        query('limit').isInt(),
    ]),
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    util.requirePermission(AttendeeType.GROUP, AttendeePermission.MEMBER),
    (request: any, response: Response, next: NextFunction) => {

        const groupId: string = request.params.group_id;
        const offset: number = parseInt(request.query.offset);
        const limit: number = parseInt(request.query.limit);
        const before: Date = request.query.before ? new Date(parseInt(request.query.before) * 1000) : new Date();

        return roomService.getList(
            groupId,
            before,
            offset,
            limit,
            ).then((rooms: Room[]) => {
            return response.json({
                rooms,
            });
        });
    });

router.use('/:room_id/topic', topicRouter);
router.use('/:room_id/space', spaceRouter);

module.exports = router;
