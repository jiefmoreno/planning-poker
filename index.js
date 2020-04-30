var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

const sessions = {};

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/session/:sessionId', (req, res) => {
  res.sendFile(__dirname + '/session.html');
});
app.get('/api/session/:sessionId', (req, res) => {
  var session = sessions[req.params.sessionId];
  res.json({
    session
  })

});

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
  });
  socket.on('new session', sessionName => {
    sessions[sessionName] = { tickets: [], users: [] };
  });
  socket.on('new user', (sessionName, userName) => {
    sessions[sessionName].add(userName);
  });
  socket.on('new ticket', (sessionId, ticketName) => {
    if (sessions[sessionId] && !sessions[sessionId].tickets.find(({ ticketName: name }) => name === ticketName)) {
      sessions[sessionId].tickets.push({ ticketName, notes: {} });
      socket.emit(sessionId + ' changed', sessions[sessionId]);
    }
  });
  socket.on('add notes', (sessionId, ticketName, userName, notes) => {
    sessions[sessionId][ticketName].notes[userName] = notes;
    if (sessions[sessionId][ticketName].notes.length === sessions[sessionId].users.length) {
      socket.emit('all noted', { sessionId, ticketName, notes: sessions[sessionId][ticketName].notes });
    }
  });
});

http.listen(3000, () => {
  console.log('listening on *:3000');
});