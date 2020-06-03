import io from 'socket.io-client';
const socket = io();

export function createSession(sessionName: string, userName: string) {
    socket.emit('new session', sessionName, userName);
}

export function addTicket(sessionId: string, value: string, userName: string) {
    socket.emit('new ticket', sessionId, value, userName);
}

export function validatePointing(sessionId: string, ticketName: string, notes: object) {
    socket.emit('validate notes', sessionId, ticketName, notes);
}
