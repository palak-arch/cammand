# Remaining Tasks

_Last updated: 2026-10-20. Check items off as you finish; ask the agent to
handle anything marked "[agent]". Done items record **what was verified**,
not just what was attempted._

## 🔴 Tomorrow's must-dos

- [x] **Check the first CI run** — ✅ verified 2026-10-18: run #7 on
      commit `31ed575` (auth cleanup) completed with conclusion `success`
      (lint → test → build) at https://github.com/palak-arch/cammand/actions
      . Only the browser click-through below remains unverified.
- [ ] **Browser click-through of the live preview** — ⛔ blocked 2026-10-20:
      the preview environment is **unpublished** (`unpublished_at`
      2026-10-19 18:05 UTC) and the URL returns **404**, so this check cannot
      run. Publish the environment (or deploy the current build and publish)
      first. Then: open
      https://site-9d0ba7e1d9014c13b19727c1bbee8378.freebuff.page , click
      **Sign in with Freebuff** on the landing page, complete the sign-in,
      confirm you land back on the requested page, then check your name and
      avatar in the sidebar, the "signed in as…" notice in **Settings**
      (Dismiss works), and **Sign Out** in the sidebar (a POST handled by the
      Worker). The auth-cleanup build that was live on 2026-10-18 has since
      been taken down, so re-verify against a fresh deploy.
- [x] **Local Worker live test** — ✅ 2026-10-20: `npx wrangler dev` with
      the development auth client ran the real Worker over `dist/` and the
      new `npm run smoke -- http://localhost:8787` passed **20/20** checks:
      SPA shell + metadata, deep-link fallback, hashed asset, favicon/robots/
      sitemap (no dead URLs), missing-asset 404, all security headers/CSP,
      signed-out session `{user:null}`, OIDC sign-in redirect with callback,
      same-origin signout 303, and foreign-origin signout 403. The actual
      Freebuff account consent step still needs a browser.

## 🟡 Google Search Console (from today's session)

- [ ] Go to https://search.google.com/search-console → **Add property** →
      **URL prefix** → paste `https://site-9d0ba7e1d9014c13b19727c1bbee8378.freebuff.page`
- [ ] Verification method **HTML tag** → copy the `content="…"` code and
      **paste it in the chat** → [agent] adds the meta tag and redeploys
- [ ] After **Verify** succeeds: left menu → **Sitemaps** → submit
      `sitemap.xml` (already live at /sitemap.xml)

## 🟢 When ready to go bigger

- [ ] **Custom domain** — add it in the Freebuff Sites settings, then tell
      the agent to update sitemap.xml + robots.txt URLs and re-verify
- [ ] **Production environment** — when you want the real site live: agent
      enables Sign in with Freebuff on production and publishes it
      (preview stays as-is)
- [ ] **Real backend** — the last big one for going live properly: replace
      the bundled mock data with a real API (e.g., Workers + D1), keep
      `VITE_USE_MOCK=false`; the frontend already routes every read/write
      through the service layer, so it plugs in without UI changes

## 🚀 SEO & launch readiness (do after the basics above)

- [ ] **Fast loading on real devices** — run a Lighthouse audit (mobile
      preset) on the live preview and aim for Performance ≥ 90. The bundle
      is already lean (~100 kB gz); re-check after any new pages or images.
- [ ] **Works on mobile** — open the site on an actual phone (or Chrome
      DevTools device mode): landing, login, dashboard, tables, and the
      mobile sidebar must all be usable with no overlap or horizontal scroll.
- [ ] **No broken links** — click every link on the public pages (nav,
      footer, CTAs, auth links). [agent] can also add an automated
      link-check script to CI so this never regresses.
