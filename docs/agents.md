# Working in This Repository — Agent & Contributor Guide

_Last reviewed 2026-10-20. Read this before changing code._

## 1. What this project is

A React 19 + Vite SPA ("CloudOps Command Center") with mock data, served by
a Cloudflare Worker that owns Sign in with Freebuff. No database, no real
cloud API. See [architecture.md](./architecture.md) for the full picture.

## 2. Repository map

```
.
├── index.html                 # SPA shell, meta tags, Inter font
├── worker.js                  # Worker: auth wrap + assets + SPA fallback
├── deploy.manifest.json       # Sites deploy manifest (worker + dist)
├── wrangler.test.json         # Local Worker config (assets + bundle)
├── public/                    # favicon, robots.txt, sitemap.xml
├── scripts/tasks.mjs          # `npm run tasks` — progress from REMAINING_TASKS.md
├── src/
│   ├── main.jsx, App.jsx      # entry, router, lazy routes
│   ├── context/               # AuthContext, ToastContext (+ tests)
│   ├── hooks/                 # useApi, useEscapeKey (+ tests)
│   ├── services/              # api client, config, per-entity services (+ tests)
│   ├── data/                  # mock fixtures — the de facto data contract
│   ├── pages/                 # Landing + 7 app pages (+ tests)
│   ├── components/            # layout/, common/, instances/, alerts/
│   ├── utils/                 # formatting + authReturnTo helpers (+ tests)
│   └── test/setup.js          # jest-dom + DOM shims
├── docs/                      # this documentation pack
├── REMAINING_TASKS.md         # living backlog (source of `npm run tasks`)
└── .github/workflows/ci.yml   # lint → test → build on push/PR
```

## 3. Commands

| Command | What it does | When |
| --- | --- | --- |
| `npm ci` | Reproducible install from `package-lock.json` | Fresh clone / after lockfile change |
| `npm run dev` | Vite dev server on 5173 (SPA only, no Worker) — **demo mode**: sign-in controls open the dashboard locally | UI work |
| `npm test` | Vitest once (jsdom) | Before every commit |
| `npm run test:watch` | Vitest watch | While iterating |
| `npm run lint` | oxlint (unused vars are errors) | Before every commit |
| `npm run build` | Production SPA → `dist/` | Before deploy / to verify |
| `npm run build:worker` | Bundle Worker → `worker.bundle.js` | Before deploy |
| `npm run preview` | Serve `dist/` on 4173 | Sanity-check the build |
| `npm run tasks` | Print the backlog with progress | Planning |
| `npm run smoke -- <url>` | Live HTTP smoke test (shell, assets, sitemap, 404s, headers, auth) | After a deploy; `--static` for SPA-only hosts |
| `npx wrangler dev --config wrangler.test.json` | Worker + assets + auth locally (`run_worker_first` is set so headers/auth cover assets) | Auth changes (needs dev client vars) |

CI (`.github/workflows/ci.yml`) runs `npm ci` → `npm run lint` →
`npm test` → `npm run build` on Node 24 for every push and PR. A red CI is
a blocker, not a suggestion.

## 4. Conventions

- **JavaScript, not TypeScript.** No `.ts`/`.tsx` files exist; don't
  introduce a TS build step casually.
- **Functions:** `export default function Component()`, named exports for
  services/utilities. Arrow functions for handlers.
- **Semicolons:** mixed across the existing files. Match the file you edit;
  don't reformat unrelated lines.
- **Styling:** Tailwind utility classes only, using the tokens in
  `src/index.css` (`navy-*`, `success`, `warning`, `danger`). No CSS
  modules, no styled-components, no raw hex in JSX except chart series.
- **Icons:** `lucide-react`; decorative icons get `aria-hidden="true"`,
  icon-only controls get `aria-label`.
- **Data access:** components never import `src/data/*` directly. Go
  through `src/services/*`. Mock mode is decided in `src/services/config.js`.
- **Async state:** use `useApi` — don't hand-roll loading/error state.
- **Headings:** each page has exactly one `<h1>` via `PageHeader`; the shell
  brand and top-nav label are `<p>`. `AppLayout.a11y.test.jsx` enforces this.
- **Accessibility:** labelled inputs, visible focus rings, `aria-pressed` on
  toggles, `role="status"` on notices, motion-safe animations.
- **Comments:** explain *why*, not *what*. Keep the existing security
  comments (they document decisions that are easy to undo by accident).
- **Lint:** oxlint config lives in `.oxlintrc.json`; `no-unused-vars` is an
  error. Don't add disable comments to get green — delete the dead code.

## 5. Feature development workflow

Do not push directly to `main`.

1. **Branch** from an up-to-date `main`:
   `git switch -c feat/<short-slug>` (or `fix/…`, `docs/…`, `chore/…`).
2. **Scope the change.** One concern per branch. If you need docs + code +
   a dependency, split the dependency into its own PR.
3. **Implement** with tests:
   - New service method → add it to mock mode and `services.test.js`.
   - New page state → cover error/empty/loading in a page test.
   - UI change → verify at 375px, 768px, 1440px.
