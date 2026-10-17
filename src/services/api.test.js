import { describe, it, expect, vi, beforeEach } from 'vitest';

// Fake axios instance captured at module init so we can exercise the real
// interceptor functions api.js registers — no network involved.
const { instance, requestHandlers, responseHandlers } = vi.hoisted(() => {
  const requestHandlers = [];
  const responseHandlers = [];
  const instance = {
    interceptors: {
      request: { use: (fn) => requestHandlers.push(fn) },
      response: { use: (ok, err) => responseHandlers.push({ ok, err }) },
    },
    get: vi.fn(),
    post: vi.fn(),
  };
  return { instance, requestHandlers, responseHandlers };
});

vi.mock('axios', () => ({ default: { create: () => instance } }));

import api from './api';
import { saveSession, clearSession } from './session';

const attachToken = requestHandlers[0];
const { ok: unwrapData, err: normalizeError } = responseHandlers[0];

async function caught(promise) {
  try {
    await promise;
    throw new Error('expected rejection');
  } catch (error) {
    return error;
  }
}

describe('api client', () => {
  beforeEach(() => {
    clearSession();
  });

  it('exports the configured axios instance', () => {
    expect(api).toBe(instance);
  });

  it('attaches the bearer token when a session exists', () => {
    saveSession({ token: 'tok-123', user: { email: 'a@b.c' } });
    const config = attachToken({ headers: {} });
    expect(config.headers.Authorization).toBe('Bearer tok-123');
  });

  it('does not set Authorization without a session', () => {
    const config = attachToken({ headers: {} });
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('unwraps response data on success', () => {
    expect(unwrapData({ data: { ok: true, items: [1] } })).toEqual({ ok: true, items: [1] });
  });

  it('normalizes server errors using the API detail message', async () => {
    const error = await caught(normalizeError({ response: { status: 401, data: { detail: 'Invalid credentials' } } }));
    expect(error.message).toBe('Invalid credentials');
    expect(error.status).toBe(401);
  });

  it('falls back to a status message when the body has no detail', async () => {
    const error = await caught(normalizeError({ response: { status: 500, data: {} } }));
    expect(error.message).toBe('Request failed with status 500.');
  });

  it('reports timeouts with a friendly message', async () => {
    const error = await caught(normalizeError({ code: 'ECONNABORTED' }));
    expect(error.message).toBe('The request timed out. Please try again.');
  });

  it('wraps network failures', async () => {
    const error = await caught(normalizeError({ message: 'Network Error' }));
    expect(error.message).toBe('Could not reach the server: Network Error');
  });
});
