import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app, Model } from '../server.js';
import crypto from 'crypto';

function sign(payload, secret) {
  const header = Buffer.from(
    JSON.stringify({ alg: 'HS256', typ: 'JWT' }),
  ).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', secret)
    .update(`${header}.${body}`)
    .digest('base64url');
  return `${header}.${body}.${signature}`;
}

describe('model routes', () => {
  let originalSecret;

  beforeEach(() => {
    vi.restoreAllMocks();
    originalSecret = process.env.JWT_SECRET;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.JWT_SECRET = originalSecret;
  });

  it('GET /api/models returns list', async () => {
    vi.spyOn(Model, 'find').mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi
        .fn()
        .mockResolvedValue([{ name: 'm1', url: 'm1.glb', markerIndex: 0 }]),
    });

    const res = await request(app).get('/api/models');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ name: 'm1', url: 'm1.glb', markerIndex: 0 }]);
  });

  it('GET /api/models/:id returns single model', async () => {
    vi.spyOn(Model, 'findById').mockResolvedValue({
      name: 'm',
      url: 'm.glb',
      markerIndex: 1,
    });

    const res = await request(app).get('/api/models/123');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ name: 'm', url: 'm.glb', markerIndex: 1 });
  });

  it('PUT /api/models/:id updates model', async () => {
    process.env.JWT_SECRET = 's';
    const token = sign({ id: 1 }, 's');
    const spy = vi
      .spyOn(Model, 'findByIdAndUpdate')
      .mockResolvedValue({ name: 'x', url: 'x.glb', markerIndex: 2 });

    const res = await request(app)
      .put('/api/models/123')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'x', url: 'x.glb', markerIndex: 2 });

    expect(res.status).toBe(200);
    expect(spy).toHaveBeenCalledWith(
      '123',
      { name: 'x', url: 'x.glb', markerIndex: 2 },
      { new: true },
    );
  });

  it('DELETE /api/models/:id removes model', async () => {
    process.env.JWT_SECRET = 's';
    const token = sign({ id: 1 }, 's');
    const spy = vi.spyOn(Model, 'findByIdAndDelete').mockResolvedValue({});

    const res = await request(app)
      .delete('/api/models/123')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(spy).toHaveBeenCalledWith('123');
  });
});
