import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import { app, Model } from '../server.js';

describe('GET /api/models', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns list of models', async () => {
    vi.spyOn(Model, 'find').mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([{ name: 'm1', url: 'm1.glb' }]),
    });

    const res = await request(app).get('/api/models');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ name: 'm1', url: 'm1.glb' }]);
  });
});
