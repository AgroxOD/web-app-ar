/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const authMocks = {
  login: vi.fn(),
  register: vi.fn(),
  logout: vi.fn(),
  isAuthenticated: vi.fn(),
  setAuth: vi.fn(),
  getRole: vi.fn(),
};
vi.mock('../src/utils/auth.js', () => authMocks);

const modelsMocks = {
  loadModels: vi.fn().mockResolvedValue([]),
  deleteModel: vi.fn(),
};
vi.mock('../src/utils/models.js', () => modelsMocks);

vi.mock('../src/utils/editForm.js', () => ({ showEditForm: vi.fn() }));

let store;
let oldBase;

beforeEach(() => {
  vi.restoreAllMocks();
  vi.resetModules();

  oldBase = process.env.VITE_API_BASE_URL;
  process.env.VITE_API_BASE_URL = '';

  Object.values(authMocks).forEach((fn) => fn.mockReset());
  Object.values(modelsMocks).forEach((fn) => fn.mockReset());
  modelsMocks.loadModels.mockResolvedValue([]);

  global.fetch = vi.fn();
  store = {};
  global.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => (store[k] = v),
    removeItem: (k) => delete store[k],
  };

  document.body.innerHTML = `
    <form id="login-form" style="display:flex">
      <input id="login-email" />
      <input id="login-password" />
    </form>
    <form id="register-form" style="display:none">
      <input id="register-username" />
      <input id="register-email" />
      <input id="register-password" />
    </form>
    <button id="logout" style="display:none"></button>
    <button id="show-register"></button>
    <button id="show-login"></button>
    <div id="upload-section" style="display:none">
      <form id="upload-form">
        <input id="upload-file" type="file" />
        <input id="upload-marker" value="0" />
        <button type="submit"></button>
      </form>
    </div>
    <ul id="models-list"></ul>
    <div id="message"></div>
  `;
});

afterEach(() => {
  delete global.localStorage;
  vi.restoreAllMocks();
  if (oldBase === undefined) delete process.env.VITE_API_BASE_URL;
  else process.env.VITE_API_BASE_URL = oldBase;
});

async function importCp() {
  return await import('../src/cp.js');
}

function flush() {
  return new Promise((r) => setTimeout(r, 0));
}

describe('cp page interactions', () => {
  it('handles login form', async () => {
    authMocks.isAuthenticated.mockReturnValue(false);
    authMocks.getRole.mockReturnValue('user');
    authMocks.login.mockImplementation(async () => {
      authMocks.isAuthenticated.mockReturnValue(true);
      authMocks.getRole.mockReturnValue('admin');
      return { jwt: 't', role: 'admin' };
    });

    await importCp();

    document.getElementById('login-email').value = 'e';
    document.getElementById('login-password').value = 'p';
    document
      .getElementById('login-form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flush();

    expect(authMocks.login).toHaveBeenCalledWith('e', 'p');
    expect(authMocks.setAuth).toHaveBeenCalledWith('t', 'admin');
    expect(document.getElementById('login-form').style.display).toBe('none');
    expect(document.getElementById('logout').style.display).toBe(
      'inline-block',
    );
  });

  it('handles register form', async () => {
    authMocks.isAuthenticated.mockReturnValue(false);
    authMocks.getRole.mockReturnValue('user');
    authMocks.register.mockImplementation(async () => {
      authMocks.isAuthenticated.mockReturnValue(true);
      authMocks.getRole.mockReturnValue('admin');
      return { jwt: 't', role: 'admin' };
    });

    await importCp();

    document.getElementById('register-username').value = 'u';
    document.getElementById('register-email').value = 'e';
    document.getElementById('register-password').value = 'p';
    document
      .getElementById('register-form')
      .dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    await flush();

    expect(authMocks.register).toHaveBeenCalledWith('u', 'e', 'p');
    expect(authMocks.setAuth).toHaveBeenCalledWith('t', 'admin');
    expect(document.getElementById('register-form').style.display).toBe('none');
    expect(document.getElementById('logout').style.display).toBe(
      'inline-block',
    );
  });

  it('handles logout button', async () => {
    authMocks.isAuthenticated.mockReturnValue(true);
    authMocks.getRole.mockReturnValue('admin');
    authMocks.logout.mockImplementation(() => {
      authMocks.isAuthenticated.mockReturnValue(false);
    });

    await importCp();

    document
      .getElementById('logout')
      .dispatchEvent(new Event('click', { bubbles: true }));
    await flush();

    expect(authMocks.logout).toHaveBeenCalled();
    expect(document.getElementById('logout').style.display).toBe('none');
    expect(document.getElementById('login-form').style.display).toBe('flex');
  });

  it('uploads model', async () => {
    authMocks.isAuthenticated.mockReturnValue(true);
    authMocks.getRole.mockReturnValue('admin');
    fetch.mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue({}) });

    const cp = await importCp();
    const refreshSpy = vi.spyOn(cp, 'refreshModels');
    const showSpy = vi.spyOn(cp, 'showMessage');
    const form = document.getElementById('upload-form');
    const fileInput = document.getElementById('upload-file');
    const file = new File(['x'], 'm.glb');
    Object.defineProperty(fileInput, 'files', { value: [file] });
    const resetSpy = vi.spyOn(form, 'reset');

    form.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    await flush();

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, opts] = fetch.mock.calls[0];
    const base = import.meta.env.VITE_API_BASE_URL || '';

    expect(url).toBe(`${base}/upload`);

    expect(opts.headers).toEqual({});
    expect(opts.method).toBe('POST');
    const body = opts.body;
    expect(body).toBeInstanceOf(FormData);
    expect(body.get('model')).toEqual(file);
    expect(body.get('markerIndex')).toBe('0');
    expect(resetSpy).toHaveBeenCalled();
    expect(showSpy).toHaveBeenCalledWith('Uploaded');
    expect(refreshSpy).toHaveBeenCalled();
  });
});
