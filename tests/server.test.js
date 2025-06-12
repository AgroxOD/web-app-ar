process.env.NODE_ENV = 'test';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app, Model, main } from '../server.js';
import mongoose from 'mongoose';
import { sign } from './helpers/sign.js';
import { S3Client } from '@aws-sdk/client-s3';

describe('API endpoints', () => {
  let originalR2;
  let originalSecret;

  beforeEach(() => {
    vi.restoreAllMocks();
    originalR2 = process.env.R2_BUCKET;
    originalSecret = process.env.JWT_SECRET;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    process.env.R2_BUCKET = originalR2;
    process.env.JWT_SECRET = originalSecret;
  });

  it('GET /api/models returns data', async () => {
    vi.spyOn(Model, 'find').mockReturnValue({
      select: vi.fn().mockReturnThis(),
      lean: vi
        .fn()
        .mockResolvedValue([{ name: 'foo', url: 'a.glb', markerIndex: 0 }]),
    });
    const res = await request(app).get('/api/models');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ name: 'foo', url: 'a.glb', markerIndex: 0 }]);
  });

  it('GET /model/:file without bucket returns 500', async () => {
    delete process.env.R2_BUCKET;
    const res = await request(app).get('/model/test.glb');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: 'R2_BUCKET environment variable not configured',
    });
  });

  it('exits process when MongoDB connection fails', async () => {
    vi.spyOn(mongoose, 'connect').mockRejectedValue(new Error('fail'));
    const exitSpy = vi.spyOn(process, 'exit').mockImplementation(() => {
      /* no-op for tests */
    });
    await main();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('POST /upload rejects unauthorized', async () => {
    process.env.R2_BUCKET = 'b';
    // set secret so auth middleware doesn't return 500
    process.env.JWT_SECRET = 'dummy-secret';
    const res = await request(app)
      .post('/upload')
      .attach('model', Buffer.from('data'), 'm.glb');
    expect(res.status).toBe(401);
  });

  it('POST /upload fails when JWT_SECRET missing', async () => {
    process.env.R2_BUCKET = 'b';
    delete process.env.JWT_SECRET;
    const res = await request(app)
      .post('/upload')
      .set('Authorization', 'Bearer token')
      .attach('model', Buffer.from('data'), 'm.glb');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: 'JWT_SECRET environment variable not configured',
    });
  });

  it('POST /upload fails when R2_BUCKET missing', async () => {
    process.env.JWT_SECRET = 's';
    delete process.env.R2_BUCKET;
    const token = sign({ id: 1 }, 's');
    const res = await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('model', Buffer.from('data'), 'm.glb');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      error: 'R2_BUCKET environment variable not configured',
    });
  });

  it('POST /upload accepts valid token', async () => {
    process.env.R2_BUCKET = 'b';
    process.env.JWT_SECRET = 's';
    vi.spyOn(S3Client.prototype, 'send').mockResolvedValue({});
    const updateSpy = vi.spyOn(Model, 'updateOne').mockResolvedValue({});
    const token = sign({ id: 1 }, 's');
    const res = await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${token}`)
      .field('markerIndex', '2')
      .attach('model', Buffer.from('data'), 'm.glb');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ key: 'm.glb' });
    expect(updateSpy).toHaveBeenCalledWith(
      { url: 'm.glb' },
      expect.objectContaining({ markerIndex: 2 }),
      { upsert: true },
    );
  });

  it('POST /upload rejects oversized file', async () => {
    process.env.R2_BUCKET = 'b';
    process.env.JWT_SECRET = 's';
    const token = sign({ id: 1 }, 's');
    const big = Buffer.alloc(11 * 1024 * 1024, 'a');
    const res = await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('model', big, 'big.glb');
    expect(res.status).toBe(413);
  });

  it('POST /upload rejects invalid filename', async () => {
    process.env.R2_BUCKET = 'b';
    process.env.JWT_SECRET = 's';
    const sendSpy = vi.spyOn(S3Client.prototype, 'send').mockResolvedValue({});
    const token = sign({ id: 1 }, 's');
    const res = await request(app)
      .post('/upload')
      .set('Authorization', `Bearer ${token}`)
      .attach('model', Buffer.from('data'), { filename: '../evil.glb' });
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid filename' });
    expect(sendSpy).not.toHaveBeenCalled();
  });
});
