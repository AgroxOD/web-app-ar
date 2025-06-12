import { login, register, logout, isAuthenticated, setAuth, getRole } from './utils/auth.js';
import { loadModels, deleteModel } from './utils/models.js';
import { showEditForm } from './utils/editForm.js';

const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const logoutBtn = document.getElementById('logout');
const showRegisterBtn = document.getElementById('show-register');
const showLoginBtn = document.getElementById('show-login');
const uploadForm = document.getElementById('upload-form');
const uploadSection = document.getElementById('upload-section');
const modelsList = document.getElementById('models-list');
const messageEl = document.getElementById('message');

let showRegister = false;

function showMessage(msg, error = false) {
  if (!messageEl) return;
  messageEl.textContent = msg;
  messageEl.className = error
    ? 'p-2 bg-red-200 text-red-800'
    : 'p-2 bg-green-200 text-green-800';
  if (msg) {
    setTimeout(() => {
      messageEl.textContent = '';
      messageEl.className = '';
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
  uploadSection.style.display = logged && getRole() === 'admin' ? 'block' : 'none';
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
    await refreshModels();
  } catch (err) {
    showMessage(err.message, true);
  }
}

uploadForm.addEventListener('submit', handleUpload);

function renderModels(list) {
  modelsList.innerHTML = '';
  const admin = getRole() === 'admin';
  list.forEach((m) => {
    const id = m._id;
    const li = document.createElement('li');
    if (id) li.dataset.id = id;
    li.textContent = `${m.name} (${m.url}) - marker ${m.markerIndex}`;
    if (admin && id) {
      const editBtn = document.createElement('button');
      editBtn.textContent = 'Edit';
      editBtn.className = 'button button-primary ml-2';
      editBtn.addEventListener('click', () =>
        showEditForm(li, li.dataset.id, m, editBtn),
      );
      li.appendChild(editBtn);

      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.className = 'button button-secondary ml-2';
      delBtn.addEventListener('click', async () => {
        if (!confirm('Delete this model?')) return;
        try {
          await deleteModel(li.dataset.id);
          showMessage('Model deleted');
          await refreshModels();
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
  try {
    const list = await loadModels();
    renderModels(list);
  } catch (err) {
    showMessage(err.message || 'Failed to load models', true);
  }
}

window.refreshModels = refreshModels;

updateAuthUI();
refreshModels();
