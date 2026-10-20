#!/usr/bin/env node
// Live smoke test for a running CloudOps deployment.
//
//   npm run smoke -- https://site-xxx.freebuff.page
//   npm run smoke -- http://localhost:8787 --worker
//   npm run preview
//   npm run smoke -- http://localhost:4173 --static
//
// --worker (default): also checks auth routes and security headers, which only
//   exist when the Cloudflare Worker is serving.
// --static: app shell, built assets, sitemap and 404 only. Use it against a
//   production build (`npm run preview`), not the Vite dev server, which
//   serves source modules and rewrites every path to index.html.
//
// Exits non-zero on failure so CI or a deploy script can gate on it.
import process from 'node:process';

const args = process.argv.slice(2);
const base = (args.find((a) => !a.startsWith('--')) || 'http://localhost:3000').replace(/\/$/, '');
const mode = args.includes('--static') ? 'static' : 'worker';
const timeoutMs = 15000;

const results = [];
function record(name, ok, detail) {
  results.push({ name, ok, detail });
  const status = ok === 'skip' ? 'SKIP' : ok ? 'PASS' : 'FAIL';
  console.log(`${status.padEnd(4)} ${name}${detail ? ` — ${detail}` : ''}`);
}

async function request(path, init = {}) {
  const response = await fetch(`${base}${path}`, {
    redirect: 'manual',
    signal: AbortSignal.timeout(timeoutMs),
    ...init,
  });
  const body = await response.text();
  return { response, body, status: response.status, headers: response.headers };
}

function headerSummary(headers) {
  return {
    csp: headers.get('content-security-policy'),
    nosniff: headers.get('x-content-type-options'),
    frame: headers.get('x-frame-options'),
    referrer: headers.get('referrer-policy'),
    permissions: headers.get('permissions-policy'),
    coOp: headers.get('cross-origin-opener-policy'),
    hsts: headers.get('strict-transport-security'),
  };
}