4. **Run the gate locally:** `npm run lint && npm test && npm run build`.
5. **Commit** in the imperative mood, focused on *why*
   (`Fix sign-in returnTo when the landing page is reloaded`). Do not
   commit `dist/`, `worker.bundle.js`, `.env.local`, or secrets.
6. **Open a PR** against `main` with: what changed, why, how it was
   verified, and screenshots for UI changes. Keep it reviewable (< ~400
   changed lines where possible).
7. **Wait for CI** (lint, test, build) to be green. Fix failures; never
   weaken a test or add a lint suppression to pass.
8. **Review** at least one other person (or a second agent pass) for
   security-relevant changes: auth, CSP/headers, the Worker, and services.
9. **Merge** (squash is fine). Delete the branch. If the deploy is
   affected, follow §6.

Hotfix path: branch from `main`, minimal fix + regression test, PR, CI
green, merge, deploy, then backfill docs.

## 6. Deploy flow (Freebuff Sites)

Only deploy when the user asks. Preview and production are separate
environments with separate databases/auth clients.

1. `npm ci` (if needed) → `npm run lint && npm test && npm run build`.
2. `npm run build:worker` (rebundles `@freebuff/auth` into
   `worker.bundle.js`).
3. Confirm `deploy.manifest.json` still points at `worker.bundle.js` and
   `./dist`, and `compatibilityDate` is intentional.
4. Smoke-test locally where possible: `npx wrangler dev --config
   wrangler.test.json` and check `/`, a deep link, and a missing asset.
5. Deploy **preview first**; run `npm run smoke -- <preview-url>` and fix
   any failure before clicking through. It checks `/`, metadata, the hashed
   asset, `/dashboard` fallback, favicon/robots/sitemap, missing-asset
   404s, every security header, the signed-out session, the OIDC sign-in
   redirect, same-origin signout and the foreign-origin 403.
   Then verify in a browser:
   - `/` renders, assets have correct content types.
   - `/dashboard` deep link works signed out (bounces to `/?authReturnTo=`).
     This is the *built* bundle; plain `npm run dev` opens it in demo mode
     instead, which is what `src/App.routes.test.jsx` and
     `src/demoMode.test.jsx` cover.
   - Sign-in completes and returns to the requested page.
   - Sign-out is a POST and ends the session.
   - No console errors, no 404s in the network panel.
6. Production requires explicit user authorisation. Never flip
   `published` or publish production as part of an unrelated task.
7. Record what shipped (commit, time, environment) in
   `REMAINING_TASKS.md` when it changes the verification state.

**Rollback:** deploy the previous commit's build to the same environment,
or unpublish the environment (keeps code, data and secrets).

## 7. Authentication & security rules

Non-negotiable:

- Auth is **only** Sign in with Freebuff. Never add a password form, a demo
  login, a signup form, or a locally minted session.
- Never store tokens in `localStorage`/`sessionStorage`, never decode the
  session cookie in the browser, never forward it to a third party.
- The browser's user object is for **display**. Authorisation happens on the
  server (`getUser`, then scope by `sub`).
- State-changing endpoints must be POST/PUT/PATCH/DELETE and check
  `isSameOriginRequest` server-side.
- `APP_ORIGIN`/`baseUrl` comes from config, never from the request `Host`.
- Security headers live in `worker.js` (`SECURITY_HEADERS`). If you change
  them, update `worker.test.js` and re-test sign-in and fonts — a CSP
  mistake breaks auth redirects or the Inter webfont.
- If the API becomes cross-origin, add its origin to CSP `connect-src`
  deliberately; don't loosen to `*`.
- Secrets belong in Sites → Secrets or an untracked env file. Never in
  `VITE_*` variables (they are public), never committed, never printed.
- Keep `/login`, `/signup` out of sitemaps/docs copy — those routes do not
  exist.
- Run `npm audit` when touching dependencies; report advisories rather than
  blindly `npm audit fix`-ing (it can upgrade production deps).

## 8. MCP connection (status: not configured)

An MCP server lets an agent manage GitHub issues, PRs and releases
directly instead of shelling out. **Nothing is configured in this
repository today**, and it cannot be configured from repo files alone: it
requires a per-user connection in the client (Freebuff Desktop/Web or the
CLI) plus OAuth/token authorisation.

To set it up (user action):

1. Connect the **GitHub** integration/MCP server in the Freebuff client
   (Integrations/MCP settings).
2. Authorise access to `palak-arch/cammand` with the minimum scopes
   (issues, pull requests, contents read; avoid org-wide admin).
3. Confirm the agent can list issues/PRs for this repository.
4. Keep the token in the client's credential store — never in the repo, an
   `.env` file, or a chat message.

Once connected, the intended uses are: open/close issues from
`REMAINING_TASKS.md`, draft PRs from feature branches, and read CI
conclusions without polling the web UI. Until then, use `gh` locally or the
GitHub web UI, and never claim an MCP-mediated action succeeded without
verifying it.

## 9. Integrations (planned)

