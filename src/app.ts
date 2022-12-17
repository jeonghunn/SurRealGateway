import express from "express";
import { Util } from "./core/util";
import { Sequelize } from "sequelize-typescript";
import fileUpload from "express-fileupload";

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const config = require('./config/db_config');
export const sequelize = new Sequelize(
    config.database,
    config.user,
    config.password,
    {
        host: config.host,
        dialect: "mariadb",
        models: [__dirname + '/model']
    }
);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');
var groupRouter = require('./routes/group');
const util: Util = new Util();

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/group', groupRouter);

app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
}));

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
