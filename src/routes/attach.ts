import {
    NextFunction,
    Response
} from "express";
import { expressjwt } from "express-jwt";
import { Util } from "../core/util";
import {AttachService} from "../service/AttachService";
import {RoomService} from "../service/RoomService";

const config = require('../config/config');
const express = require('express');
let fileupload = require("express-fileupload");
const roomRouter = require('./room');
const router = express.Router();
const util: Util = new Util();

router.post(
    '/',
    fileupload(),
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    (request: any, response: Response, next: NextFunction) => {
        const attachService: AttachService = new AttachService();
        const roomService: RoomService = new RoomService();


        console.log(request.files?.attachment);

        return response.status(200).json({});
});


module.exports = router;
