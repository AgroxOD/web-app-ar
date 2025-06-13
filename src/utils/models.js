const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const DEFAULT_MODEL_URL = import.meta.env.VITE_MODEL_URL;

if (API_BASE.endsWith('/api')) {
  console.warn('VITE_API_BASE_URL should not include "/api"');
}

export async function loadModels() {
  let list = [];
  try {
    const res = await fetch(`${API_BASE}/api/models`);
    if (!res.ok) throw new Error(`API request failed: ${res.status}`);
    list = await res.json();
  } catch (e) {
    console.error('API error', e);
  }
  if (!Array.isArray(list) || list.length === 0) {
    if (DEFAULT_MODEL_URL) list = [{ url: DEFAULT_MODEL_URL, markerIndex: 0 }];
  }
  return list;
}

function authHeaders(json = false) {
  const headers = {};
  const token = localStorage.getItem('jwt');
  if (token) headers.Authorization = `Bearer ${token}`;
  if (json) headers['Content-Type'] = 'application/json';
  return headers;
}

export async function updateModel(id, data) {
  const res = await fetch(`${API_BASE}/api/models/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: authHeaders(true),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg =
      data.error || (res.status === 403 ? 'Forbidden' : 'Update failed');
    throw new Error(msg);
  }
  return res.json().catch(() => ({}));
}

export async function deleteModel(id) {
  const res = await fetch(`${API_BASE}/api/models/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const msg =
      data.error || (res.status === 403 ? 'Forbidden' : 'Delete failed');
    throw new Error(msg);
  }
  return res.json().catch(() => ({}));
}
