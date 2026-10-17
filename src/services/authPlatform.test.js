import { describe, it, expect, vi, afterEach } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.resetModules();
});

async function loadPlatformMode() {
  vi.resetModules();
  vi.stubEnv('VITE_AUTH_PLATFORM', 'true');
  return import('./authService');
}

describe('platform auth mode (VITE_AUTH_PLATFORM=true)', () => {
  it('reads the session from the Worker and maps the user shape', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { sub: 'usr-1', name: 'Jane Doe', email: 'jane@freebuff.com' } }),
    }));
    const { platformAuth } = await loadPlatformMode();

    const session = await platformAuth.getSession();

    expect(fetch).toHaveBeenCalledWith('/auth/freebuff/session', expect.objectContaining({ credentials: 'same-origin' }));
    expect(session.user).toEqual({ name: 'Jane Doe', email: 'jane@freebuff.com', role: 'Member' });
  });

  it('derives a name from the email when the profile has none', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ user: { sub: 'usr-2', email: 'jane.doe@freebuff.com' } }),
    }));
    const { platformAuth } = await loadPlatformMode();

    const session = await platformAuth.getSession();
    expect(session.user.name).toBe('Jane Doe');
  });

  it('returns null when signed out or the endpoint fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ user: null }) }));
    const { platformAuth } = await loadPlatformMode();
    expect(await platformAuth.getSession()).toBeNull();

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 404 }));
    expect(await platformAuth.getSession()).toBeNull();

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(await platformAuth.getSession()).toBeNull();
  });

  it('builds a sign-in URL that returns to the requested page', async () => {
    const { platformAuth } = await loadPlatformMode();
    expect(platformAuth.signInUrl('/instances')).toBe('/auth/freebuff/signin?returnTo=%2Finstances');
    expect(platformAuth.signInUrl()).toBe('/auth/freebuff/signin?returnTo=%2Fdashboard');
  });

  it('signs out with a POST form, never a link', async () => {
    const submitted = [];
    const fakeForm = { method: '', action: '', submit() { submitted.push({ method: this.method, action: this.action }); } };
    vi.stubGlobal('document', {
      createElement: () => ({ ...fakeForm }),
      body: { appendChild() {} },
    });
    const { platformAuth } = await loadPlatformMode();

    platformAuth.signOut();

    expect(submitted).toEqual([{ method: 'POST', action: '/auth/freebuff/signout' }]);
  });
});

describe('demo mode default', () => {
  it('does not enable platform auth without the build flag', async () => {
    const config = await import('./config');
    expect(config.usePlatformAuth).toBe(false);
  });
});
