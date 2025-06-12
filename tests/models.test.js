process.env.NODE_ENV = 'test';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app, Model, User } from '../server.js';

import { sign } from './helpers/sign.js';

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
    vi.spyOn(Model, 'findById').mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        name: 'm',
        url: 'm.glb',
        markerIndex: 1,
      }),
    });

    const res = await request(app).get('/api/models/123');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ name: 'm', url: 'm.glb', markerIndex: 1 });
  });

  it('PUT /api/models/:id updates model', async () => {
    process.env.JWT_SECRET = 's';
    const token = sign({ id: '1', role: 'admin' }, 's');
    vi.spyOn(User, 'findOne').mockResolvedValue({ role: 'admin' });
    const spy = vi.spyOn(Model, 'findByIdAndUpdate').mockReturnValue({
      lean: vi.fn().mockResolvedValue({
        name: 'x',
        url: 'x.glb',
        markerIndex: 2,
      }),
    });

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

  it('PUT /api/models/:id without Authorization returns 401', async () => {
    process.env.JWT_SECRET = 's';
    const spy = vi
      .spyOn(Model, 'findByIdAndUpdate')
      .mockReturnValue({ lean: vi.fn() });

    const res = await request(app)
      .put('/api/models/123')
      .send({ name: 'x', url: 'x.glb', markerIndex: 2 });

    expect(res.status).toBe(401);
    expect(spy).not.toHaveBeenCalled();
  });

  it('PUT /api/models/:id with non-admin returns 403', async () => {
    process.env.JWT_SECRET = 's';
    const token = sign({ id: '1', role: 'user' }, 's');
    vi.spyOn(User, 'findOne').mockResolvedValue({ role: 'user' });
    const spy = vi
      .spyOn(Model, 'findByIdAndUpdate')
      .mockReturnValue({ lean: vi.fn() });

    const res = await request(app)
      .put('/api/models/123')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'x', url: 'x.glb', markerIndex: 0 });

    expect(res.status).toBe(403);
    expect(spy).not.toHaveBeenCalled();
  });

  it('DELETE /api/models/:id removes model', async () => {
    process.env.JWT_SECRET = 's';
    const token = sign({ id: '1', role: 'admin' }, 's');
    vi.spyOn(User, 'findOne').mockResolvedValue({ role: 'admin' });
    const spy = vi.spyOn(Model, 'findByIdAndDelete').mockReturnValue({
      lean: vi.fn().mockResolvedValue({}),
    });

    const res = await request(app)
      .delete('/api/models/123')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(spy).toHaveBeenCalledWith('123');
  });

  it('DELETE /api/models/:id without Authorization returns 401', async () => {
    process.env.JWT_SECRET = 's';
    const spy = vi
      .spyOn(Model, 'findByIdAndDelete')
      .mockReturnValue({ lean: vi.fn() });

    const res = await request(app).delete('/api/models/123');

    expect(res.status).toBe(401);
    expect(spy).not.toHaveBeenCalled();
  });

  it('DELETE /api/models/:id with non-admin returns 403', async () => {
    process.env.JWT_SECRET = 's';
    const token = sign({ id: '1', role: 'user' }, 's');
    vi.spyOn(User, 'findOne').mockResolvedValue({ role: 'user' });
    const spy = vi
      .spyOn(Model, 'findByIdAndDelete')
      .mockReturnValue({ lean: vi.fn() });

    const res = await request(app)
      .delete('/api/models/123')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(spy).not.toHaveBeenCalled();
  });
});
