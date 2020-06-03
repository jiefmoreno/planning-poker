import io from 'socket.io-client';
const socket = io();

export function createSession(sessionName: string, userName: string) {
    socket.emit('new session', sessionName, userName);
}

export function addTicket(sessionId: string, value: string, userName: string) {
    socket.emit('new ticket', sessionId, value, userName);
}
