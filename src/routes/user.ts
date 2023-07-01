import {
    NextFunction,
    Response,
} from "express";
import { UserService } from "../service/UserService";
import {
    body,
    param,
    validationResult,
} from "express-validator";
import { User } from "../model/User";
import { expressjwt } from "express-jwt";
import { Util } from "../core/util";
import {RelationService} from "../service/RelationService";
import { Relation } from "../model/Relation";
import {
    RelationCategory,
    RelationStatus,
} from "../core/type";
import {GroupService} from "../service/GroupService";

const config = require('../config/config');
const express = require('express');
const router = express.Router();
const util: Util = new Util();

router.post(
    '/',
    util.validate([
        body('email').isEmail(),
        body('password').isLength({ min: 5 }),
    ]),
    (req: any, res: Response, next: NextFunction) => {
    const userService: UserService = new UserService();
    const errors: any = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    userService.isEmailDuplicate(req.body.email).then(isEmailDuplicated => {
        if (isEmailDuplicated) {
            res.status(409);
            res.json({message: "duplicated account."});
            return;
        }

        userService.signUp(
            req.body.email,
            req.body.password,
            req.body.name,
            req.body.last_name,
            req.body.gender,
        ).then((user: User) => {
            const token: string = userService.createToken(user.id, null, user.email, user.name);

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            res.cookie('Authorization', 'Bearer' + ' ' + token, userService.authCookieOptions);

            res.json({
                user_id: user.id,
                token: token,
            });
        });
    });


});

router.post(
    '/signin',
    util.validate([
        body('email').isEmail(),
        body('password').isLength({ min: 5 }),
    ]),
    (request: any, response: Response, next: NextFunction) => {
        const userService: UserService = new UserService();
        const errors: any = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({errors: errors.array()});
        }

        userService.signIn(request.body.email, request.body.password).then((user: User | null) => {
            if (!user) {
                return response.status(403).json({ message: 'Wrong email or password.' });
            }

            const token: string = userService.createToken(user.id, null, user.email, user.name);

            response.cookie('Authorization', `Bearer ${token}`, userService.authCookieOptions);

            return response.json({
                user_id: user.id,
                token: token,
            });
        });

    });


router.get('/verify',
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    (request: any, response: Response, next: NextFunction) => {
    const userService: UserService = new UserService();

    userService.getById(request.auth?.id).then((user: User | null) => {
        if (!user) {
            return response.status(401).json({});
        }
        response.json({
            user: {
                id: user.id,
                name: user.name,
                last_name: user.last_name,
                email_host: user.email_host,
                email_name: user.email_name,
                createdAt: user.createdAt,
                relation: user.relation,
            }
        });
    });


});

router.get('/friends',
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    (request: any, response: Response, next: NextFunction) => {
        const relationService: RelationService = new RelationService();
        const userId: number = parseInt(request.auth.id);

        relationService.getList(
            userId,
            null,
            RelationCategory.FRIEND,
            RelationStatus.NORMAL,
            ).then((relations: Relation[] | null) => {
            response.json({
                relations,
            });
        });
    });

router.get('/:userId',
    util.validate([
        param('userId').isInt(),
    ]),
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    (request: any, response: Response, next: NextFunction) => {
        const userService: UserService = new UserService();
        const userId: number = parseInt(request.auth.id);

        userService.getById(request.params.userId, userId).then((user: User | null) => {
            if (!user) {
                response.status(404).json({});
                return;
            }
            response.json({
                user: {
                    id: user.id,
                    name: user.name,
                    last_name: user.last_name,
                    createdAt: user.createdAt,
                    relation: user.relation,
                }
            });
        });


    });


router.post('/:userId/friend',
    util.validate([
        param('userId').isInt(),
    ]),
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    (request: any, response: Response, next: NextFunction) => {
        const relationService: RelationService = new RelationService();
        const userId: number = parseInt(request.auth.id);
        const targetUserId: number = parseInt(request.params.userId);

        if (userId === targetUserId) {
            response.status(400).json({
                message: 'You can not request to yourself.',
            });
            return;
        }

        relationService.sendFriendRequest(userId, targetUserId).then((isSuccess: boolean) => {
            if (!isSuccess) {
                response.status(403).json({});
                return;
            }

            response.json({});
        });
    });

router.delete('/:userId/friend',
    util.validate([
        param('userId').isInt(),
    ]),
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    (request: any, response: Response, next: NextFunction) => {
        const relationService: RelationService = new RelationService();
        const userId: number = parseInt(request.auth.id);
        const targetUserId: number = parseInt(request.params.userId);

        if (userId === targetUserId) {
            response.status(400).json({
                message: 'You can not request to yourself.',
            });
            return;
        }

        relationService.unfriend(userId, targetUserId).then((relation) => {
            if (!relation) {
                response.status(403).json({});
                return;
            }

            response.json({ relation }).status(200);
        });
    });


router.post('/:userId/chat',
    util.validate([
        param('userId').isInt(),
    ]),
    expressjwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    (request: any, response: Response, next: NextFunction) => {
        const groupService: GroupService = new GroupService();
        const userId: number = parseInt(request.auth.id);
        const userName: string = request.auth.name;
        const targetUserId: number = parseInt(request.params.userId);

        if (userId === targetUserId) {
            response.status(400).json({
                message: 'You can not request to yourself.',
            });
            return;
        }

        groupService.createFriendGroup(userId, targetUserId, userName).then((group) => {
            if (!group) {
                response.status(404).json({ name: "FAILED_GROUP_CREATION"});
                return;
            }

            response.status(200).json({
                group: {
                    id: group.id,
                    user_id : group.user_id,
                    target_id: group.target_id,
                },
            });
            return;

        });

    });

module.exports = router;
