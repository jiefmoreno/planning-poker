const sessions = {};

interface Ticket {
  ticketName: string,
  notes: object,
  status: 'inProgress' | 'allNoted' | 'validated',
  admin: string
};
interface Session {
  tickets: [Ticket]
};

export function init(io: any): (sessionId: string) => Session {
  io.on('connection', (socket) => {
    socket.on('disconnect', () => {
    });
    socket.on('new session', (sessionName) => {
      if (sessions[sessionName]) return;
      sessions[sessionName] = { tickets: [] };
    });
    socket.on('join room', (sessionName, userName) => {
      socket.join(sessionName);
      socket.nickName = userName;
    });
    socket.on('new ticket', (sessionId, ticketName, userName) => {
      if (
        sessions[sessionId] &&
        !sessions[sessionId].tickets.find(({ ticketName: name }) => name === ticketName)
      ) {
        sessions[sessionId].tickets.push({ ticketName, notes: {}, status: 'inProgress', admin: userName });
        io.sockets.to(sessionId).emit('changed', sessions[sessionId]);
      }
    });
    socket.on('add notes', (sessionId, ticketName, userName, notes) => {
      const ticket = sessions[sessionId].tickets.find(({ ticketName: name }) => name === ticketName);
      if (ticket) {
        ticket.notes[userName] = notes;
        const room = io.sockets.adapter.rooms[sessionId];
        if (room.length <= Object.keys(ticket.notes).length) {
          ticket.status = 'allNoted';
          io.sockets.to(sessionId).emit('all noted', {
            ...ticket,
            sessionId,
          });
        }
      }
    });
    socket.on('force stop notation', (sessionId, ticketName) => {
      const ticket = sessions[sessionId].tickets.find(({ ticketName: name }) => name === ticketName);
      if (ticket) {
        ticket.status = 'allNoted';
        io.sockets.to(sessionId).emit('all noted', {
          ...ticket,
          sessionId,
        });
      }
    });
    socket.on('validate notes', (sessionId, ticketName, notes) => {
      const ticket = sessions[sessionId].tickets.find(({ ticketName: name }) => name === ticketName);
      if (ticket && ticket.admin === socket.nickName) {
        ticket.validatedNotes = notes;
        ticket.status = 'validated';
        io.sockets.to(sessionId).emit('validated', {
          ...ticket,
          sessionId,
        });
      }
    });
  });
  return function getSession(sessionId: string): Session {
    return sessions[sessionId];
  }
}
