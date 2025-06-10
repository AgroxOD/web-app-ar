import { fetchStrapi } from './strapi.js';

export async function loadModels() {
  try {
    const res = await fetchStrapi('models');
    const items = res?.data ?? res;
    return items.map((m) => ({
      id: m.id,
      name: m.attributes?.name || m.name || `model-${m.id}`,
      url: m.attributes?.url || m.url,
    }));
  } catch (e) {
    console.error('CMS error', e);
    return [];
  }
}