- [ ] **Post useful content** — add pages/posts that answer specific
      questions your customers search for (e.g. "how to monitor EC2 CPU
      usage", "EC2 cost monitoring checklist"). One genuinely helpful page
      beats ten thin ones.
- [ ] **SEO on every page** — unique `<title>` and `<meta name="description">`
      per page with the keywords people actually search; one clear `<h1>`
      per page; descriptive alt text on images. [agent] can audit
      index.html and wire per-route document titles.

## 📚 Documentation pack (in /docs) — ✅ completed 2026-10-20

- [x] **docs/PRD.md** — target users, goals/non-goals, implemented
      capabilities per page, success metrics, risks, open questions
- [x] **docs/design.md** — navy tokens, type scale, layout/breakpoints,
      component inventory, interaction + a11y standards, dark-mode gap
- [x] **docs/architecture.md** — SPA → Worker (Freebuff auth) → service
      layer → mocks/real API, request flows, build/deploy, security
      boundaries, perf numbers, known gaps
- [x] **docs/database.md** — current mock shapes/enums + planned D1 schema
      (users, instances, alerts, alert_events, activities, settings,
      metric_samples), indexes, retention, migration strategy
- [x] **docs/API.md** — auth routes and every data endpoint the services
      call, request/response examples, error normalisation, mock-mode
      table, missing endpoints
- [x] **docs/agents.md** — commands, conventions, PR/deploy workflow,
      auth/security rules, MCP setup, integrations, QA, debugging
- [x] **docs/implementation-plan.md** — milestones M0–M6 with dates,
      acceptance criteria and process-item status
- [x] **README.md** — updated with the docs index, security headers and the
      new Worker/a11y tests

## 🧩 Project process

- [x] **Project implementation plan** — ✅ 2026-10-20:
      `docs/implementation-plan.md` (M0 docs/security → M1 D1 read paths →
      M2 mutations/settings → M3 alert delivery → M4 QA/observability →
      M5 launch), each with acceptance criteria and dependencies
- [x] **Setup & initialisation** — ✅ verified 2026-10-20: export of
      committed HEAD → `npm ci` (193 packages) → copy `.env.example` to
      `.env.local` → `npm run dev` served `/` with 200 and `VITE_USE_MOCK`
      resolved to `true` (mock mode). No hidden local state required.
- [x] **Feature development workflow** — ✅ documented 2026-10-20 in
      `docs/agents.md` §5 (branch → implement + tests → local gate → PR →
      CI green → review → merge, plus hotfix path). Remaining: enable
      branch protection on `main` in GitHub settings (user action), so the
      PR rule is enforced rather than convention.
- [x] **Authentication & security** — ✅ auth cleanup 2026-10-18; ✅
      2026-10-20: single-`<h1>` bug fixed (sidebar brand rendered a second
      h1 on every app page) and enforced by `AppLayout.a11y.test.jsx`;
      Worker now sets CSP + nosniff + frame-deny + referrer policy +
      permissions policy + COOP + HSTS on every asset response, covered by
      `worker.test.js` (9 tests). ⏳ Remaining: periodic dependency audit
      (3 high advisories: axios/nanoid/source-map-js — see
      `docs/implementation-plan.md` M4/M6) and CSP tightening (self-host
      Inter, drop script `'unsafe-inline'`) in M5.
- [ ] **MCP connection** — ⏳ blocked on user action: connect the GitHub MCP
      server in the Freebuff client and authorise `palak-arch/cammand`.
      Setup steps, scopes and guardrails are in `docs/agents.md` §8; no
      token may be committed.
- [ ] **Integrations** — ⏳ planned and prioritised in
      `docs/agents.md` §9 + `docs/implementation-plan.md` (backend M1/M2,
      alert channels M3, error monitoring/analytics M4). Nothing is wired
      yet; mock data remains the default.
- [ ] **Testing & QA** — ✅ 2026-10-20: Worker fallback/header tests (+10)
      and shell a11y test (+2) added; suite is 59 tests. ✅ Added
      `scripts/smoke.mjs` / `npm run smoke -- <url>` (20 live HTTP checks,
      exits non-zero on failure). ⏳ Next: Playwright E2E for sign-in →
      dashboard → acknowledge → sign-out, axe pass and a coverage threshold
      (implementation plan M4).
- [ ] **Debugging** — establish the workflow: error logging/monitoring
      (e.g., Sentry), source maps in preview, bug-report checklist
- [x] **Debugging basics** — ✅ 2026-10-20: symptom→cause table in
      `docs/agents.md` §11 (blank page, deep-link 404, sign-in loop,
      session HTML, stuck spinner, CSP blocks, flaky full-suite runs)

## 🔵 Nice-to-haves (agent can do anytime)

- [ ] Error-path tests for Dashboard & Monitoring pages (hook-level covered;
      page-level would complete the set)
- [ ] Dark mode via Tailwind v4 `@custom-variant dark`
- [ ] LICENSE file (MIT?) — currently none
