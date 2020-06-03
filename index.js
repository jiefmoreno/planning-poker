var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const sessions = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/session/:sessionId/:userName', (req, res) => {
  res.sendFile(__dirname + '/session.html');
});
app.get('/api/session/:sessionId', (req, res) => {
  var session = sessions[req.params.sessionId];
  res.json({
    session
  })
});
app.use(express.static(__dirname+'public'));

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
  });
  socket.on('new session', (sessionName, userName) => {
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

http.listen(3000, () => {
  console.log('listening on *:3000');
});