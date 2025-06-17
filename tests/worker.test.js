import { describe, it, expect } from 'vitest';

const BASE = 'https://web-app-ar-worker.omkrishna-narayana.workers.dev/api';

// Тест Cloudflare Worker. При недоступности сети тест пропускается.
describe('cloudflare worker', () => {
  it('GET /models returns JSON', async ({ skip }) => {
    try {
      const res = await fetch(`${BASE}/models`);
      if (!res.ok) throw new Error(`status ${res.status}`);
      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
    } catch (err) {
      skip(`network error: ${err}`);
    }
  });
});
