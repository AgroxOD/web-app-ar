import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { logEvent } from '../ar-app/src/utils/analytics.js';

describe('logEvent', () => {
  beforeEach(() => {
    global.fetch = vi.fn().mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sends POST when endpoint defined', async () => {
    import.meta.env.VITE_ANALYTICS_ENDPOINT = 'https://example.com/analytics';

    await logEvent('testEvent', { a: 1 });

    expect(fetch).toHaveBeenCalledWith(
      'https://example.com/analytics',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  it('does nothing when endpoint empty', async () => {
    import.meta.env.VITE_ANALYTICS_ENDPOINT = '';

    await logEvent('testEvent');

    expect(fetch).not.toHaveBeenCalled();
  });
});
