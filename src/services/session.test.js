import { describe, it, expect, beforeEach } from 'vitest';
import { getSession, saveSession, clearSession, getToken } from './session';

describe('session storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns null when no session is stored', () => {
    expect(getSession()).toBeNull();
    expect(getToken()).toBeNull();
  });

  it('round-trips a session and exposes its token', () => {
    const session = { token: 'tok-123', user: { name: 'Jane Doe', email: 'jane@example.com', role: 'Admin' } };
    saveSession(session);
    expect(getSession()).toEqual(session);
    expect(getToken()).toBe('tok-123');
  });

  it('clears the stored session', () => {
    saveSession({ token: 'tok-123', user: { email: 'a@b.c' } });
    clearSession();
    expect(getSession()).toBeNull();
    expect(getToken()).toBeNull();
  });

  it('treats corrupt stored data as no session', () => {
    localStorage.setItem('cloudops.session', '{not valid json');
    expect(getSession()).toBeNull();
  });
});
