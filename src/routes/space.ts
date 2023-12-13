import {
    NextFunction,
    Response,
} from "express";
import {
    body,
    param,
    validationResult,
} from "express-validator";
import { expressjwt } from "express-jwt";
import { Util } from "../core/util";
import {
    AttendeePermission,
    AttendeeType,
    CommunicationType,
    LiveMessage,
} from "../core/type";
import { SpaceService } from "../service/SpaceService";
import { Space } from "../model/Space";
import { liveRoomService } from "../bin/www";

const config = require('../config/config');
const express = require('express');
const router = express.Router({ mergeParams: true });
const util: Util = new Util();

    router.get(
        '/:key',
        util.validate([
            param('key').isString(),
            param('group_id').isInt(),
            param('room_id').isInt(),
        ]),
        expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
        util.requirePermission(AttendeeType.GROUP, AttendeePermission.MEMBER),
        (req: any, res: Response, next: NextFunction) => {

            const spaceService: SpaceService = new SpaceService();
            const key: string = req.params.key;

            return spaceService.getByKey(key).then((space: Space) => {
                if (!space) {
                    return res.status(404).json({errors: [{msg: 'Space not found'}]});
                }

                return res.status(200).json(space);
            });
    
    
        });


    router.post(
        '/:key',
        util.validate([
            param('group_id').isInt(),
            param('room_id').isInt(),
            body('based_version').isInt(),
            param('key').isString(),
        ]),
        expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
        util.requirePermission(AttendeeType.GROUP, AttendeePermission.MEMBER),
        (req: any, res: Response, next: NextFunction) => {

        const spaceService: SpaceService = new SpaceService();

        const errors: any = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({errors: errors.array()});
        }
        
        const userId: number = parseInt(req.auth.id);
        const key: string = req.params.key;
        const roomId: number = parseInt(req.params.room_id, 10);
        const groupId: number = parseInt(req.params.room_id, 10);
        const basedVersion: number = parseInt(req.body.based_version, 10);

        return spaceService.getByKey(key).then((space: Space) => {
            if (!space) {
                return res.status(404).json({errors: [{msg: 'Space not found'}]});
            }

            if (space.version > basedVersion) {
                return res.status(406).json({errors: [{msg: 'Version Conflict'}]});
            }

            return spaceService.create(
                key,
                space.category,
                req.body.title,
                req.body.content,
                userId,
                roomId,
                groupId,
                basedVersion + 1,
            ).then((result: Space) => {

                const liveMessage: LiveMessage = new LiveMessage();
                liveMessage.T = CommunicationType.LIVE;
                liveMessage.content = result.version;

                liveRoomService.sendSocketMessageToRoom(key, JSON.stringify(liveMessage), true);
                return res.status(200).json(space);
            }).catch((err: any) => {
                return res.status(406).json({errors: [{msg: 'Version Conflict'}]});
            });

        });
    });

module.exports = router;