None are wired. Current state: mock data, Sign in with Freebuff, no
outbound calls. When adding one:

| Integration | Why | Prerequisite | Where it would live |
| --- | --- | --- | --- |
| **Real backend (D1 or FastAPI)** | Replace mocks; persist mutations | Endpoint contract ([API.md](./API.md)) + schema ([database.md](./database.md)) | Worker `/api/*` or `VITE_API_BASE_URL` |
| **Alert channels (email/Slack)** | Notifications promised in the UI | Provider account + API key; confirmation flow | Server-side only (never send from the browser) |
| **Error monitoring (e.g. Sentry)** | See client/Worker failures | DSN/project; source maps strategy | `main.jsx` init + Worker wrapper |
| **Product analytics (e.g. Plausible)** | Measure triage time | Site ID; privacy review | `index.html` script or Worker beacon |
| **Uptime/status** | Real "Systems Operational" badge | Status provider | Server-side poll + cached response |

Rules:

- Research a provider before integrating; record the choice and env var
  names in this file and in `.env.example`.
- Server-side secrets go through Sites → Secrets. Browser-visible
  identifiers are fine, keys are not.
- Add a health/verification step: an integration that was configured but
  never observed working is not "done".
- Update CSP for any new origin.

## 10. Testing & QA

### Automated (what CI runs)

- `src/services/api.test.js` — interceptor unwrap + error normalisation.
- `src/services/services.test.js` — mock-mode CRUD shapes.
- `src/hooks/useApi.test.jsx` — loading, success, error, retry,
  dependency change, `setData`, unmount safety.
- `src/context/AuthContext.test.jsx` — session mapping, signed-out null,
  loading, protected redirect + `authReturnTo`.
- `src/pages/Landing.authReturn.test.jsx` — returnTo round trip.
- `src/pages/Instances.error.test.jsx`, `src/pages/dataPages.errors.test.jsx`
  — error → retry → recovery on each data page.
- `src/components/layout/AppLayout.a11y.test.jsx` — one `h1`, landmarks.
- `worker.test.js` — SPA fallback, security headers, loopback-auth config
  (node environment).
- `scripts/smoke.mjs` — live HTTP checks against a running deployment
  (`npm run smoke -- <url>`), not part of `npm test`.

Adding a test: colocate `*.test.jsx` next to the file, mock at the network
or service boundary, assert user-visible text/roles rather than internals.

### Manual (must be done in a browser; no E2E yet)

1. Landing renders at 375px and 1440px; CTAs link to the Worker sign-in.
2. Signed out, `/dashboard` bounces to `/?authReturnTo=%2Fdashboard` (on a
   built bundle; `npm run dev` runs demo mode and opens it directly).
3. Sign in, return to `/dashboard`, see name + avatar in the sidebar.
4. Dashboard KPIs/charts render; no console errors.
5. Instances: stop an instance → confirmation → toast + row updates.
6. Alerts: acknowledge/resolve → toast + badge change; details timeline.
7. Activity: filters + pagination; Users: add/edit/deactivate.
8. Settings: save → toast; reload → values persist.
9. Sign out → protected route redirects again.
10. Deep-link `/instances` directly while signed in.

Report which of these you actually observed; never report a manual check as
passed from a build exit code.

### Known gaps

- No Playwright/E2E, no visual regression, no coverage threshold.
- No server API, so no server-side authz tests exist yet.
- The full suite is fast locally (~12 s warm) but the first cold run under
  CPU contention can be slow; don't run it alongside builds.

## 11. Debugging playbook

| Symptom | Likely cause | Check |
| --- | --- | --- |
| Blank page after deploy | Worker asset binding missing / wrong `dist` | Worker 500 "Assets not bound"; manifest paths |
| Deep link 404 | SPA fallback broken or assets layer intercepting | `Accept: text/html` handling, `run_worker_first` |
| Sign-in loop / bad redirect | `APP_ORIGIN` or callback origin mismatch | Deployed origin vs auth client registration |
| `auth/freebuff/session` returns HTML | Worker auth disabled (no `FREEBUFF_CLIENT_ID`) | Local mode vs deployed vars |
| Stuck spinner | A fetch that never settles, or `useApi` deps loop | Network panel; `useApi` effect deps |
| "Could not reach the server" | API down, CORS, or CSP `connect-src` | Network tab + console CSP report |
| Fonts blocked after header change | CSP missing fonts origins | `style-src`/`font-src` |
| Tests fail only in full run | CPU contention / shared mocks restored late | Run the file alone; check `restoreAllMocks` |

## 12. Guardrails

- Don't commit `dist/`, `worker.bundle.js`, `.env.local`, `.wrangler/`, or
  any secret.
- Don't upgrade dependencies or rewrite the lockfile as part of an
  unrelated change.
- Don't weaken tests, skip checks, or add lint suppressions to make CI pass.
- Don't deploy production, force-push, or rewrite history without explicit
  authorisation.
- Don't invent facts about the live site; verify the preview.
- Keep this doc and `REMAINING_TASKS.md` in sync with reality — stale
  checkmarks are worse than open items.
