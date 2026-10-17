import api from './api';
import { useMock } from './config';
import { saveSession, clearSession } from './session';

function displayNameFromEmail(email) {
  const base = String(email).split('@')[0];
  return base
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Freebuff profile -> the { name, email, role } shape the UI renders. */
export function toAppUser(freebuffUser) {
  if (!freebuffUser) return null;
  const email = freebuffUser.email || '';
  return {
    name: freebuffUser.name || displayNameFromEmail(email) || 'Signed-in user',
    email,
    role: 'Member',
  };
}

/**
 * Real auth on deployed environments: the Worker owns the httpOnly session
 * cookie; the browser only ever reads /auth/freebuff/session for display.
 */
export const platformAuth = {
  async getSession() {
    try {
      const response = await fetch('/auth/freebuff/session', {
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) return null;
      const data = await response.json().catch(() => null);
      return data?.user ? { token: 'freebuff-session', user: toAppUser(data.user) } : null;
    } catch {
      // Network failure: treat as signed out (the server still enforces access).
      return null;
    }
  },

  signInUrl(returnTo = '/dashboard') {
    return `/auth/freebuff/signin?returnTo=${encodeURIComponent(returnTo)}`;
  },

  signIn(returnTo = '/dashboard') {
    window.location.assign(platformAuth.signInUrl(returnTo));
  },

  /** Sign-out must be a same-site POST — a plain link would let other sites sign visitors out. */
  signOut() {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = '/auth/freebuff/signout';
    document.body.appendChild(form);
    form.submit();
  },
};

export const authService = {
  async login({ email, password }) {
    if (!email || !password) throw new Error('Enter your email and password.');

    if (useMock) {
      // Demo mode: any credentials with a valid email and 8+ char password sign in.
      if (String(password).length < 8) throw new Error('Password must be at least 8 characters.');
      return saveSession({
        token: `mock-token-${Date.now()}`,
        user: { name: displayNameFromEmail(email), email, role: 'Admin' },
      });
    }

    const data = await api.post('/auth/login', { email, password });
    const token = data.token || data.access_token;
    if (!token) throw new Error('The server did not return an access token.');
    return saveSession({ token, user: data.user || { email } });
  },

  async signup({ name, email, password }) {
    if (!name || !email || !password) throw new Error('Fill in your name, email and password.');
    if (String(password).length < 8) throw new Error('Password must be at least 8 characters.');

    if (useMock) {
      return saveSession({
        token: `mock-token-${Date.now()}`,
        user: { name, email, role: 'Admin' },
      });
    }

    const data = await api.post('/auth/register', { name, email, password });
    const token = data.token || data.access_token;
    if (!token) throw new Error('The server did not return an access token.');
    return saveSession({ token, user: data.user || { name, email } });
  },

  logout() {
    clearSession();
  },
};
