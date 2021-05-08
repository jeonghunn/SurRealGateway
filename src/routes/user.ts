import {
    NextFunction,
    Response
} from "express";
import { UserController } from "../controller/UserController";
import {
    body,
    validationResult,
} from "express-validator";
import {User} from "../model/user";
import jwt from "express-jwt";

const config = require('../config/config');
const express = require('express');
const router = express.Router();

router.post(
    '/',
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    (req: any, res: Response, next: NextFunction) => {
    const userController: UserController = new UserController();
    const errors: any = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }

    userController.isEmailDuplicate(req.body.email).then(isEmailDuplicated => {
        if (isEmailDuplicated) {
            res.status(409);
            res.json({message: "duplicated account."});
            return;
        }

        userController.signUp(
            req.body.email,
            req.body.password,
            req.body.name,
            req.body.last_name,
            req.body.gender,
        ).then((user: User) => {
            const token: string = userController.createToken(user.id);

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            res.cookie('Authorization', `Bearer ${token}`, {
                maxAge: 900000,
            });

            res.json({
                user_id: user.id,
                token: token,
            });
        });
    });


});

router.post(
    '/signin',
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    (request: any, response: Response, next: NextFunction) => {
        const userController: UserController = new UserController();
        const errors: any = validationResult(request);
        if (!errors.isEmpty()) {
            return response.status(400).json({errors: errors.array()});
        }

        userController.signIn(request.body.email, request.body.password).then((user: User | null) => {
            if (!user) {
                return response.status(403).json({ message: 'Wrong email or password.' });
            }

            const token: string = userController.createToken(user.id, null, user.email, user.name);

            response.cookie('Authorization', `Bearer ${token}`, {
                maxAge: 900000,
            });

            return response.json({
                user_id: user.id,
                token: token,
            });
        });

    });


router.get('/verify',
    jwt({ secret: config.jwt.secret, algorithms: config.jwt.algorithms }),
    (request: any, response: Response, next: NextFunction) => {
    const userController: UserController = new UserController();

    userController.getById(request.user.id).then((user: User | null) => {
        if (!user) {
            response.status(404);
            return;
        }
        response.json({
            user: {
                id: user.id,
                name: user.name,
                last_name: user.last_name,
                email_host: user.email_host,
                email_name: user.email_name,
                createdAt: user.createdAt,
            }
        });
    });


});

module.exports = router;
