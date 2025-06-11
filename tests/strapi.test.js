import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchStrapi } from '../src/utils/strapi.js';

beforeEach(() => {
  global.fetch = vi.fn();
  process.env.VITE_STRAPI_URL = 'http://cms.com/api/';
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.VITE_STRAPI_URL;
});

describe('fetchStrapi', () => {
  it('builds URL from VITE_STRAPI_URL', async () => {
    const mockJson = vi.fn().mockResolvedValue({ ok: true });
    fetch.mockResolvedValue({ ok: true, json: mockJson });

    await fetchStrapi('models');

    expect(fetch).toHaveBeenCalledWith('http://cms.com/api/models');
    expect(mockJson).toHaveBeenCalled();
  });

  it('throws on non-OK response', async () => {
    fetch.mockResolvedValue({ ok: false, status: 500 });

    await expect(fetchStrapi('models')).rejects.toThrow(
      'Strapi request failed: 500',
    );
  });
});
