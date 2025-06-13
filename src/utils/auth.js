export function getToken() {
  return localStorage.getItem('jwt');
}

export function decodeJwt(token) {
  try {
    const [, payload] = token.split('.');
    if (!payload) return {};
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export function setToken(token) {
  if (token) localStorage.setItem('jwt', token);
}

export function getRole() {
  const stored = localStorage.getItem('role');
  if (stored) return stored;
  const token = getToken();
  if (token) {
    const { role } = decodeJwt(token);
    if (role) {
      localStorage.setItem('role', role);
      return role;
    }
  }
  return 'user';
}

export function setRole(role) {
  if (role) localStorage.setItem('role', role);
}

export function setAuth(token, role) {
  setToken(token);
  if (role) setRole(role);
  else {
    const { role: decoded } = decodeJwt(token);
    if (decoded) setRole(decoded);
  }
}

export function logout() {
  localStorage.removeItem('jwt');
  localStorage.removeItem('role');
}

export function isAuthenticated() {
  return Boolean(getToken());
}

let API_BASE = (import.meta.env.VITE_API_BASE_URL || '').trim();
if (!API_BASE) {
  console.warn(
    'VITE_API_BASE_URL is empty; falling back to location.origin',
  );
  API_BASE = typeof location !== 'undefined' ? location.origin : '';
}

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
