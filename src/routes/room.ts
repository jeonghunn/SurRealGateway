import {
    NextFunction,
    Response
} from "express";
import { RoomController } from "../controller/RoomController";
import jwt from "express-jwt";
import { Util } from "../core/util";
import { Room } from "../model/room";

const config = require('../config/config');
const express = require('express');
const router = express.Router();
const util: Util = new Util();

router.post(
    '/',
    jwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    (request: any, response: Response, next: NextFunction) => {
    const roomController: RoomController = new RoomController();
    const ipAddress: string = util.getIPAddress(request);


        roomController.create(
            request.user.id,
            request.body.name,
            request.body.description,
            ipAddress,
            request.body.limit,
        ).then((room: Room) => {
            response.json(room);
        });

});


module.exports = router;
