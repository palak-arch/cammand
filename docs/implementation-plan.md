# CloudOps Command Center — Implementation Plan

_Created 2026-10-20. Dates are targets, not commitments; adjust in the PR
that changes scope._

## 0. Where the project stands (2026-10-20)

| Area | Status |
| --- | --- |
| SPA (landing + 7 protected pages) | ✅ Implemented, mock-backed |
| Sign in with Freebuff | ✅ Implemented (Worker + SPA); browser click-through pending |
| Lint / test / build in CI | ✅ Green (59 tests at the time of writing) |
| Documentation pack | ✅ PRD, design, architecture, database, API, agents, plan |
| Fresh-clone setup | ✅ Verified 2026-10-20 (`npm ci` → `.env.example` → dev boot) |
| Security headers + CSP | ✅ Centralised in `worker.js`, covered by `worker.test.js` |
| Real backend / persistence | ❌ Not started (mock data) |
| E2E tests, observability, alert channels | ❌ Not started |

The UI is ahead of the backend. The plan below closes that gap in the
order that keeps every step shippable.

## 1. Milestones

### M0 — Baseline & docs (done, 2026-10-20)

**Goal:** a clean, documented, secure-by-default starting point.

- [x] Docs pack committed under `docs/`.
- [x] Fresh-clone setup verified from `.env.example` only.
- [x] Single `<h1>` per page enforced by test (shell brand fixed).
- [x] Security headers + CSP on all asset responses, with tests.
- [x] Worker SPA fallback tests (deep links, missing assets, no binding).
- [x] Feature workflow, MCP and integration guidance documented.

**Exit criteria:** `npm run lint`, `npm test`, `npm run build` green; docs
reviewed; no secrets or build artifacts tracked.

---

### M1 — Backend foundation: read paths (2026-10-21 → 2026-11-03, 2 weeks)

**Goal:** the dashboard reads real, persistent data instead of mocks.

Scope:

1. Add a `/api/*` surface to the Worker (before the asset fallback) and a
   D1 binding (`DB`).
