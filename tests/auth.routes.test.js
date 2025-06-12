import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { app, User } from '../server.js';
import bcrypt from 'bcryptjs';
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
    vi.spyOn(User, 'create').mockResolvedValue({ _id: 1 });

    const res = await request(app)
      .post('/auth/register')
      .send({ username: 'u', email: 'e', password: 'p' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ jwt: sign({ id: 1 }, 'secret') });
  });

  it('POST /auth/login returns token', async () => {
    vi.spyOn(User, 'findOne').mockResolvedValue({ _id: 1, passwordHash: 'h' });
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'e', password: 'p' });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ jwt: sign({ id: 1 }, 'secret') });
  });
});
