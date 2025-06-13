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
    fetch.mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({}) });
    await login('user@example.com', 'pass');
    const base = import.meta.env.VITE_API_BASE_URL || '';
    expect(fetch).toHaveBeenCalledWith(
      base + '/auth/login',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com', password: 'pass' }),
      }),
    );
  });

  it('throws server error text', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ error: 'Invalid credentials' }),
    });
    await expect(login('e', 'p')).rejects.toThrow('Invalid credentials');
  });
});

describe('register', () => {
  it('sends POST to /auth/register', async () => {
    fetch.mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({}) });
    await register('u', 'e', 'p');
    const base = import.meta.env.VITE_API_BASE_URL || '';
    expect(fetch).toHaveBeenCalledWith(
      base + '/auth/register',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'u', email: 'e', password: 'p' }),
      }),
    );
  });

  it('throws server error text', async () => {
    fetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ error: 'Email exists' }),
    });
    await expect(register('u', 'e', 'p')).rejects.toThrow('Email exists');
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