2. Create `migrations/0001_init.sql` from
   [database.md §4](./database.md#4-planned-d1-schema); apply per
   environment.
3. Seed instances/alerts/activities/users from `src/data/*` so the UI is
   unchanged after cutover.
4. Implement reads:
   - `GET /api/ec2/instances`, `GET /api/ec2/instances/{id}`
   - `GET /api/alerts`
   - `GET /api/activities`
   - `GET /api/users`
   - `GET /api/monitoring/dashboard`, `GET /api/monitoring/metrics`
5. Gate every route with `getUser`; return `401` JSON when signed out.
6. Point `VITE_API_BASE_URL` at `/api` and flip `VITE_USE_MOCK=false` in
   preview only.

Acceptance criteria:

- Signed out: every `/api/*` route returns `401` and no rows.
- Signed in: the seven pages render the seeded rows; no network request
  hits mock modules.
- Two accounts see the same shared fleet data (fleet data is global), but
  no user can read another's settings (see M2).
- `worker.test.js` (or a new `api.test.js`) covers 401 and one happy path
  per route; tests run against a local D1.
- `npm run build` unchanged in size within ±5 kB (no new client deps).

Risks: D1 schema drift while iterating → keep migrations append-only; use a
preview database first.

---

### M2 — Persist mutations & preferences (2026-11-04 → 2026-11-17, 2 weeks)

**Goal:** actions survive a reload.

Scope:

1. `POST /api/ec2/instances/{id}/{start|stop|restart}` — update state,
   append an activity, idempotent behaviour documented.
2. `PATCH /api/alerts/{id}/acknowledge|resolve` — status + timestamps +
   `alert_events` + activity.
3. `POST/PATCH /api/users` — create/update with role/status validation;
   link the signed-in Freebuff `sub` to a user row on first sign-in
   (server-side, by `sub` only).
4. `GET/PUT /api/users/me/settings` — replace `localStorage`; validate the
   payload against a whitelist.
5. CSRF: `isSameOriginRequest` on every mutation; failures return `403`.
6. Add optimistic-lock or last-write-wins notes; do not silently discard
   conflicting edits.

Acceptance criteria:

- Restart a stopped instance → reload → still stopped; activity log shows
  the action with the actor.
- Acknowledge → resolve an alert → timeline gains both events; resolving
  twice is either idempotent or `409`, consistently.
- Settings saved in one browser appear in another after sign-in.
- A `POST` with a foreign `Origin` returns `403`.
- Mutations tested: happy path, signed-out `401`, forged origin `403`,
  unknown id `404`.

**Decision needed:** keep "instance state" as D1 rows (simulated fleet) or
call a real AWS provider. Recommend D1 first: it proves the pipeline
without credentials. Real AWS becomes M2.5 once an account/role is
available.

---

### M3 — Alert delivery & integrations (2026-11-18 → 2026-12-01, 2 weeks)

**Goal:** alerts reach a human outside the dashboard.

Scope:

1. Notification preferences (already in Settings UI) become real.
2. Email via a transactional provider; Slack via incoming webhook or app.
3. Server-side outbox table (`notifications`) with retry/backoff and a
   dead-letter state; never send provider keys to the browser.
4. Deliver on alert create and on severity escalation; respect per-user
   preferences; deduplicate.
5. Add a "send test notification" action in Settings.

Acceptance criteria:

- A new critical alert produces exactly one email/Slack message per
  subscribed user.
- Failed delivery retries with backoff and is visible in logs; no silent
  drops.
- Keys live in Sites → Secrets; `npm audit` clean of new high advisories.
- CSP unchanged (no new browser-side origins).

---

### M4 — QA, observability, performance (2026-12-02 → 2026-12-15, 2 weeks)

**Goal:** regressions are caught automatically and failures are visible.

Scope:

1. Playwright E2E: sign-in → dashboard → alert acknowledge → sign-out,
   plus a signed-out deep-link redirect. Run in CI against the preview.
2. Error monitoring (e.g. Sentry) for the SPA and the Worker; source maps
   uploaded privately, never served publicly.
3. Accessibility pass with axe on the main routes; fix contrast/labels.
4. Lighthouse mobile on landing + dashboard; budget in CI if practical.
5. Coverage threshold for services/hooks (start at 70%, ratchet later).

Acceptance criteria:

- E2E suite passes locally and in CI; a deliberately broken selector fails
  the run.
- An induced client error appears in the monitor with a readable stack.
- No critical axe violations on `/`, `/dashboard`, `/instances`,
  `/alerts`, `/activity`, `/users`, `/settings`.
- Mobile Lighthouse Performance ≥ 90 on landing, ≥ 85 on dashboard.

---

### M5 — Launch hardening (2026-12-16 → 2026-12-31, 2 weeks)

**Goal:** production-ready preview → production.

Scope:

1. Custom domain + re-registered auth callback; update `sitemap.xml` and
   `robots.txt` URLs.
2. Google Search Console verification + sitemap submission (HTML tag).
3. Tighten CSP: self-host Inter (drop Google Fonts origins), remove
   `'unsafe-inline'` from `script-src` if Vite output allows a hash.
4. Enable auth + publish **production**; keep preview available.
5. Verify production sign-in, deep links, headers, and 404 behaviour.
6. Document rollback and on-call basics.

Acceptance criteria:

- Production sign-in works on the custom domain; callback origin matches.
- Security headers present on the production origin; no CSP violations in
  the console.
- Sitemap lists only live pages (no `/login`, `/signup`).
- `REMAINING_TASKS.md` checkmarks reflect verified reality.

---

### M6 — Ongoing (from 2027-01)

- Content pages answering real searches; per-route `<title>`/description.
- Dark mode via Tailwind v4 `@custom-variant dark`.
- Dependency audit cadence (monthly) and Node LTS upgrades.
- Alert-channel expansion (SMS/PagerDuty) based on usage.
- Retention jobs for `metric_samples` and `activities`.

## 2. Process items requested

| Item | Status 2026-10-20 | Where |
| --- | --- | --- |
| Project implementation plan | ✅ This document, milestones + acceptance criteria | `docs/implementation-plan.md` |
| Setup & initialisation | ✅ Verified from a clean `git archive` + `npm ci` + `.env.example`; dev server booted on 5199 and served 200 | [README](../README.md), [agents.md §3](./agents.md#3-commands) |
| Feature development workflow | ✅ Branch → PR → CI green → review → merge; hotfix and deploy flow documented | [agents.md §5–6](./agents.md#5-feature-development-workflow) |
| Authentication & security | ✅ Freebuff-only auth; single-h1 fix; security headers + CSP + tests. ⏳ Next: server-side authz in M1, dependency audit cadence, CSP tightening in M5 | [agents.md §7](./agents.md#7-authentication--security-rules) |
| MCP connection | ⏳ Blocked on user: connect the GitHub MCP server in the Freebuff client and authorise `palak-arch/cammand`. Steps + guardrails documented | [agents.md §8](./agents.md#8-mcp-connection-status-not-configured) |
| Integrations | ⏳ Planned and prioritised (backend, alert channels, monitoring, analytics) | [agents.md §9](./agents.md#9-integrations-planned) |
| Testing & QA | ✅ Worker fallback/headers tests + shell a11y test added (59 tests). ⏳ Next: Playwright E2E + axe + coverage (M4) | [agents.md §10](./agents.md#10-testing--qa) |

## 3. Suggested sequence & effort

| Order | Milestone | Estimate | Depends on |
| --- | --- | --- | --- |
| 1 | M1 Read paths | 2 weeks | D1 access, schema review |
| 2 | M2 Mutations/settings | 2 weeks | M1, auth `sub` linking decision |
| 3 | M3 Alert delivery | 2 weeks | Provider accounts, M2 |
| 4 | M4 QA/observability | 2 weeks | Can run in parallel with M3 |
| 5 | M5 Launch | 2 weeks | M1–M4, domain |

## 4. Definition of done (every milestone)

- Lint, tests and build green; new behaviour has tests.
- Docs updated (`API.md`, `database.md`, `agents.md` as affected).
- No secrets, no build artifacts, no lockfile churn.
- Preview verified in a browser; manual checks listed explicitly, not
  inferred from CI.
- Rollback path understood.
