import express from "express";

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/user');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', usersRouter);

// error handler
app.use(function(err: any, req: any , res:any , next: any) {
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    console.log(err);
    res.status(err.status || 500);
    res.json({message: 'Something went wrong. Sorry for the inconvenience.'});
});


module.exports = app;
