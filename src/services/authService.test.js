import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from './authService';
import { getSession, clearSession } from './session';

async function caught(promise) {
  try {
    await promise;
    throw new Error('expected rejection');
  } catch (error) {
    return error;
  }
}

describe('authService (mock mode)', () => {
  beforeEach(() => {
    clearSession();
  });

  it('rejects login without credentials', async () => {
    const error = await caught(authService.login({ email: '', password: '' }));
    expect(error.message).toMatch(/email and password/i);
  });

  it('rejects a password shorter than 8 characters', async () => {
    const error = await caught(authService.login({ email: 'a@b.c', password: 'short' }));
    expect(error.message).toMatch(/at least 8 characters/i);
  });

  it('signs in with any valid credentials and derives a display name', async () => {
    const session = await authService.login({ email: 'jane.doe@example.com', password: 'password1' });
    expect(session.token).toMatch(/^mock-token-/);
    expect(session.user).toMatchObject({ name: 'Jane Doe', email: 'jane.doe@example.com', role: 'Admin' });
    expect(getSession()).toEqual(session);
  });

  it('rejects signup with missing fields', async () => {
    const error = await caught(authService.signup({ name: '', email: 'a@b.c', password: 'password1' }));
    expect(error.message).toMatch(/name, email and password/i);
  });

  it('creates an account session with the provided name', async () => {
    const session = await authService.signup({ name: 'Sam Ops', email: 'sam@cloudops.io', password: 'password1' });
    expect(session.user).toMatchObject({ name: 'Sam Ops', email: 'sam@cloudops.io', role: 'Admin' });
    expect(getSession()).toEqual(session);
  });

  it('logout clears the stored session', async () => {
    await authService.login({ email: 'a@b.c', password: 'password1' });
    authService.logout();
    expect(getSession()).toBeNull();
  });
});
