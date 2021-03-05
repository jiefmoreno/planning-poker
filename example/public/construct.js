function appendUser(_, render) {
  const usersEl = document.getElementById("users");
  usersEl.insertAdjacentHTML('beforeend', render);
}


function removeUser(user, render) {
  const userEl = document.getElementById(user);
  userEl && userEl.remove();

  const alertEl = document.getElementById("alert");
  alertEl.innerHTML = render;

  const closeAlertEl = document.getElementById("close-alert");
  closeAlertEl.onclick = () => {
    alertEl.innerHTML = "";
  }

}

function addTicket(ticket, render) {
  if (!Object.keys(ticket.notes).includes(userName)) {
    socket.emit('new ticket user', { sessionId, ticketName: ticket.ticketName, userName });
  }
  const usersElement = document.getElementById("tickets");
  usersElement.insertAdjacentHTML('afterbegin', render);
  const formEl = document.getElementById(`${ticket.ticketName.trim()}-form`);
  const stopEl = document.getElementById(`${ticket.ticketName.trim()}-stop`);
  if (ticket.admin === userName) {
    stopEl.onclick = () => {
      socket.emit('force stop notation', sessionId, ticket.ticketName);
    }
  } else {
    stopEl.remove();
  }

  formEl.onsubmit = event => {
    event.preventDefault();
    let ticketName;
    const formData = new FormData(event.target);
    const notes = {};
    for (var [key, value] of formData.entries()) {
      if (key === 'ticketName') {
        ticketName = value;
      } else {
        notes[key] = value;
      }
    }
    socket.emit('add notes', { sessionId, ticketName, userName, notes });
  };
}

function userNoted({ ticketName }, render) {
  const tbodyEl = document.getElementById(`${ticketName.trim()}-noted-tbody`);
  tbodyEl.insertAdjacentHTML('beforeend', render);
}

function allNoted({ admin, ticketName }, render) {
  if (admin === userName) {
    const tbodyEl = document.getElementById(`${ticketName.trim()}-table`);
    tbodyEl.innerHTML = render;

    const formEl = document.getElementById(`${ticketName.trim()}-form`);
    const submitEl = document.getElementById(`${ticketName.trim()}-submit`);
    document.getElementById(`${ticketName.trim()}-stop`).remove();

    submitEl.innerText = 'Validate';
    formEl.onsubmit = event => {
      event.preventDefault();
      let ticketName;
      const formData = new FormData(event.target);
      const notes = {};
      for (var [key, value] of formData.entries()) {
        if (key === 'ticketName') {
          ticketName = value;
        } else {
          notes[key] = value;
        }
      }
      socket.emit('validate notes', { sessionId, ticketName, userName, notes });
    };
  } else {
    const tbodyEl = document.getElementById(`${ticketName.trim()}-container`);
    tbodyEl.innerHTML = render;
  }

}
function ticketValidated({ ticketName }, render) {
  const tbodyEl = document.getElementById(`${ticketName.trim()}-noted-tbody`);
  const tbodyValidatedEl = document.getElementById(`${ticketName.trim()}-validated-tbody`);
  const collapseControldEl = document.getElementById(`${ticketName.trim()}-collapse`);



  tbodyEl.insertAdjacentHTML('beforeend', render);
  tbodyValidatedEl.insertAdjacentHTML('beforeend', render);
  collapseControldEl.classList.remove("show");;
}
