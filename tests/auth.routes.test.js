process.env.NODE_ENV = 'test';

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { app, User } from '../server.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import { sign } from './helpers/sign.js';

describe('auth endpoints', () => {
  let originalR2;
  let originalSecret;

  beforeEach(() => {
    vi.restoreAllMocks();
    originalR2 = process.env.R2_BUCKET;
    originalSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = 'secret';
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.R2_BUCKET = originalR2;
    process.env.JWT_SECRET = originalSecret;
  });

  it('POST /auth/register creates user', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue(null);
    vi.spyOn(bcrypt, 'hash').mockResolvedValue('h');
    vi.spyOn(User, 'create').mockResolvedValue({ _id: 1, role: 'user' });

    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'u', email: 'e', password: 'p' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      jwt: sign({ id: '1', role: 'user' }, 'secret'),
      role: 'user',
    });
  });

  it('POST /auth/login returns token', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue({
      _id: 1,
      passwordHash: 'h',
      role: 'user',
    });
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'e', password: 'p' });

    expect(res.status).toBe(200);
    expect(res.body.role).toBe('user');
    const payload = jwt.verify(res.body.jwt, 'secret');
    expect(payload).toEqual(expect.objectContaining({ id: '1', role: 'user' }));
  });

  it('GET /api/me returns current user', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue({
      _id: 1,
      email: 'e',
      role: 'user',
    });
    const token = sign({ id: '1', role: 'user' }, 'secret');

    const res = await request(app)
      .get('/api/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ id: 1, email: 'e', role: 'user' });
  });

  it('PUT /api/me updates profile', async () => {
    const save = vi.fn();
    vi.spyOn(User, 'findOne').mockResolvedValue({
      _id: 1,
      email: 'e',
      username: 'u',
      role: 'user',
      save,
    });
    const token = sign({ id: '1', role: 'user' }, 'secret');

    const res = await request(app)
      .put('/api/me')
      .set('Authorization', `Bearer ${token}`)
      .send({ username: 'new' });

    expect(res.status).toBe(200);
    expect(save).toHaveBeenCalled();
    expect(res.body).toEqual({ id: 1, email: 'e', role: 'user' });
  });

  it('rate limits /auth/login', async () => {
    vi.resetModules();
    process.env.RATE_LIMIT_MAX = '1';
    const { app: rlApp, User: RLUser } = await import('../server.js');
    vi.spyOn(RLUser, 'findOne').mockResolvedValue({
      _id: 1,
      passwordHash: 'h',
      role: 'user',
    });
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    await request(rlApp)
      .post('/auth/login')
      .send({ email: 'e', password: 'p' });
    const res = await request(rlApp)
      .post('/auth/login')
      .send({ email: 'e', password: 'p' });

    expect(res.status).toBe(429);
    delete process.env.RATE_LIMIT_MAX;
  });
});
