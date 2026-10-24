import { createFreebuffAuth } from '@freebuff/auth';

// One auth instance per isolate (caches discovery + signing keys).
let auth;
let wrappedApp;

// Security headers for every asset/document response. Kept in one place so
// worker.test.js can assert them. Notes:
// - script-src needs 'unsafe-inline' for Vite's module-preload bootstrap.
// - img-src allows https: because the Freebuff avatar can live on any CDN.
// - Google Fonts needs the two font origins; self-host Inter to tighten this.
// - connect-src 'self' must gain the API origin if the backend is cross-origin.
const SECURITY_HEADERS = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "img-src 'self' data: https:",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self'",
    "form-action 'self'",
    'upgrade-insecure-requests',
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

// `baseUrl` must be https in production. Local `wrangler dev` runs on http,
// so allow the SDK's insecure-localhost mode only when APP_ORIGIN is a
// loopback address — a deployed origin can never take this branch.
function isLoopbackOrigin(origin) {
  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  } catch {
    return false;
  }
}

function withSecurityHeaders(response) {
  const headers = new Headers(response.headers);
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(name, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

// CloudOps is a static SPA. Navigation requests with no matching file fall
// back to index.html so deep links like /dashboard and /instances work.
async function serveAssets(request, env) {
  const response = await env.ASSETS.fetch(request);
  const acceptsHtml = (request.headers.get('Accept') || '').includes('text/html');

  if (response.status === 404 && acceptsHtml) {
    const url = new URL(request.url);
    return withSecurityHeaders(await env.ASSETS.fetch(new URL('/index.html', url)));
  }

  return withSecurityHeaders(response);
}

export default {
  async fetch(request, env) {
    if (!env.ASSETS) {
      return withSecurityHeaders(new Response('Assets not bound', { status: 500 }));
    }

    // Deployed environments get real Sign in with Freebuff (platform injects
    // FREEBUFF_CLIENT_ID / FREEBUFF_ISSUER / APP_ORIGIN). Local dev has no
    // vars and serves the demo app unchanged.
    if (env.FREEBUFF_CLIENT_ID) {
      auth ??= createFreebuffAuth({
        clientId: env.FREEBUFF_CLIENT_ID,
        issuer: env.FREEBUFF_ISSUER,
        baseUrl: env.APP_ORIGIN,
        allowInsecureLocalhost: isLoopbackOrigin(env.APP_ORIGIN),
      });
      const signedIn = auth;
      // wrap() intercepts /auth/freebuff/{signin,callback,signout,session}
      // (setting httpOnly session cookies) before any asset or API handling.
      wrappedApp ??= signedIn.wrap((request, env) => serveAssets(request, env));
      return wrappedApp(request, env);
    }

    return serveAssets(request, env);
  },
};
