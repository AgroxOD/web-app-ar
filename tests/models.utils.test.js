import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

let originalEnv;

describe('loadModels', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env = { ...originalEnv };
    delete global.fetch;
  });

  it('falls back to VITE_MODEL_URL when fetch fails', async () => {
    process.env.VITE_MODEL_URL = 'fallback.glb';
    vi.resetModules();
    const err = new Error('fail');
    const fetchMock = vi.fn().mockRejectedValue(err);
    global.fetch = fetchMock;
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { loadModels } = await import('../src/utils/models.js');
    const list = await loadModels();
    expect(errorSpy).toHaveBeenCalledWith('API error', err);
    expect(list).toEqual([{ url: 'fallback.glb', markerIndex: 0 }]);
  });

  it('falls back to VITE_MODEL_URL when API returns empty list', async () => {
    process.env.VITE_MODEL_URL = 'fallback.glb';
    vi.resetModules();
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue([]),
    });
    global.fetch = fetchMock;
    const { loadModels } = await import('../src/utils/models.js');
    const list = await loadModels();
    expect(list).toEqual([{ url: 'fallback.glb', markerIndex: 0 }]);
  });
});
