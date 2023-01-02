import {
    NextFunction,
    Response
} from "express";
import { expressjwt } from "express-jwt";
import { Util } from "../core/util";
import {AttachService} from "../service/AttachService";
import {RoomService} from "../service/RoomService";
import {upload} from "../app";
import {AttendeePermission, AttendeeType, Status} from "../core/type";

const config = require('../config/config');
const express = require('express');
const router = express.Router();
const util: Util = new Util();

router.post(
    '/',
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    util.requirePermission(null, AttendeePermission.MEMBER),
    upload.single('attachment'),
    (request: any, response: Response, next: NextFunction) => {
        const attachService: AttachService = new AttachService();
        const roomService: RoomService = new RoomService();
        const userId: number = parseInt(request.auth?.id);

        if (!request.file) {
            return response.status(400).json(
                { message: 'No file attachment.'}
            );
        }

        const fileNameAndExtension: any = attachService.getFileNameAndExtension(request.file?.originalname);

        console.log('[File Upload]', request.file);

        attachService.create({
            user_id: userId,
            room_id: request.body.room_id,
            name: fileNameAndExtension.name,
            extension: fileNameAndExtension.ext,
            binary_name: request.file?.filename,
            mimetype: request?.file?.mimetype,
            status: Status.NORMAL,
            type: attachService.getFileType(fileNameAndExtension.ext),
            size: request?.file?.size,
            ip_address: util.getIPAddress(request),
        });


        return response.status(200).json({});
});


module.exports = router;
