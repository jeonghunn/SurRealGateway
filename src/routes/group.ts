import {
    NextFunction,
    Response
} from "express";
import jwt from "express-jwt";
import { Util } from "../core/util";
import { GroupController } from "../controller/GroupController";
import { Group } from "../model/Group";

const config = require('../config/config');
const express = require('express');
const router = express.Router();
const util: Util = new Util();

router.get(
    '/',
    jwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    (request: any, response: Response, next: NextFunction) => {
        const groupController: GroupController = new GroupController();

        const userId: number = parseInt(request.user.id);
        groupController.getGroupList(userId, [ 'id', 'name', 'target_id' ]).then((groups: Group[]) => {
            response.status(200).json({
                groups,
            });
        });

});


module.exports = router;
