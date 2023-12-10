import {
    NextFunction,
    Response,
} from "express";
import {
    param,
} from "express-validator";
import { expressjwt } from "express-jwt";
import { Util } from "../core/util";
import {
    AttendeePermission,
    AttendeeType,
} from "../core/type";
import { SpaceService } from "../service/SpaceService";
import { Space } from "../model/Space";

const config = require('../config/config');
const express = require('express');
const router = express.Router({ mergeParams: true });
const util: Util = new Util();

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

            const spaceService: SpaceService = new SpaceService();
            const id: number = parseInt(req.params.id, 10);

            return spaceService.get(id).then((space: Space) => {
                if (!space) {
                    return res.status(404).json({errors: [{msg: 'Space not found'}]});
                }

                return res.status(200).json(space);
            });
    
    
        });


module.exports = router;
