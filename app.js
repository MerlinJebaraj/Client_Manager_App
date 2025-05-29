document.addEventListener('DOMContentLoaded', () => {
  const tableBody = document.getElementById('client-table-body');
  const form = document.getElementById('client-form');

  if (tableBody) {
    fetchClients();
    loadManualClients();
  }

  if (form) {
    form.addEventListener('submit', addClient);
  }
});
async function fetchClients() {
  const loader = document.getElementById('loader');
  if (loader) loader.style.display = 'block';

  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!response.ok) throw new Error('Failed to fetch clients');
    const clients = await response.json();

    clients.forEach(client => {
      insertClientRow(client.name, client.email, client.phone);
    });
  } catch (error) {
    console.error('Failed to fetch clients:', error);
    if (loader) loader.textContent = ' Failed to load clients.';
  } finally {
    if (loader) loader.style.display = 'none';
  }
}
function loadManualClients() {
  const storedClients = JSON.parse(localStorage.getItem('manualClients') || '[]');
  storedClients.forEach(client => {
    insertClientRow(client.name, client.email, client.phone, true);
  });
}


function insertClientRow(name, email, phone, isManual = false) {
  const tableBody = document.getElementById('client-table-body');
  if (!tableBody) return;

  
  const noMatchRow = document.getElementById('no-matches');
  if (noMatchRow) noMatchRow.remove();

  const row = document.createElement('tr');
  row.innerHTML = `
    <td>${name}</td>
    <td>${email}</td>
    <td>${phone}</td>
    <td><button class="delete-btn">Delete</button></td>
  `;

  const deleteButton = row.querySelector('.delete-btn');
  deleteButton.addEventListener('click', () => {
    const confirmDelete = confirm(`Are you sure you want to delete ${name}?`);
    if (!confirmDelete) return;

    row.remove();

    if (isManual) {
      let storedClients = JSON.parse(localStorage.getItem('manualClients') || '[]');
      storedClients = storedClients.filter(client =>
        !(client.name === name && client.email === email && client.phone === phone)
      );
      localStorage.setItem('manualClients', JSON.stringify(storedClients));
    }
  });

  tableBody.appendChild(row);
}


function addClient(e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const errorDisplay = document.getElementById('form-error');

  // Basic validation
  if (!name || !email || !phone) {
    return showError('All fields are required.');
  }

  const nameRegex = /^[A-Za-z\s'-]{2,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^[0-9\-+() ]{7,}$/;

  if (!nameRegex.test(name)) {
    return showError('Invalid name');
  }
  if (!emailRegex.test(email)) {
    return showError('Invalid email format.');
  }
  if (!phoneRegex.test(phone)) {
    return showError('Invalid phone number.');
  }

  errorDisplay.textContent = '';

  
  fetch('https://jsonplaceholder.typicode.com/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, phone }),
  })
    .then(response => {
      if (!response.ok) throw new Error('Failed to save client');
      return response.json();
    })
    .then(data => {
      insertClientRow(data.name, data.email, data.phone, true);
      saveClientToLocalStorage(data.name, data.email, data.phone);
      document.getElementById('client-form').reset();
      alert(' Client added successfully!');
      window.location.href = 'client_table.html'; 
    })
    .catch(err => {
      showError( err.message);
    });
}


function saveClientToLocalStorage(name, email, phone) {
  const storedClients = JSON.parse(localStorage.getItem('manualClients') || '[]');
  storedClients.push({ name, email, phone });
  localStorage.setItem('manualClients', JSON.stringify(storedClients));
}


function showError(message) {
  const errorDisplay = document.getElementById('form-error');
  if (errorDisplay) errorDisplay.textContent = message;
}


function filterClients() {
  const input = document.getElementById('search').value.toLowerCase();
  const tableBody = document.getElementById('client-table-body');
  if (!tableBody) return;

  const rows = tableBody.querySelectorAll('tr');

  let visibleCount = 0;
  let noMatchRow = document.getElementById('no-matches');

  rows.forEach(row => {
    if (row.id === 'no-matches') return;

    const name = row.querySelector('td').textContent.toLowerCase();

    if (name.includes(input)) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });

  if (visibleCount === 0) {
    if (!noMatchRow) {
      noMatchRow = document.createElement('tr');
      noMatchRow.id = 'no-matches';
      noMatchRow.innerHTML = `
        <td colspan="4" style="text-align: center; color: #888;">
          No matching clients found
        </td>`;
      tableBody.appendChild(noMatchRow);
    }
    noMatchRow.style.display = '';
  } else if (noMatchRow) {
    noMatchRow.style.display = 'none';
  }
}
