function constructComplexityInput() {
  var selectElement = document.createElement("select");
  var optPH = document.createElement("option");
  var opt1 = document.createElement("option");
  var opt2 = document.createElement("option");
  var opt3 = document.createElement("option");
  var opt5 = document.createElement("option");
  var opt8 = document.createElement("option");
  var opt13 = document.createElement("option");
  var optInfinity = document.createElement("option");

  optPH.text = '';
  optPH.value = "";
  opt1.value = 1;
  opt1.text = "1";
  opt2.value = 2;
  opt2.text = "2";
  opt3.value = 3;
  opt3.text = "3";
  opt5.value = 5;
  opt5.text = "5";
  opt8.value = 8;
  opt8.text = "8";
  opt13.value = 13;
  opt13.text = "13";
  optInfinity.value = Infinity;
  optInfinity.text = "∞";
  selectElement.add(optPH);
  selectElement.add(opt1);
  selectElement.add(opt2);
  selectElement.add(opt3);
  selectElement.add(opt5);
  selectElement.add(opt8);
  selectElement.add(opt13);
  selectElement.add(optInfinity);
  return selectElement;
}

function constructLine(idPrefix) {
  const lineElement = document.getElementById(idPrefix) || document.createElement('tr');
  lineElement.innerHTML = '';
  lineElement.id = idPrefix;
  return lineElement
}

function constructWaitingForResponsesList(title, value, idPrefix) {
  const lineElement = document.getElementById(idPrefix) || document.createElement('tr');
  lineElement.id = idPrefix;
  if (title) {
    const titleElement = document.createElement('td');
    titleElement.innerText = title;
    lineElement.appendChild(titleElement);
  }
  const stateElement = document.createElement('td');
  stateElement.colSpan = subtasks.length;
  const containerElement = document.createElement('div');
  containerElement.className = value ? '' : 'loader';
  containerElement.innerText = value ? '✅' : '・・・';
  stateElement.appendChild(containerElement);
  lineElement.appendChild(stateElement);

  return lineElement;
}

function constructInputLine(title, values, idPrefix, ticketName, emit) {
  const lineElement = document.createElement('tr');
  lineElement.id = idPrefix;
  if (title) {
    const titleElement = document.createElement('td');
    titleElement.innerText = title;
    lineElement.appendChild(titleElement);
  }

  subtasks.forEach(({ id, type, title }) => {
    const el = document.createElement('td');
    if (type === types.complexity) {
      const inputElement = constructComplexityInput();
      inputElement.id = `${idPrefix}-${id}`;
      inputElement.value = values && values[id] || '';
      // inputElement.placeholder = title;
      el.appendChild(inputElement);
    } else {
      const inputElement = document.createElement('input');
      inputElement.id = `${idPrefix}-${id}`;
      inputElement.value = values && values[id] || '';
      // inputElement.placeholder = title;
      el.appendChild(inputElement);
    }
    lineElement.appendChild(el);
  });

  const validateCell = document.createElement('td');
  const validateElement = document.createElement('button');
  validateElement.innerText = '✔️';
  validateElement.className = 'button-table';
  validateElement.onclick = () => {
    const notes = subtasks.reduce((acc, { id }) => ({
      ...acc,
      [id]: document.getElementById(`${idPrefix}-${id}`).value
    }), {});
    socket.emit(emit, { sessionId, ticketName, userName, notes })
  };
  validateCell.appendChild(validateElement);
  lineElement.appendChild(validateCell);
  return lineElement;
}

function constructLine(title, values, idPrefix) {
  const lineElement = document.createElement('tr');
  lineElement.id = title;
  const titleElement = document.createElement('td');
  titleElement.innerText = title;
  lineElement.appendChild(titleElement);

  subtasks.forEach(({ id, type }) => {
    const el = document.createElement('td');
    el.id = idPrefix + id;
    el.innerText = values && values[id] || '';
    lineElement.appendChild(el);
  });
  return lineElement;
}

function constructUsersList(users) {
  const usersElement = document.getElementById("users");
  usersElement.innerText = users.join(', ');
}

function getAverage(ticket) {
  return subtasks.map(({ title, id, type }) => {
    if (type === types.complexity) {
      return {
        id,
        note: Object.values(ticket.notes).filter(note => note).reduce(((acc, note) =>
          !note ? acc :
            !isNaN(parseFloat(note[id], 10))
              ? Math.max(note[id], acc) : acc), 0),
      };
    } else if (type === types.time) {
      return {
        id,
        note: Object.values(ticket.notes).filter(note => note).reduce(((acc, note) =>
          !note ? acc :
            !isNaN(parseFloat(note[id], 10))
              ? acc + parseFloat(note[id], 10) : acc), 0) / Object
                .values(ticket.notes)
                .filter(note => note)
                .filter(note => !isNaN(parseFloat(note[id], 10))).length,
      };
    } else {
      return {
        id,
        note: null
      };
    }
  }).reduce((acc, av) => ({
    ...acc,
    [av.id]: av.note,
  }), {});
}

