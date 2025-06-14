import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { logEvent } from '../src/utils/analytics.js';

describe('logEvent error', () => {
  beforeEach(() => {
    import.meta.env.VITE_ANALYTICS_ENDPOINT = 'https://example.com';
    global.fetch = vi.fn().mockRejectedValue(new Error('fail'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logs error when fetch rejects', async () => {
    logEvent('event');
    await new Promise((r) => setTimeout(r, 0));
    expect(fetch).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalled();
  });
});
