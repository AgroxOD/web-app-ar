process.env.NODE_ENV = 'test';

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { S3Client } from '@aws-sdk/client-s3';

describe('R2 connectivity check', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('skips ListBucketsCommand when NODE_ENV is test', async () => {
    const spy = vi.spyOn(S3Client.prototype, 'send').mockResolvedValue({});
    await import('../server.js');
    expect(spy).not.toHaveBeenCalled();
  });
});
