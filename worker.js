import { createFreebuffAuth } from '@freebuff/auth';

// One auth instance per isolate (caches discovery + signing keys).
let auth;
let wrappedApp;

// CloudOps is a static SPA. Navigation requests with no matching file fall
// back to index.html so deep links like /dashboard and /instances work.
async function serveAssets(request, env) {
  const response = await env.ASSETS.fetch(request);
  const acceptsHtml = (request.headers.get('Accept') || '').includes('text/html');

  if (response.status === 404 && acceptsHtml) {
    const url = new URL(request.url);
    return env.ASSETS.fetch(new URL('/index.html', url));
  }

  return response;
}

export default {
  async fetch(request, env) {
    if (!env.ASSETS) return new Response('Assets not bound', { status: 500 });

    // Deployed environments get real Sign in with Freebuff (platform injects
    // FREEBUFF_CLIENT_ID / FREEBUFF_ISSUER / APP_ORIGIN). Local dev has no
    // vars and serves the demo app unchanged.
    if (env.FREEBUFF_CLIENT_ID) {
      auth ??= createFreebuffAuth({
        clientId: env.FREEBUFF_CLIENT_ID,
        issuer: env.FREEBUFF_ISSUER,
        baseUrl: env.APP_ORIGIN,
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
