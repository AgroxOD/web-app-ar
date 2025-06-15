import {
  login,
  register,
  logout,
  isAuthenticated,
  setAuth,
  getRole,
} from './utils/auth.js';
import { loadModels, deleteModel } from './utils/models.js';
import { showEditForm } from './utils/editForm.js';

const sidebar = document.getElementById('sidebar');
const rootEl = sidebar || document;
const loginForm = rootEl.querySelector('#login-form');
const registerForm = rootEl.querySelector('#register-form');
const logoutBtn = rootEl.querySelector('#logout');
const showRegisterBtn = rootEl.querySelector('#show-register');
const showLoginBtn = rootEl.querySelector('#show-login');
const uploadForm = document.getElementById('upload-form');
const uploadSection = document.getElementById('upload-section');
const modelsList = document.getElementById('models-list');
let messageEl = rootEl.querySelector('#message');
if (!messageEl) {
  messageEl = document.createElement('div');
  messageEl.id = 'message';
  if (sidebar) sidebar.prepend(messageEl);
  else document.body.prepend(messageEl);
}

let showRegister = false;

export function showMessage(msg, error = false) {
  if (!messageEl) return;
  messageEl.textContent = msg;
  messageEl.className = error ? 'alert alert-danger' : 'alert alert-success';
  messageEl.style.display = 'block';
  clearTimeout(messageEl._hideTimer);
  if (msg) {
    messageEl._hideTimer = setTimeout(() => {
      messageEl.textContent = '';
      messageEl.className = '';
      messageEl.style.display = 'none';
    }, 4000);
  }
}

window.showMessage = showMessage;

function updateAuthUI() {
  const logged = isAuthenticated();
  if (logged) {
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
  } else if (showRegister) {
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
  } else {
    loginForm.style.display = 'flex';
    registerForm.style.display = 'none';
  }
  logoutBtn.style.display = logged ? 'inline-block' : 'none';
  uploadSection.style.display =
    logged && getRole() === 'admin' ? 'block' : 'none';
}

loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const { jwt, role } = await login(
      document.getElementById('login-email').value,
      document.getElementById('login-password').value,
    );
    setAuth(jwt, role);
    showRegister = false;
    updateAuthUI();
  } catch (err) {
    showMessage(err.message, true);
  }
});

registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    const { jwt, role } = await register(
      document.getElementById('register-username').value,
      document.getElementById('register-email').value,
      document.getElementById('register-password').value,
    );
    setAuth(jwt, role);
    showRegister = false;
    updateAuthUI();
  } catch (err) {
    showMessage(err.message, true);
  }
});

logoutBtn.addEventListener('click', () => {
  logout();
  updateAuthUI();
});

showRegisterBtn.addEventListener('click', () => {
  showRegister = true;
  updateAuthUI();
});

showLoginBtn.addEventListener('click', () => {
  showRegister = false;
  updateAuthUI();
});

async function handleUpload(e) {
  e.preventDefault();
  const file = document.getElementById('upload-file').files[0];
  const marker = document.getElementById('upload-marker').value || '0';
  if (!file) return;
  const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
  const token = localStorage.getItem('jwt');
  const form = new FormData();
  form.append('model', file);
  form.append('markerIndex', marker);
  try {
    const res = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `Upload failed: ${res.status}`);
    showMessage('Uploaded');
    uploadForm.reset();
    await window.refreshModels();
  } catch (err) {
    showMessage(err.message, true);
  }
}

uploadForm.addEventListener('submit', handleUpload);

function renderModels(list) {
  modelsList.innerHTML = '';
  const admin = getRole() === 'admin';
  if (list.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = 'No models found';
    modelsList.appendChild(empty);
    return;
  }
  list.forEach((m) => {
    const id = m._id;
    const li = document.createElement('li');
    if (id) li.dataset.id = id;
    li.textContent = `${m.name} (${m.url}) - marker ${m.markerIndex}`;
    if (admin && id) {
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.className = 'btn btn-primary ms-2';
      editBtn.addEventListener('click', () =>
        showEditForm(li, li.dataset.id, m, editBtn),
      );
      li.appendChild(editBtn);

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.className = 'btn btn-secondary ms-2';
      delBtn.addEventListener('click', async () => {
        if (!confirm('Delete this model?')) return;
        try {
          await deleteModel(li.dataset.id);
          showMessage('Model deleted');
          await window.refreshModels();
        } catch (err) {
          showMessage(err.message, true);
        }
      });
      li.appendChild(delBtn);
    }
    modelsList.appendChild(li);
  });
}

export async function refreshModels() {
  modelsList.innerHTML = '<li>Loading...</li>';
  try {
    const list = await loadModels();
    renderModels(list);
  } catch (err) {
    modelsList.innerHTML = '';
    showMessage(err.message || 'Failed to load models', true);
  }
}

window.refreshModels = refreshModels;

updateAuthUI();
window.refreshModels();
