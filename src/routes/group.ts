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
import { param } from "express-validator";

const config = require('../config/config');
const express = require('express');
const roomRouter = require('./room');
const router = express.Router();
const util: Util = new Util();

router.get(
    '/',
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    (request: any, response: Response, next: NextFunction) => {
        const groupService: GroupService = new GroupService();

        const userId: number = parseInt(request.auth.id);
        groupService.getGroupList(userId, [ 'id', 'name', 'target_id' ]).then((groups: Group[] | null) => {
            if (!groups) {
                return response.status(500).json({
                    name: 'UNKNOWN_ERROR',
                    message: 'Sorry something went wrong. Please try again.',
                });
            }

            response.status(200).json({
                groups,
            });
        });

});

router.get(
    '/:id',
    util.validate([
        param('id').isString(),
    ]),
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    util.requirePermission(AttendeeType.GROUP, AttendeePermission.MEMBER),
    (request: any, response: Response, next: NextFunction) => {
        const groupService: GroupService = new GroupService();

        const id: string = request.params.id;

        groupService.get(id).then((group: Group | null) => {
            response.status(200).json({
                group,
            });
        });

    });


router.use('/:group_id/room', roomRouter);

module.exports = router;