async function main() {
  console.log(`\nCloudOps live smoke test\n  base: ${base}\n  mode: ${mode}\n`);

  // 1. Document shell
  const home = await request('/', { headers: { Accept: 'text/html,application/xhtml+xml' } });
  const homeOk =
    home.status === 200 &&
    home.response.headers.get('content-type')?.includes('text/html') &&
    home.body.includes('<div id="root">') &&
    home.body.includes('CloudOps');
  record('GET / serves the SPA shell', homeOk, `${home.status} ${home.response.headers.get('content-type')}`);
  if (!homeOk) return finish();

  const title = home.body.match(/<title>([^<]*)<\/title>/)?.[1] ?? '(no title)';
  const hasDescription = /<meta name="description"/.test(home.body);
  record('Document metadata', Boolean(title !== '(no title)' && hasDescription), `title="${title}", description=${hasDescription}`);

  // 2. Deep-link fallback
  const deep = await request('/dashboard', { headers: { Accept: 'text/html' } });
  record(
    'GET /dashboard falls back to the SPA',
    deep.status === 200 && deep.body.includes('<div id="root">'),
    `${deep.status} ${deep.response.headers.get('content-type')}`
  );

  // 3. Hashed entry asset referenced by the document
  const assetPath = home.body.match(/src="(\/assets\/[^"]+\.js)"/)?.[1];
  if (assetPath) {
    const asset = await request(assetPath, { headers: { Accept: '*/*' } });
    record(
      `GET ${assetPath}`,
      asset.status === 200 && /javascript/.test(asset.response.headers.get('content-type') || ''),
      `${asset.status} ${asset.response.headers.get('content-type')}`
    );
  } else {
    record('Hashed entry asset found in HTML', false, 'no /assets/*.js script tag (dev server?)');
  }

  // 4. Static files
  for (const [path, expect] of [
    ['/favicon.svg', 'image/svg+xml'],
    ['/robots.txt', 'text/plain'],
    ['/sitemap.xml', 'xml'],
  ]) {
    const res = await request(path);
    record(`GET ${path}`, res.status === 200 && (res.response.headers.get('content-type') || '').includes(expect), `${res.status} ${res.response.headers.get('content-type')}`);
  }

  // 5. Sitemap must not advertise dead routes
  try {
    const sitemap = await request('/sitemap.xml');
    const locs = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const dead = locs.filter((loc) => /\/(login|signup)(\/|$)/.test(loc));
    record('Sitemap has no dead /login or /signup URLs', dead.length === 0, `${locs.length} URL(s)${dead.length ? `, dead: ${dead.join(', ')}` : ''}`);
  } catch (error) {
    record('Sitemap check', false, error.message);
  }

  // 6. Missing asset must 404 (not be masked by index.html). This is the
  // Worker's job; plain static hosts may legitimately SPA-fallback the path.
  if (mode === 'worker') {
    const missing = await request('/assets/definitely-missing.js', { headers: { Accept: '*/*' } });
    record(
      'Missing asset returns 404, not HTML',
      missing.status === 404 && !(missing.response.headers.get('content-type') || '').includes('text/html'),
      `${missing.status} ${missing.response.headers.get('content-type')}`
    );
  } else {
    record('Missing asset returns 404, not HTML', 'skip', 'static host may SPA-fallback unknown paths');
  }

  if (mode === 'worker') {
    // 7. Security headers
    const h = headerSummary(home.response.headers);
    record('Header: X-Content-Type-Options', h.nosniff === 'nosniff', h.nosniff || 'missing');
    record('Header: X-Frame-Options', h.frame === 'DENY', h.frame || 'missing');
    record('Header: Referrer-Policy', Boolean(h.referrer), h.referrer || 'missing');
    record('Header: Permissions-Policy', Boolean(h.permissions), h.permissions || 'missing');
    record('Header: COOP', Boolean(h.coOp), h.coOp || 'missing');
    record(
      'CSP allows app, fonts and avatar CDN',
      Boolean(
        h.csp &&
          h.csp.includes("default-src 'self'") &&
          h.csp.includes('fonts.googleapis.com') &&
          h.csp.includes('fonts.gstatic.com') &&
          h.csp.includes("img-src 'self' data: https:")
      ),
      h.csp ? h.csp.slice(0, 120) + '…' : 'missing'
    );
    if (base.startsWith('https://')) {
      record('Header: HSTS', Boolean(h.hsts), h.hsts || 'missing');
    }

    // 8. Auth routes (Worker only)
    const session = await request('/auth/freebuff/session', { headers: { Accept: 'application/json' } });
    const sessionIsJson = /application\/json/.test(session.response.headers.get('content-type') || '');
    if (!sessionIsJson) {
      record('Auth: signed-out session', 'skip', 'session returned HTML — auth disabled (no FREEBUFF_CLIENT_ID)');
    } else {
      let parsed;
      try {
        parsed = JSON.parse(session.body);
      } catch {
        parsed = null;
      }
      record(
        'Auth: signed-out session returns { user: null }',
        session.status === 200 && parsed !== null && 'user' in parsed && parsed.user === null,
        session.body.slice(0, 120)
      );

      const signin = await request('/auth/freebuff/signin?returnTo=%2Fdashboard', {
        headers: { Accept: 'text/html' },
      });
      const location = signin.headers.get('location') || '';
      const redirectsToIssuer = signin.status >= 300 && signin.status < 400 && /^https?:/.test(location);
      const hasCallback = /redirect_uri=[^&]*%2Fauth%2Ffreebuff%2Fcallback|redirect_uri=[^&]*\/auth\/freebuff\/callback/.test(location);
      record(
        'Auth: /signin redirects to the OIDC issuer',
        redirectsToIssuer,
        `${signin.status} ${location ? location.split('?')[0] : 'no Location'}`
      );
      record('Auth: redirect includes the callback URI', hasCallback, hasCallback ? 'ok' : location.slice(0, 160));

      const signout = await request('/auth/freebuff/signout', {
        method: 'POST',
        headers: { Origin: base, Accept: 'text/html' },
      });
      record(
        'Auth: same-origin POST signout is accepted',
        signout.status < 400,
        `${signout.status} ${signout.headers.get('location') || ''}`
      );

      const forged = await request('/auth/freebuff/signout', {
        method: 'POST',
        headers: { Origin: 'https://evil.example', Accept: 'text/html' },
      });
      record(
        'Auth: foreign-origin signout is rejected (CSRF)',
        forged.status === 403,
        `${forged.status}`
      );
    }
  }

  finish();
}

function finish() {
  const failed = results.filter((r) => r.ok === false);
  const skipped = results.filter((r) => r.ok === 'skip');
  console.log(
    `\n${results.length - failed.length - skipped.length} passed, ${failed.length} failed, ${skipped.length} skipped\n`
  );
  if (failed.length) {
    console.log('Failed checks:');
    for (const failure of failed) console.log(`  - ${failure.name}${failure.detail ? ` (${failure.detail})` : ''}`);
    console.log('');
  }
  process.exit(failed.length ? 1 : 0);
}

main().catch((error) => {
  console.error(`\nSmoke test aborted: ${error.message}\n`);
  process.exit(1);
});
