import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { loadModels } from '../src/utils/models.js';

beforeEach(() => {
  global.fetch = vi.fn();
});

afterEach(() => {
  vi.restoreAllMocks();
  delete global.fetch;
});

describe('loadModels', () => {
  it('returns list from API', async () => {
    const mockJson = vi.fn().mockResolvedValue([{ name: 'm1', url: 'm1.glb' }]);
    fetch.mockResolvedValue({ ok: true, json: mockJson });

    const models = await loadModels();

    expect(fetch).toHaveBeenCalledWith('/api/models');
    expect(models).toEqual([{ name: 'm1', url: 'm1.glb' }]);
  });

  it('returns empty array on error', async () => {
    fetch.mockRejectedValue(new Error('fail'));
    const models = await loadModels();
    expect(models).toEqual([]);
  });
});
