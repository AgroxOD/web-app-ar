const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export async function loadModels() {
  try {
    const res = await fetch(`${API_BASE}/api/models`);
    if (!res.ok) throw new Error(`API request failed: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('API error', e);
    return [];
  }
}
