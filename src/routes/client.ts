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

const config = require('../config/config');
const express = require('express');
const roomRouter = require('./room');
const router = express.Router();
const util: Util = new Util();


router.post(
    '/',
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    (request: any, response: Response, next: NextFunction) => {

        const clientService: ClientService = new ClientService();
        const firebaseService: FirebaseService = new FirebaseService();

        const ipAddress: string = util.getIPAddress(request);
        const userAgent: string = util.getUserAgent(request);
        const userId: number = parseInt(request.auth.id);

        clientService.add(
            userId,
            ipAddress,
            userAgent,
            request.body.token,
        ).then((client: any) => {
            response.json(client);
        });

    });
    

module.exports = router;
