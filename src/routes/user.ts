import {
    NextFunction,
    Response
} from "express";
import { UserController } from "../controller/UserController";
import { User } from "../model/user";

const express = require('express');
const router = express.Router();

router.post('/guest', (req: Request, res: Response, next: NextFunction) => {
    const userController: UserController = new UserController();
    userController.simpleCreate().then((user: User) => {
        const token: string = userController.createToken(user.id);

        res.json({
            user_id: user.id,
            token: token,
        });
    });
});

module.exports = router;
