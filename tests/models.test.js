import { vi, describe, it, expect } from 'vitest';
import { loadModels } from '../src/utils/models.js';
import { fetchStrapi } from '../src/utils/strapi.js';

vi.mock('../src/utils/strapi.js', () => ({
  fetchStrapi: vi.fn(),
}));

describe('loadModels', () => {
  it('transforms response from Strapi', async () => {
    fetchStrapi.mockResolvedValue({
      data: [
        { id: 1, attributes: { name: 'm1', url: 'm1.glb' } },
        { id: 2, attributes: { name: 'm2', url: 'm2.glb' } },
      ],
    });
    const models = await loadModels();
    expect(models).toEqual([
      { id: 1, name: 'm1', url: 'm1.glb' },
      { id: 2, name: 'm2', url: 'm2.glb' },
    ]);
  });

  it('returns empty array on error', async () => {
    fetchStrapi.mockRejectedValue(new Error('fail'));
    const models = await loadModels();
    expect(models).toEqual([]);
  });
});
