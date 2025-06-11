import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  login,
  register,
  isAuthenticated,
  setToken,
  logout,
} from '../src/utils/auth.js';

let store;

beforeEach(() => {
  global.fetch = vi.fn();
  store = {};
  global.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => {
      store[k] = v;
    },
    removeItem: (k) => {
      delete store[k];
    },
  };
  process.env.VITE_STRAPI_URL = 'http://cms.com/api';
});

afterEach(() => {
  vi.restoreAllMocks();
  delete process.env.VITE_STRAPI_URL;
  delete global.localStorage;
});

describe('login', () => {
  it('sends POST to auth/local', async () => {
    fetch.mockResolvedValue({ ok: true, json: vi.fn() });
    await login('user', 'pass');
    expect(fetch).toHaveBeenCalledWith(
      'http://cms.com/api/auth/local',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: 'user', password: 'pass' }),
      }),
    );
  });

  it('throws on error status', async () => {
    fetch.mockResolvedValue({ ok: false, status: 400 });
    await expect(login('u', 'p')).rejects.toThrow('Login failed: 400');
  });
});

describe('register', () => {
  it('sends POST to auth/local/register', async () => {
    fetch.mockResolvedValue({ ok: true, json: vi.fn() });
    await register('u', 'e', 'p');
    expect(fetch).toHaveBeenCalledWith(
      'http://cms.com/api/auth/local/register',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'u', email: 'e', password: 'p' }),
      }),
    );
  });
});

describe('auth state', () => {
  it('tracks token', () => {
    expect(isAuthenticated()).toBe(false);
    setToken('t');
    expect(isAuthenticated()).toBe(true);
    logout();
    expect(isAuthenticated()).toBe(false);
  });
});
