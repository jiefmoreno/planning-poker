const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const templates = require('./templates');
const getSession = require('@planning-poker/server').init(io, templates);
const path = require('path')


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/session/:sessionId', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});
app.get('/session/:sessionId/:userName', (req, res) => {
  res.sendFile(__dirname + '/session.html');
});
app.get('/api/session/:sessionId', (req, res) => {
  const session = getSession(req.params.sessionId);
  res.json({
    session
  });
});
app.use('/static', express.static(path.join(__dirname, 'public')))

http.listen(3000, () => {
  console.log('listening on *:3000');
});