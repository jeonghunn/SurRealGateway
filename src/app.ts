import express from "express";
import { Util } from "./core/util";

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');
var roomRouter = require('./routes/room');
const util: Util = new Util();

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/room', roomRouter)

// error handler
app.use(function(err: any, req: any , res:any , next: any) {
    let message: string = 'Something went wrong. Sorry for the inconvenience.';
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    if (err.status < 500) {
        message = err.message;
    }

    console.log(err);
    res.status(err.status || 500);
    res.json({ message });
});


module.exports = app;
