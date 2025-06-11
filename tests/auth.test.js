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
});
afterEach(() => {
  vi.restoreAllMocks();
  delete global.localStorage;
});

describe('login', () => {
  it('sends POST to /auth/login', async () => {
    fetch.mockResolvedValue({ ok: true, json: vi.fn() });
    await login('user@example.com', 'pass');
    expect(fetch).toHaveBeenCalledWith(
      '/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com', password: 'pass' }),
      }),
    );
  });

  it('throws on error status', async () => {
    fetch.mockResolvedValue({ ok: false, status: 400 });
    await expect(login('e', 'p')).rejects.toThrow('Login failed: 400');
  });
});

describe('register', () => {
  it('sends POST to /auth/register', async () => {
    fetch.mockResolvedValue({ ok: true, json: vi.fn() });
    await register('u', 'e', 'p');
    expect(fetch).toHaveBeenCalledWith(
      '/auth/register',
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
