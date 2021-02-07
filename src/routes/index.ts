import {
    NextFunction,
    Response,
} from "express";
const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req: Request, res: Response, next: NextFunction) {
    res.json({ title: `Welcome` });
});

module.exports = router;
