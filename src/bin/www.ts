#!/usr/bin/env node

/**
 * Module dependencies.
 */

import {
  AuthMessage,
  ChatMessage,
  SimpleUser,
} from "../core/type";
import jwt from "jsonwebtoken";
import {User} from "../model/User";

var app = require('../app');
var debug = require('debug')('surrealgateway:server');
var http = require('http');
var webSocket = require('ws');

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server = http.createServer(app);

/**
 * Create WebSocket server.
 */


const wsServer = new webSocket.Server({ server });
wsServer.on('connection', (socket: any) => {
  let isAuthenticated: boolean = false;
  let me: SimpleUser;

  socket.on('message', (message: string) => {

    if(!isAuthenticated) {
      const auth: AuthMessage = JSON.parse(message);
      const jwtInfo: any = jwt.verify(auth.token?.split(" ")[1]!, 'TEST_SERVER_SECRET');
      me = {
        id: jwtInfo.id,
        name: jwtInfo.name,
      };
      isAuthenticated = true;
      console.log(jwtInfo);
      return;
    }

    const chat: ChatMessage = JSON.parse(message);
    chat.createdAt = new Date();

    const user: User = new User();
    user.name = me.name!;
    user.id = me.id!;

    chat.user = user;

    wsServer.broadcast(JSON.stringify(chat));
  });
});

wsServer.broadcast = function broadcast(message: any) {
  wsServer.clients.forEach(function each(client: any) {
    client.send(message);
  });
};

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: any) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
