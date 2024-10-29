import {
    NextFunction,
    Response,
} from "express";
import { util } from "../core/util";
import { param } from "express-validator";
import { expressjwt } from "express-jwt";
import { ChatService } from "../service/ChatService";
import { AttachService } from "../service/AttachService";
import { Chat } from "../model/Chat";
const express = require('express');
const router = express.Router();
const config = require('../config/config');

/* GET home page. */
router.get('/', function(req: Request, res: Response, next: NextFunction) {
    res.json({ title: `Welcome` });
});

router.get(
    '/chat/:id/refresh',
    util.validate([
        param('id').isString(),
    ]),
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    (request: any, response: Response, next: NextFunction) => {
        const chatService: ChatService = new ChatService();
        const attachService: AttachService = new AttachService();

        const chatId: string = request.params.id;

        return chatService.get(chatId).then((chat: Chat | null) => {

            if (!chat) {
                return response.status(404).json({
                    message: 'Chat not found.',
                });
            }

            const meta: any = chatService.getRefreshedMeta(attachService, chat.meta);

            return Chat.update({ meta: meta}, { where: { id: chatId } }).then(() => {
                return response.json({
                    message: 'Chat refreshed.',
                    meta: meta,
                });
            });

        });

    });


module.exports = router;
