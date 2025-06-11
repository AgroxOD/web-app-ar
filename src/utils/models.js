export async function loadModels() {
  try {
    const res = await fetch('/api/models');
    if (!res.ok) throw new Error(`API request failed: ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('API error', e);
    return [];
  }
}
