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

const express = require('express');
const router = express.Router();

router.post(
    '/',
    body('email').isEmail(),
    body('password').isLength({ min: 5 }),
    (req: any, res: Response, next: NextFunction) => {
    const userController: UserController = new UserController();
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

            res.json({
                user_id: user.id,
                token: token,
            });
        });
    });


});

module.exports = router;