function constructTableTitles(prefixId) {
  const lineElement = document.createElement('tr');
  lineElement.id = `${prefixId}-titres`;
  const nickNameElement = document.createElement('th');
  nickNameElement.innerText = 'NickName';
  lineElement.appendChild(nickNameElement);

  subtasks.forEach(({ id, title }) => {
    const titleElement = document.createElement('th');
    titleElement.innerText = title;
    lineElement.appendChild(titleElement);
  });

  return lineElement
}

function constructNotesValidated(ticket) {
  const summaryElement = document.getElementById(`${ticket.ticketName}-summary`);
  summaryElement.innerHTML = Object.keys(ticket.validatedNotes)
    .reduce(
      (acc, key) =>
        `${acc} <span><b>${key}:</b> ${ticket.validatedNotes[key]}${
        subtasks.find(({ id, type }) => id === key && type === types.time) ? 'h' : ''
        }</span>`
      , '');
}

function constructValidatedTicket(ticket) {
  const tableElement = document.createElement('table');
  tableElement.className = 'table';
  tableElement.appendChild(
    constructTableTitles(`${ticket.ticketName}-`)
  );
  Object.entries(ticket.notes).forEach(([user, note]) => {
    tableElement.appendChild(
      constructLine(user, note, `${ticket.ticketName}-${user}-note`)
    );
  });
  tableElement.appendChild(
    constructLine('validated', ticket.validatedNotes, `${ticket.ticketName}-average-note`)
  );
  return tableElement;
}

function constructInProgressTicket(ticket) {
  const tableElement = document.createElement('table');
  tableElement.className = 'table';
  tableElement.appendChild(
    constructTableTitles(`${ticket.ticketName}-`)
  );
  Object.entries(ticket.notes).forEach(([user, note]) => {
    if (user === userName) {
      tableElement.appendChild(
        constructInputLine(
          user,
          note,
          `${ticket.ticketName}-${user}-note`,
          ticket.ticketName,
          'add notes'
        )
      );
    } else {
      tableElement.appendChild(
        constructWaitingForResponsesList(user, note, `${ticket.ticketName}-${user}-note`)
      );
    }
  });
  return tableElement;
}

function constructAllNotedTicket(ticket) {
  const tableElement = document.createElement('table');
  tableElement.className = 'table';
  tableElement.appendChild(
    constructTableTitles(`${ticket.ticketName}-`)
  );
  Object.entries(ticket.notes).forEach(([user, note]) => {
    tableElement.appendChild(
      constructLine(user, note, `${ticket.ticketName}-${user}-note`)
    );
  });
  if (userName === ticket.admin) {
    tableElement.appendChild(
      constructInputLine(
        "average",
        getAverage(ticket),
        `${ticket.ticketName}-validate-note`,
        ticket.ticketName,
        'validate notes'
      )
    );
  }
  return tableElement;
}

function getSummaryNotes(ticket) {
  return Object.keys(ticket.validatedNotes)
    .reduce(
      (acc, key) =>
        `${acc} <span><b>${key}:</b> ${ticket.validatedNotes[key]}${
        subtasks.find(({ id, type }) => id === key && type === types.time) ? 'h' : ''
        }</span>`
      , '');
}

function constructTicketHeader(ticket) {
  var summary = document.createElement('summary');
  summary.innerText = ticket.ticketName;
  const summaryNotes = document.createElement('div');
  summaryNotes.id = `${ticket.ticketName}-summary`;
  summary.appendChild(summaryNotes);
  if (userName === ticket.admin && ticket.status === 'inProgress') {
    const stopNotation = document.createElement('button');
    stopNotation.id = "stopNotation";
    stopNotation.innerText = 'Stop notation';
    stopNotation.style.margin = '0.2rem';
    stopNotation.onclick = event => {
      socket.emit('force stop notation', sessionId, ticket.ticketName);
      event.target.style.display = "none";
    };
    summaryNotes.appendChild(stopNotation);
  } else if (ticket.status === 'validated') {
    summaryNotes.innerHTML = getSummaryNotes(ticket);
  }
  return summary;
}