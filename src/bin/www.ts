#!/usr/bin/env node

/**
 * Module dependencies.
 */

import {
  AttendeeType,
  LiveMessage,
  CommunicationResult,
  CommunicationType,
  SimpleUser,
} from "../core/type";
import { RoomService } from "../service/RoomService";
import { AttendeeService } from "../service/AttendeeService";
import { Attendee } from "../model/Attendee";
import { LiveRoomService } from "../service/LiveRoomService";
import { AttachService } from "../service/AttachService";
import { Room } from "../model/Room";
import { Group } from "../model/Group";
import { GroupService } from "../service/GroupService";

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
const rooms = new Map();
const liveRoomService: LiveRoomService = new LiveRoomService();
const roomService: RoomService = new RoomService();
const attendeeService: AttendeeService = new AttendeeService();
const attachService: AttachService = new AttachService();
const groupService: GroupService = new GroupService();

wsServer.on('connection', (socket: any, request: any) => {

  const roomId: number = parseInt(request?.url?.split('/')[1],  10);
  let room: Room = null;
  let me: SimpleUser | null;

  console.log("User tries to enter the room ", roomId);

  roomService.getById(roomId).then((roomItem: Room | null) => {
    room = roomItem;
  });

  socket.on('message', (message: string) => {

    if(!me) {
      me = roomService.getVerifiedUser(message);
      const authResult: CommunicationResult = new CommunicationResult();
      authResult.T = CommunicationType.AUTH;
      authResult.result = me !== null;

      console.log(`[Live] Trying to join the room ${roomId} by user ${me?.id}`, authResult);
      if (!me) {
        socket.send(JSON.stringify(authResult));
        return;
      }

      attendeeService.get(AttendeeType.ROOM, me?.id!, roomId).then((attendee: Attendee | null) => {
        authResult.result = authResult.result && attendee !== null;
        socket.send(JSON.stringify(authResult));
        
        if (!authResult.result) {
          console.log(`[Live] Permission Error: room ${roomId} by user ${me?.id}`, authResult);
          me = null;
          return;
        }

        liveRoomService.join(roomId, me?.id!!, socket);
      });

      return;
    }

    try {
      const liveMessage: LiveMessage | undefined = roomService.parseMessage(attachService, message, me);

      if (!liveMessage) {
        console.log("Live Message : Invalid Live Message By User", me?.id);
        return;
      }

      liveRoomService.send(roomId, liveMessage, room);

    } catch (e: any) {
      console.log("ERROR", e);
      return;
    }

  });

  socket.on('close', (responseCode: number, description: string) => {
    liveRoomService.close(roomId, me?.id!!, socket);
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
