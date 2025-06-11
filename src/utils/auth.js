export function getToken() {
  return localStorage.getItem('jwt');
}

export function setToken(token) {
  if (token) localStorage.setItem('jwt', token);
}

export function logout() {
  localStorage.removeItem('jwt');
}

export function isAuthenticated() {
  return Boolean(getToken());
}

async function sendAuth(path, payload, failMsg) {
  const base = import.meta.env.VITE_STRAPI_URL;
  if (!base) throw new Error('VITE_STRAPI_URL not set');
  const url = `${base.replace(/\/$/, '')}${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`${failMsg}: ${res.status}`);
  return res.json();
}

export function login(identifier, password) {
  return sendAuth('/auth/local', { identifier, password }, 'Login failed');
}

export function register(username, email, password) {
  return sendAuth(
    '/auth/local/register',
    { username, email, password },
    'Register failed',
  );
}
