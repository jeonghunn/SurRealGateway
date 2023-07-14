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

        if (request.file.size > config.attach.sizeLimit - 3) {
            return response.status(413).json(
                { message: 'File size is too big.'}
            );

        }

        const fileNameAndExtension: any = attachService.getFileNameAndExtension(request.file?.originalname);

        console.log('[File Upload]', request.file);

        return attachService.create({
            user_id: userId,
            room_id: request.body.room_id,
            name: fileNameAndExtension.name,
            extension: fileNameAndExtension.ext,
            binary_name: request.file?.filename,
            mimetype: request?.file?.mimetype,
            status: Status.NORMAL,
            type: attachService.getFileType(fileNameAndExtension.ext, request.file?.mimetype),
            size: request?.file?.size,
            ip_address: util.getIPAddress(request),
        }).then((attach: any) => { 
            return response.status(200).json({
                id: attach.id,
                name: attach.name,
                extension: attach.extension,
                binary_name: attach.binary_name,
                mimetype: attach.mimetype,
                type: attach.type,
                size: attach.size,
                status: attach.status,
                url: attachService.getUrl(attach),
            });
        });


        return response.status(500).json({});
});

router.get(
    '/:binary_name',
    (request: any, response: Response, next: NextFunction) => {
        const attachService: AttachService = new AttachService();
        const binaryName: string = request.params.binary_name;
        const width: number = parseInt(request.query.width);
        const height: number = parseInt(request.query.height);
        const prefer: string = request.query.prefer;

        console.log('prefer', prefer);


        return attachService.get(binaryName, width, height).then((attach: any) => {
            if (!attach) {
                return response.status(404).json({});
            }

            
            const filePath: string = attachService.getPath(attach, width, height, prefer);
            let extension: string = attach.extension;
            let mimetype: string = attach.mimetype;

            if (prefer === 'video/mp4') {
                extension = '.mp4';
                mimetype = 'video/mp4';
            }

            response.setHeader("Content-Type", mimetype);
            return response.status(200).download(filePath, `${attach.name}${extension}`);

        });

    });


router.get(
    '/:binary_name/info',
    (request: any, response: Response, next: NextFunction) => {
        const attachService: AttachService = new AttachService();
        const binaryName: string = request.params.binary_name;
        const width: number = parseInt(request.query.width);
        const height: number = parseInt(request.query.height);


        return attachService.get(binaryName, width, height).then((attach: any) => {
            if (!attach) {
                return response.status(404).json({});
            }

            return response.status(200).json({
                id: attach.id,
                name: attach.name,
                extension: attach.extension,
                binary_name: attach.binary_name,
                mimetype: attach.mimetype,
                type: attach.type,
                size: attach.size,
                status: attach.status,
                url: attachService.getUrl(attach),
            });
        });

    });



module.exports = router;
