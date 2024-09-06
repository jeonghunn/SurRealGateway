import express from "express";
import { Util } from "./core/util";
import { FirebaseService } from "./service/FirebaseService";
import { Sequelize } from "sequelize-typescript";
import { initializeApp } from 'firebase-admin/app';
import { credential } from 'firebase-admin';


var path = require('path');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require('morgan');
const multer  = require('multer')
const dbConfig = require('./config/db_config');
const config = require('./config/config')
export const upload = multer({
    dest: config.attach.path,
    limits: { fileSize: config.attach.sizeLimit },
});

export const sequelize = new Sequelize(
    dbConfig.database,
    dbConfig.user,
    dbConfig.password,
    {
        host: dbConfig.host,
        dialect: "mariadb",
        models: [__dirname + '/model']
    }
);

const firebaseApp: any = initializeApp({
    credential: credential.applicationDefault(),
  });

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');
var groupRouter = require('./routes/group');
var attachRouter = require('./routes/attach');
var clientRouter = require('./routes/client');

var app = express();

app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb'}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);
app.use('/group', groupRouter);
app.use('/attach', attachRouter);
app.use('/client', clientRouter);


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
