export function getToken() {
  return localStorage.getItem('jwt');
}

export function setToken(token) {
  if (token) localStorage.setItem('jwt', token);
}

export function getRole() {
  return localStorage.getItem('role') || 'user';
}

export function setRole(role) {
  if (role) localStorage.setItem('role', role);
}

export function setAuth(token, role) {
  setToken(token);
  setRole(role);
}

export function logout() {
  localStorage.removeItem('jwt');
  localStorage.removeItem('role');
}

export function isAuthenticated() {
  return Boolean(getToken());
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function sendAuth(path, payload, failMsg) {
  const url = API_BASE + path;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `${failMsg}: ${res.status}`);
  }
  return data;
}

export function login(email, password) {
  return sendAuth('/auth/login', { email, password }, 'Login failed');
}

export function register(username, email, password) {
  return sendAuth(
    '/auth/register',

    { username, email, password },
    'Register failed',
  );
}
