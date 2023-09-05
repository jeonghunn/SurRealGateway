import {
    NextFunction,
    Response
} from "express";
import { expressjwt } from "express-jwt";
import { Util } from "../core/util";
import { GroupService } from "../service/GroupService";
import { Group } from "../model/Group";
import {
    AttendeePermission,
    AttendeeType,
} from "../core/type";
import { ClientService } from "../service/ClientService";
import { FirebaseService } from "../service/FirebaseService";
import { body, param } from "express-validator";
import { AttendeeService } from "../service/AttendeeService";
import { Client } from "../model/Client";

const config = require('../config/config');
const express = require('express');
const roomRouter = require('./room');
const router = express.Router();
const util: Util = new Util();


router.post(
    '/',
    util.validate([
        body('token').isString(),
        !body('key').isEmpty() || body('key').isString(),
    ]),
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    (request: any, response: Response, next: NextFunction) => {

        const clientService: ClientService = new ClientService();
        const firebaseService: FirebaseService = new FirebaseService();
        const attendeeService: AttendeeService = new AttendeeService();

        const ipAddress: string = util.getIPAddress(request);
        const userAgent: string = util.getUserAgent(request);
        const userId: number = parseInt(request.auth.id);

        clientService.add(
            request.body.key,
            userId,
            ipAddress,
            userAgent,
            request.body.token,
        ).then((result: [Client, boolean]) => {
            const client: Client = result[0];
            response.json(client);

            if (!result[1]) {
                return;
            }

            attendeeService.getList(AttendeeType.GROUP, userId).then((attendeeIds: any) => {
                attendeeIds.forEach((attendeeId: any) => {
                    firebaseService.subscribeToGroup(attendeeId, [client.token]);
                });
            });
            
        });

    });
    

module.exports = router;
