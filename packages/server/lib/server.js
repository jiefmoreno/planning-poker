"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
const sanitizeHtmlImport = require("sanitize-html");
const sessions = {};
;
;
;
const sanitizeHtmlOptions = {
    allowedTags: [
        "address", "article", "aside", "button", "footer", "header", "h1", "h2", "h3", "h4",
        "h5", "h6", "hgroup", "main", "nav", "section", "blockquote", "dd", "div",
        "dl", "dt", "figcaption", "figure", "hr", "li", "main", "ol", "p", "pre",
        "ul", "a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn",
        "em", "i", "kbd", "mark", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp",
        "small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr", "caption",
        "col", "colgroup", "table", "tbody", "td", "tfoot", "th", "thead", "tr", "input",
        "select", "option", "form", "label"
    ],
    allowedAttributes: {
        "*": ["id", "class", "data-toggle", "data-target", "aria-expanded", "aria-controls", "aria-labelledby", "data-parent", "scope", "type", "name", "value"]
    },
};
const sanitizeHtml = html => sanitizeHtmlImport(html, sanitizeHtmlOptions);
function init(io, templates) {
    io.on('connection', (socket) => {
        socket.on('disconnect', () => {
            if (socket.room && sessions[socket.room] && socket.nickName) {
                sessions[socket.room].users = sessions[socket.room]
                    .users
                    .filter(userName => userName !== socket.nickName);
                const renderHtml = (templates === null || templates === void 0 ? void 0 : templates.userLeft)
                    ? sanitizeHtml(templates.userLeft(socket.nickName))
                    : '';
                io
                    .sockets
                    .to(socket.room)
                    .emit('user left', sessions[socket.room].users, renderHtml);
            }
        });
        socket.on('new session', (sessionName) => {
            if (sessions[sessionName])
                return;
            sessions[sessionName] = { tickets: [], users: [] };
        });
        socket.on('join room', (sessionName, userName) => {
            socket.join(sessionName);
            socket.nickName = userName;
            socket.room = sessionName;
            sessions[sessionName] && sessions[sessionName].users.push(userName);
            if (sessions[sessionName]) {
                const renderHtml = user => (templates === null || templates === void 0 ? void 0 : templates.userJoin)
                    ? sanitizeHtml(templates.userJoin(user))
                    : '';
                sessions[socket.room].users.forEach(user => {
                    if (user !== socket.nickName)
                        socket.emit('user joined', user, renderHtml(user));
                });
                sessions[socket.room].tickets.forEach(ticket => {
                    if (ticket.status === "inProgress") {
                        socket.emit('ticket added', ticket, sanitizeHtml(templates.newTicket(ticket)));
                    }
                });
                io.sockets
                    .to(socket.room)
                    .emit('user joined', socket.nickName, renderHtml(socket.nickName));
            }
        });
        socket.on('new ticket', (sessionId, ticketName, userName) => {
            if (sessions[sessionId] &&
                !sessions[sessionId].tickets.find(({ ticketName: name }) => name === ticketName)) {
                const notes = sessions[socket.room].users.reduce((acc, user) => (Object.assign(Object.assign({}, acc), { [user]: null })), {});
                const newTicket = { ticketName, notes, status: 'inProgress', admin: userName, average: {} };
                const renderHtml = (templates === null || templates === void 0 ? void 0 : templates.newTicket)
                    ? sanitizeHtml(templates.newTicket(newTicket))
                    : '';
                sessions[sessionId].tickets.push(newTicket);
                // io.sockets.to(sessionId).emit(
                //   'changed',
                //   sessions[sessionId],
                //   renderHtml
                // );
                io.sockets.to(sessionId).emit('ticket added', newTicket, renderHtml);
            }
        });
        socket.on('new ticket user', ({ sessionId, ticketName, userName }) => {
            const ticket = sessions[sessionId].tickets.find(({ ticketName: name }) => name === ticketName);
            if (ticket) {
                ticket.notes[userName] = null;
            }
        });
        socket.on('add notes', ({ sessionId, ticketName, userName, notes }) => {
            const ticket = sessions[sessionId].tickets.find(({ ticketName: name }) => name === ticketName);
            if (ticket) {
                ticket.notes[userName] = notes;
                if (Object.values(ticket.notes).find(notes => !notes) === null) {
                    const renderHtml = (templates === null || templates === void 0 ? void 0 : templates.userNoted)
                        ? sanitizeHtml(templates.userNoted(userName, ticketName, ticket))
                        : '';
                    io.sockets.to(sessionId).emit('user noted', {
                        ticketName,
                        userName,
                    }, renderHtml);
                }
                else {
                    ticket.status = 'allNoted';
                    ticket.average = Object.values(ticket.notes).reduce((acc, note, i, arr) => {
                        Object.keys(note).forEach(key => {
                            if (note[key]) {
                                acc[key] = [...acc[key] || [], parseInt(note[key], 10)];
                            }
                            if (i === arr.length - 1 && acc[key]) {
                                acc[key] = acc[key].reduce((acc, val) => acc + val, 0) / acc[key].length;
                            }
                        });
                        return acc;
                    }, {});
                    const renderHtml = (templates === null || templates === void 0 ? void 0 : templates.allNoted)
                        ? sanitizeHtml(templates.allNoted(ticket, sessions[sessionId].tickets))
                        : '';
                    io.sockets.to(sessionId).emit('all noted', Object.assign(Object.assign({}, ticket), { sessionId }), renderHtml);
                }
            }
        });
        socket.on('force stop notation', (sessionId, ticketName) => {
            const ticket = sessions[sessionId].tickets.find(({ ticketName: name }) => name === ticketName);
            if (ticket) {
                ticket.status = 'allNoted';
                const renderHtml = (templates === null || templates === void 0 ? void 0 : templates.allNoted)
                    ? sanitizeHtml(templates.allNoted(ticket, sessions[sessionId].tickets))
                    : '';
                io.sockets.to(sessionId).emit('all noted', Object.assign(Object.assign({}, ticket), { sessionId }), renderHtml);
            }
        });
        socket.on('validate notes', ({ sessionId, ticketName, notes }) => {
            const ticket = sessions[sessionId].tickets.find(({ ticketName: name }) => name === ticketName);
            if (ticket && ticket.admin === socket.nickName) {
                ticket.validatedNotes = notes;
                ticket.status = 'validated';
                const renderHtml = (templates === null || templates === void 0 ? void 0 : templates.validated)
                    ? sanitizeHtml(templates.validated(notes))
                    : '';
                io.sockets.to(sessionId).emit('validated', Object.assign(Object.assign({}, ticket), { sessionId }), renderHtml);
            }
        });
    });
    return function getSession(sessionId) {
        return sessions[sessionId];
    };
}
exports.init = init;
