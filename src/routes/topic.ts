import {
    NextFunction,
    Response,
} from "express";
import { UserService } from "../service/UserService";
import {
    body,
    param,
    validationResult,
} from "express-validator";
import { User } from "../model/User";
import { expressjwt } from "express-jwt";
import { Util } from "../core/util";
import {RelationService} from "../service/RelationService";
import { Relation } from "../model/Relation";
import {
    AttendeePermission,
    AttendeeType,
    RelationCategory,
    RelationStatus,
} from "../core/type";
import {GroupService} from "../service/GroupService";
import { ChatService } from "../service/ChatService";
import { Chat } from "../model/Chat";
import { TopicService } from "../service/TopicService";
import { Topic } from "../model/Topic";
import { LiveRoomService } from "../service/LiveRoomService";
import { liveRoomService } from "../bin/www";
import { RoomService } from "../service/RoomService";
import { Room } from "../model/Room";

const config = require('../config/config');
const express = require('express');
const router = express.Router({ mergeParams: true });
const util: Util = new Util();

router.post(
    '/chat/:chat_id',
    util.validate([
        param('group_id').isInt(),
        param('room_id').isInt(),
        param('chat_id').isString(),
    ]),
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    util.requirePermission(AttendeeType.GROUP, AttendeePermission.MEMBER),
    (req: any, res: Response, next: NextFunction) => {
    const roomService: RoomService = new RoomService();
    const chatService: ChatService = new ChatService();
    const topicService: TopicService = new TopicService();
    const errors: any = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
    
    const groupId: number = parseInt(req.params.group_id, 10);
    const userId: number = parseInt(req.auth.id);
    const chatId: string = req?.params?.chat_id;

    return chatService.get(chatId).then((chat: Chat) => {
        const roomId: number = chat ? parseInt(req.params.room_id, 10): 0;
        console.log("chat", chat);
        if (!chat || chat.room_id !== roomId) {
            return res.status(404).json({errors: [{msg: 'Chat not found'}]});
        }

        topicService.getByChatId(chat.id).then((existTopic: Topic) => {
            if (existTopic) {
                return res.status(200).json(existTopic);
            }
            
            roomService.get(groupId, roomId).then((room: Room) => {
                return topicService.add(
                    liveRoomService,
                    req.body.name,
                    room,
                    chat.topic_id,
                    req.body.category,
                    chat.id,
                    userId,
                    req.body.meta,
                    ).then((topic: Topic) => {
                        return res.status(200).json(topic);
                    });
            });
            
        });


        });
    });


    router.post(
        '/',
        util.validate([
            param('group_id').isInt(),
            param('room_id').isInt(),
            body('topic_id').isInt().optional({ nullable: true }),
        ]),
        expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
        util.requirePermission(AttendeeType.GROUP, AttendeePermission.MEMBER),
        (req: any, res: Response, next: NextFunction) => {
        const userService: UserService = new UserService();
        const chatService: ChatService = new ChatService();
        const topicService: TopicService = new TopicService();
        const errors: any = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        
        const userId: number = parseInt(req.auth.id);
        const topicId: number | null = parseInt(req.body.topic_id, 10) || null;
        const roomId: number = parseInt(req.params.room_id, 10);

        if (!topicId) {

            return topicService.create(
                req.body.name,
                roomId,
                null,
                req.body.category,
                null,
                userId,
                req.body.meta,
                ).then((topic: Topic) => {
                    return res.status(200).json(topic);
                }
            )

        }
    
        return topicService.get(topicId).then((parentTopic: Topic) => {
            if (!parentTopic) {
                return res.status(404).json({errors: [{msg: 'Topic not found'}]});
            }

            return topicService.create(
                req.body.name,
                roomId,
                topicId,
                req.body.category,
                null,
                userId,
                req.body.meta,
                ).then((topic: Topic) => {
                    return res.status(200).json(topic);
                });

            });
        });
    

    router.get(
        '/:id',
        util.validate([
            param('id').isInt(),
            param('group_id').isInt(),
            param('room_id').isInt(),
        ]),
        expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
        util.requirePermission(AttendeeType.GROUP, AttendeePermission.MEMBER),
        (req: any, res: Response, next: NextFunction) => {

            const topicService: TopicService = new TopicService();
            const id: number = parseInt(req.params.id, 10);

            return topicService.get(id).then((topic: Topic) => {
                if (!topic) {
                    return res.status(404).json({errors: [{msg: 'Topic not found'}]});
                }

                return res.status(200).json(topic);
            });
    
    
        });


module.exports = router;
