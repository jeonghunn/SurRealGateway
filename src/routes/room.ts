import {
    NextFunction,
    Response,
} from "express";
import { RoomController } from "../controller/RoomController";
import jwt from "express-jwt";
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
import { AttendeeController } from "../controller/AttendeeController";
import { ChatController } from "../controller/ChatController";
import { Chat } from "../model/Chat";

const config = require('../config/config');
const express = require('express');
const router = express.Router({ mergeParams: true });
const util: Util = new Util();
const roomController: RoomController = new RoomController();

router.post(
    '/',
    util.validate([
        param('group_id').isInt(),
    ]),
    jwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    util.requirePermission(AttendeeType.GROUP, AttendeePermission.MEMBER),
    (request: any, response: Response, next: NextFunction) => {

        const ipAddress: string = util.getIPAddress(request);
        const groupId: number = request.params.group_id;
        const userId: number = parseInt(request.user.id);

        roomController.create(
            userId,
            groupId,
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
    jwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    (request: any, response: Response, next: NextFunction) => {
        const roomController: RoomController = new RoomController();
        const attendeeController: AttendeeController = new AttendeeController();

        const id: number = parseInt(request.params.id);
        const groupId: number = parseInt(request.params.group_id)
        const userId: number = parseInt(request.user.id);

        roomController.get(groupId, id).then((room: Room | null) => {
            attendeeController.create(AttendeeType.ROOM, userId, id, AttendeePermission.MEMBER);

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
    jwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    util.requirePermission(AttendeeType.GROUP, AttendeePermission.MEMBER),
    (request: any, response: Response, next: NextFunction) => {
        const chatController: ChatController = new ChatController();

        const id: number = parseInt(request.params.id);
        const offset: number = parseInt(request.query.offset);
        const limit: number = parseInt(request.query.limit);
        const before: Date = request.query.before ? new Date(parseInt(request.query.before) * 1000) : new Date();

        chatController.getList(id, before, offset, limit).then((chats: Chat[]) => {
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
    jwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    util.requirePermission(AttendeeType.GROUP, AttendeePermission.MEMBER),
    (request: any, response: Response, next: NextFunction) => {

        const groupId: number = parseInt(request.params.group_id);
        const offset: number = parseInt(request.query.offset);
        const limit: number = parseInt(request.query.limit);
        const before: Date = request.query.before ? new Date(parseInt(request.query.before) * 1000) : new Date();

        return roomController.getList(
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


module.exports = router;
