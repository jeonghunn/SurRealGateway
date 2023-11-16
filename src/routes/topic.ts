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

const config = require('../config/config');
const express = require('express');
const router = express.Router({ mergeParams: true });
const util: Util = new Util();

router.post(
    '/chat/:chat_id',
    util.validate([
        param('group_id').isInt(),
        param('room_id').isInt(),
        param('chat_id').isInt(),
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
    const chatId: number = parseInt(req.params.chat_id, 10);

    return chatService.get(chatId).then((chat: Chat) => {
        const roomId: number = chat ? parseInt(req.params.room_id, 10): 0;
        console.log("chat", chat);
        if (!chat || chat.room_id !== roomId) {
            return res.status(404).json({errors: [{msg: 'Chat not found'}]});
        }

        return topicService.create(
            req.body.name,
            roomId,
            req.body.parent_id,
            req.body.category,
            chat.id,
            userId,
            req.body.meta,
            ).then((topic: Topic) => {
                console.log("topic", topic);
                return res.status(200).json(topic);
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
                userId,
                req.body.meta,
                ).then((topic: Topic) => {
                    return res.status(200).json(topic);
                });

            });
        });
    

    router.get(
        '/',
        (req: any, res: Response, next: NextFunction) => {

    
        return res.status(200).json({ 'hi': 'hi' });
    
        
    
        });


module.exports = router;
