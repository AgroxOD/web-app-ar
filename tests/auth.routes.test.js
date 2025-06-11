import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import request from 'supertest';
import { app, User } from '../server.js';
import bcrypt from 'bcryptjs';
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

describe('auth endpoints', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    process.env.JWT_SECRET = 'secret';
  });

  afterEach(() => {
    vi.restoreAllMocks();
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
