const templates = {
  userJoin: (user) => `<span id=${user.trim()}>${user}</span>`,
  userLeft: (user) => `
  <div class="alert alert-warning alert-dismissible fade show" role="alert">
  <strong>${user}</strong> left the session.
  <button id="close-alert" type="button" class="close" data-dismiss="alert" aria-label="Close">
    <span aria-hidden="true">&times;</span>
  </button>
</div>
  `,
  newTicket: (ticket) => {
    switch (ticket.status) {
      case 'inProgress':
        return ticketInProgress(ticket);
      default:
        return '';
    }
  },
  userNoted: (user) => `<tr><td>${user}</td></tr>`,
  allNoted: ({ ticketName, notes, average }) => `
  <table class="table table-dark" id="${ticketName.trim()}-result-table">
    <thead>
      <tr>
        <th scope="col">Name</th>
        <th scope="col">Complexity</th>
        <th scope="col">Specification</th>
        <th scope="col">Tests</th>
        <th scope="col">Backend</th>
        <th scope="col">Frontend</th>
      </tr>
    </thead>
    <tbody id="${ticketName.trim()}-noted-tbody">
      ${Object.keys(notes).filter(key => notes[key]).map(user => `
      <tr>
        <td>${user}</td>
        <td>${notes[user].complexity}</td>
        <td>${notes[user].spec}</td>
        <td>${notes[user].tests}</td>
        <td>${notes[user].be}</td>
        <td>${notes[user].fe}</td>
      </tr>
      `).join('')}
      <tr class="bg-info">
        <td>Average</td>
        <td>${average.complexity || '-'}</td>
        <td>${average.spec || '-'}</td>
        <td>${average.tests || '-'}</td>
        <td>${average.be || '-'}</td>
        <td>${average.fe || '-'}</td>
      </tr>
    </tbody>
  </table>
  `,
  validated: (notes) => `
  <tr class="bg-success">
  <td>Validated</td>
  <td>${notes.complexity || '-'}</td>
  <td>${notes.spec || '-'}</td>
  <td>${notes.tests || '-'}</td>
  <td>${notes.be || '-'}</td>
  <td>${notes.fe || '-'}</td>
</tr>`
}


function ticketInProgress({ ticketName, notes }) {
  return `
  <div id="${ticketName.trim()}">
    <div class="card-header" id="${ticketName.trim()}-header">
      <h5 class="mb-0">
        <div class="btn btn-link" data-toggle="collapse" data-target="#${ticketName.trim()}-collapse" aria-expanded="true" aria-controls="collapseOne">
          ${ticketName}
        </div>
      </h5>
      <table class="table table-dark">
        <thead>
        <tr>
          <th scope="col">Status</th>
          <th scope="col">Complexity</th>
          <th scope="col">Specification</th>
          <th scope="col">Tests</th>
          <th scope="col">Backend</th>
          <th scope="col">Frontend</th>
        </tr>
      </thead>
        <tbody id="${ticketName.trim()}-validated-tbody"></tbody>
      </table>
    </div>
    <div id="${ticketName.trim()}-collapse" class="collapse show" aria-labelledby="${ticketName.trim()}-header" data-parent="#accordion">
      <div class="card-body">
      <button type="button" class="btn btn-primary" id="${ticketName.trim()}-stop">Stop Notation</button>
      <div class="container-fluid" id="${ticketName.trim()}-container">
        <div class="row">
          <div class="col-sm">
            <form id="${ticketName.trim()}-form">
              <div class="form-group">
              <label for="${ticketName.trim()}-complexity">Complexity</label>
              <select name="complexity" class="custom-select" id="${ticketName.trim()}-complexity">
                <option value>Choose...</option>
                <option value="0">Zero (0)</option>
                <option value="1">One (1)</option>
                <option value="2">Two (2)</option>
                <option value="3">Three (3)</option>
                <option value="5">Five (5)</option>
                <option value="8">Eight (8)</option>
                <option value="13">Thirteen (13)</option>
                <option value="Infinity">Infinity</option>
                <option value>No idea</option>
              </select>
            </div>
            <div class="form-group">
              <input type="hidden" name="ticketName" value="${ticketName}" />
              <label for="${ticketName.trim()}-spec">Specifications (in hours)</label>
              <input name="spec" type="number" class="form-control" id="${ticketName.trim()}-spec">
            </div>
            <div class="form-group">
              <label for="${ticketName.trim()}-tests">Tests (in hours)</label>
              <input name="tests" type="number" class="form-control" id="${ticketName.trim()}-tests">
            </div>
            <div class="form-group">
              <label for="${ticketName.trim()}-be">Backend development (in hours)</label>
              <input name="be" type="number" class="form-control" id="${ticketName.trim()}-be">
            </div>
            <div class="form-group">
              <label for="${ticketName.trim()}-fe">Frontend development (in hours)</label>
              <input name="fe" type="number" class="form-control" id="${ticketName.trim()}-fe">
            </div>
            <button  id="${ticketName.trim()}-submit" type="submit" class="btn btn-primary">Rate</button>
            </form>
          </div>
          <div class="col-sm">
            <table class="table table-dark" id="${ticketName.trim()}-table">
            <thead>
              <tr>
                <th scope="col">voted</th>
              </tr>
            </thead>
            <tbody id="${ticketName.trim()}-noted-tbody">
              ${Object.keys(notes).filter(u => notes[u]).map(user => `<tr><td>${user}</td></tr>`).join('')}
            </tbody>
            </table>
          </div>
        </div>
      </div>
      </div>
    </div>
  </div>
  `;
}

module.exports = templates;