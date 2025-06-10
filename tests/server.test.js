import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { app, Model } from '../server.js';

process.env.NODE_ENV = 'test';

describe('API endpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('GET /api/models returns data', async () => {
    vi.spyOn(Model, 'find').mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi.fn().mockResolvedValue([{ name: 'foo', url: 'a.glb' }]),
    });
    const res = await request(app).get('/api/models');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ name: 'foo', url: 'a.glb' }]);
  });

  it('GET /model/:file without bucket returns 500', async () => {
    delete process.env.R2_BUCKET;
    const res = await request(app).get('/model/test.glb');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: 'R2_BUCKET environment variable not configured',
    });
  });
});
