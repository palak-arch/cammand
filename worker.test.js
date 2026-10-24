// @vitest-environment node
import { describe, it, expect } from 'vitest';
import worker from './worker.js';

const FILES = {
  '/index.html': { body: '<!doctype html><div id="root"></div>', type: 'text/html' },
  '/assets/app.js': { body: 'console.log("app")', type: 'text/javascript' },
  '/favicon.svg': { body: '<svg/>', type: 'image/svg+xml' },
};

// Mirrors the Workers ASSETS binding closely enough for routing tests:
// a missing file is a 404 that the Worker may turn into index.html.
function assetsBinding() {
  return {
    async fetch(request) {
      const { pathname } = request instanceof URL ? request : new URL(request.url);
      const file = pathname === '/' ? '/index.html' : pathname;
      const found = FILES[file];
      if (!found) return new Response('not found', { status: 404 });
      return new Response(found.body, {
        status: 200,
        headers: { 'Content-Type': found.type, 'Cache-Control': 'public, max-age=60' },
      });
    },
  };
}

const env = { ASSETS: assetsBinding() };

function get(path, accept = 'text/html,application/xhtml+xml') {
  return worker.fetch(
    new Request(`https://cloudops.example${path}`, { headers: { Accept: accept } }),
    env
  );
}

async function expectHtml(response, text) {
  expect(response.status).toBe(200);
  expect(response.headers.get('Content-Type')).toContain('text/html');
  expect(await response.text()).toContain(text);
}

describe('serveAssets routing', () => {
  it('serves the SPA shell at /', async () => {
    await expectHtml(await get('/'), '<div id="root">');
  });

  it('serves real assets with their own content type', async () => {
    const response = await get('/assets/app.js', '*/*');
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toContain('text/javascript');
    expect(await response.text()).toBe('console.log("app")');
  });

  it('falls back to index.html for a deep link navigation', async () => {
    await expectHtml(await get('/instances'), '<div id="root">');
    await expectHtml(await get('/does-not-exist'), '<div id="root">');
  });

  it('does not disguise a missing asset as HTML', async () => {
    const response = await get('/assets/missing.js', '*/*');
    expect(response.status).toBe(404);
    expect(await response.text()).toBe('not found');
  });

  it('returns 404 for a non-HTML request to an unknown path', async () => {
    const response = await get('/api/unknown', 'application/json');
    expect(response.status).toBe(404);
  });

  it('fails loudly when the assets binding is missing', async () => {
    const response = await worker.fetch(new Request('https://cloudops.example/'), {});
    expect(response.status).toBe(500);
    expect(await response.text()).toBe('Assets not bound');
  });
});

describe('local auth configuration', () => {
  it('accepts a loopback APP_ORIGIN for wrangler dev (and still serves assets)', async () => {
    const response = await worker.fetch(
      new Request('http://localhost:8787/', { headers: { Accept: 'text/html' } }),
      {
        ...env,
        FREEBUFF_CLIENT_ID: 'test-client-id',
        FREEBUFF_ISSUER: 'http://localhost:8787/oidc',
        APP_ORIGIN: 'http://localhost:8787',
      }
    );

    expect(response.status).toBe(200);
    expect(await response.text()).toContain('<div id="root">');
  });
});

describe('security headers', () => {
  it('sets baseline hardening headers on documents and assets', async () => {
    for (const response of [await get('/'), await get('/instances'), await get('/assets/missing.js', '*/*')]) {
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
      expect(response.headers.get('Cross-Origin-Opener-Policy')).toBe('same-origin');
      expect(response.headers.get('Permissions-Policy')).toBe(
        'camera=(), microphone=(), geolocation=()'
      );
      expect(response.headers.get('Strict-Transport-Security')).toContain('max-age=');
    }
  });

  it('ships a CSP that permits the app, its avatar CDN and Inter', async () => {
    const csp = (await get('/')).headers.get('Content-Security-Policy');

    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    expect(csp).toContain('https://fonts.googleapis.com');
    expect(csp).toContain('https://fonts.gstatic.com');
    expect(csp).toContain("img-src 'self' data: https:");
    expect(csp).toContain("connect-src 'self'");
  });

  it('does not strip the asset response headers it copies', async () => {
    const response = await get('/assets/app.js', '*/*');
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=60');
  });
});
