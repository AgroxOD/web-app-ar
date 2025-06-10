export async function fetchStrapi(contentType, query = '') {
  const base = import.meta.env.VITE_STRAPI_URL;
  if (!base) return null;
  const url = `${base.replace(/\/$/, '')}/${contentType}${query ? `?${query}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Strapi request failed: ${res.status}`);
  return res.json();
}
