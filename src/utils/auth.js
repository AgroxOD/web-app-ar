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
  const url = path;
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
