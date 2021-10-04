import {
    NextFunction,
    Response
} from "express";
import { RoomController } from "../controller/RoomController";
import jwt from "express-jwt";
import { Util } from "../core/util";
import { Room } from "../model/Room";
import { AttendeeController } from "../controller/AttendeeController";
import {
    body,
    query,
} from "express-validator";

const config = require('../config/config');
const express = require('express');
const router = express.Router();
const util: Util = new Util();
const roomController: RoomController = new RoomController();
const attendeeController: AttendeeController = new AttendeeController();

router.post(
    '/',
    util.validate([
        body('group_id').isInt(),
    ]),
    jwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    (request: any, response: Response, next: NextFunction) => {

    const ipAddress: string = util.getIPAddress(request);
    const groupId: number = request.body.group_id;
    const userId: number = parseInt(request.user.id);

        attendeeController.hasGroupPermission(userId, groupId).then((hasPermission: boolean) => {

            if (!hasPermission) {
                return response.status(403).json({
                    name: 'PERMISSION_DENIED',
                    message: 'Permission Denied.',
                });
            }

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


});

router.get(
    '/',
    util.validate([
        query('group_id').isInt(),
        query('offset').isInt(),
        query('limit').isInt(),
    ]),
    jwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    (request: any, response: Response, next: NextFunction) => {

        const userId: number = parseInt(request.user.id);
        const groupId: number = parseInt(request.query.group_id);
        const offset: number = parseInt(request.query.offset);
        const limit: number = parseInt(request.query.limit);

        attendeeController.hasGroupPermission(userId, groupId).then((hasPermission: boolean) => {

            if (!hasPermission) {
                return response.status(403).json({
                    name: 'PERMISSION_DENIED',
                    message: 'Permission Denied.',
                });
            }

            return roomController.getList(groupId, offset, limit).then((rooms: Room[]) => {
                return response.json({
                    rooms,
                });
            });
        });



    });


module.exports = router;
