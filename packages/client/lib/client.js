"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePointing = exports.addTicket = exports.createSession = void 0;
const socket_io_client_1 = require("socket.io-client");
const socket = socket_io_client_1.default();
function createSession(sessionName, userName) {
    socket.emit('new session', sessionName, userName);
}
exports.createSession = createSession;
function addTicket(sessionId, value, userName) {
    socket.emit('new ticket', sessionId, value, userName);
}
exports.addTicket = addTicket;
function validatePointing(sessionId, ticketName, notes) {
    socket.emit('validate notes', sessionId, ticketName, notes);
}
exports.validatePointing = validatePointing;
