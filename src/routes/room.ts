import {
    NextFunction,
    Response,
} from "express";
import { RoomService } from "../service/RoomService";
import { expressjwt } from "express-jwt";
import { Util } from "../core/util";
import { Room } from "../model/Room";
import {
    param,
    query,
} from "express-validator";
import {
    AttendeePermission,
    AttendeeType,
} from "../core/type";
import { AttendeeService } from "../service/AttendeeService";
import { ChatService } from "../service/ChatService";
import { Chat } from "../model/Chat";
import { ClientService } from "../service/ClientService";
import { FirebaseService } from "../service/FirebaseService";

const config = require('../config/config');
const express = require('express');
const topicRouter = require('./topic');
const router = express.Router({ mergeParams: true });
const util: Util = new Util();
const roomService: RoomService = new RoomService();

router.post(
    '/',
    util.validate([
        param('group_id').isInt(),
    ]),
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    util.requirePermission(AttendeeType.GROUP, AttendeePermission.MEMBER),
    (request: any, response: Response, next: NextFunction) => {

        const ipAddress: string = util.getIPAddress(request);
        const groupId: number = request.params.group_id;
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
        param('group_id').isInt(),
    ]),
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    util.requirePermission(AttendeeType.GROUP, AttendeePermission.MEMBER),
    (request: any, response: Response, next: NextFunction) => {
        const roomService: RoomService = new RoomService();
        const attendeeService: AttendeeService = new AttendeeService();
        const clientService: ClientService = new ClientService();
        const firebaseService: FirebaseService = new FirebaseService();

        const id: number = parseInt(request.params.id);
        const groupId: number = parseInt(request.params.group_id)
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
        param('group_id').isInt(),
        query('offset').isInt(),
        query('limit').isInt(),
    ]),
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    util.requirePermission(AttendeeType.GROUP, AttendeePermission.MEMBER),
    (request: any, response: Response, next: NextFunction) => {
        const chatService: ChatService = new ChatService();

        const id: number = parseInt(request.params.id);
        const offset: number = parseInt(request.query.offset);
        const limit: number = parseInt(request.query.limit);
        const future: boolean = parseInt(request.query.future) === 1;
        const date: Date = request.query.date ? new Date(parseInt(request.query.date) * 1000) : new Date();

        chatService.getList(id, date, offset, limit, future).then((chats: Chat[]) => {
            chats.reverse();
            response.status(200).json({
                room_id: id,
                chats,
            });
        });

    });


router.get(
    '/',
    util.validate([
        param('group_id').isInt(),
        query('offset').isInt(),
        query('limit').isInt(),
    ]),
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    util.requirePermission(AttendeeType.GROUP, AttendeePermission.MEMBER),
    (request: any, response: Response, next: NextFunction) => {

        const groupId: number = parseInt(request.params.group_id);
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

module.exports = router;
