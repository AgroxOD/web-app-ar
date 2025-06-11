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
  if (!res.ok) throw new Error(`${failMsg}: ${res.status}`);
  return res.json();
}

export function login(identifier, password) {
  return sendAuth('/api/login', { identifier, password }, 'Login failed');
}

export function register(username, email, password) {
  return sendAuth('/api/register', { username, email, password }, 'Register failed');
}
