# CloudOps Command Center

A modern, responsive cloud infrastructure management dashboard built with React. Includes a marketing landing page and a full command center with mock data, protected by Sign in with Freebuff.

## Tech Stack

- React 19
- Vite
- Tailwind CSS v4
- React Router DOM
- Lucide React (icons)
- Recharts (charts)
- Axios (API)
- @freebuff/auth (Sign in with Freebuff)

## Documentation

Start with [docs/PRD.md](docs/PRD.md) for scope, then:

| Document | Contents |
| --- | --- |
| [docs/PRD.md](docs/PRD.md) | Users, goals, implemented capabilities, non-goals, success metrics |
| [docs/design.md](docs/design.md) | Colour/type tokens, layout, component inventory, interaction + a11y rules |
| [docs/architecture.md](docs/architecture.md) | SPA + Worker + auth flows, build/deploy, security boundaries |
| [docs/database.md](docs/database.md) | Current mock shapes and the planned D1 schema |
| [docs/API.md](docs/API.md) | Auth routes and the full data endpoint contract |
| [docs/agents.md](docs/agents.md) | Commands, conventions, PR workflow, deploy, security, QA |
| [docs/implementation-plan.md](docs/implementation-plan.md) | Milestones M0–M6 with acceptance criteria |

## Getting Started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

> **Local demo mode.** `npm run dev` serves the SPA with no Worker behind
> it, so `/auth/freebuff/*` does not exist there. Rather than bounce you to
> the not-found page, the dev server runs in **demo mode**: every sign-in
> control opens the dashboard with a local identity (`Local demo`),
> protected routes are reachable, and the sidebar offers *Exit demo* instead
> of posting a sign-out that has no server. Demo mode is compiled out of
> `npm run build` — a `wrangler dev` or deployed bundle always keeps the real
> Worker session.
>
> To exercise the full sign-in/sign-out flow locally, run `npx wrangler dev`
> with the development client ID returned by `sites_enable_auth` (see
> [docs/agents.md](docs/agents.md#6-deploy-flow-freebuff-sites)).

## Authentication

All `/dashboard`…`/settings` routes are protected — signed-out visitors are
sent back to the landing page with an `?authReturnTo=` param, and after
sign-in they are returned to the page they asked for. (Plain `npm run dev`
runs in demo mode instead, as described above.)

Auth is **always** Sign in with Freebuff — there is no app password, no
signup form, and no token in browser storage:

- The Worker (`worker.js`) wraps the request handler with `@freebuff/auth`,
  so `/auth/freebuff/{signin,callback,signout,session}` own an httpOnly
  session cookie (OIDC + PKCE, verified server-side).
- The SPA reads only `GET /auth/freebuff/session` (via `useFreebuffUser`)
  to display name/email/avatar; the browser never sees or decodes tokens.
- Sign-in is `<SignInWithFreebuff />` on the landing page; sign-out is
  `<SignOutButton />` (a same-site POST) in the sidebars.
- The only client-side storage kept is the `authReturnTo` sessionStorage
  key the landing page uses to restore the requested page after sign-in.

Deployed environments get `FREEBUFF_CLIENT_ID` / `FREEBUFF_ISSUER` /
`APP_ORIGIN` injected by the platform; `npm run build:worker` bundles the
Worker with `@freebuff/auth` inlined.

All asset responses pass through the Worker's `SECURITY_HEADERS`: a CSP
(limited to self, Google Fonts and https images), `nosniff`,
`X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, COOP and
HSTS. `worker.test.js` asserts them — update it when changing the policy,
and add the API origin to `connect-src` if the backend is cross-origin.

## Routes

| Route          | Description                     |
| -------------- | ------------------------------- |
| `/`            | Landing page (Sign in with Freebuff) |
| `/dashboard`   | Overview dashboard              |
| `/instances`   | EC2 instance management         |
| `/monitoring`  | Live metrics and health         |
| `/alerts`      | Alert configuration and history |
| `/activity`    | Activity and audit logs         |
| `/users`       | User management                 |
| `/settings`    | Preferences and thresholds      |
| `/404`         | Not-found page (also catches unknown URLs) |

`/login` and `/signup` no longer exist — auth is delegated to Freebuff.

## Backend Integration

To connect to a FastAPI backend:

1. Copy `.env.example` to `.env.local`
2. Set `VITE_API_BASE_URL` to your API URL
3. Set `VITE_USE_MOCK=false` — every service in `src/services/` then calls the real API instead of the bundled mock data
4. Expected endpoints are documented in each file under `src/services/`

The API must authenticate requests from the Worker's httpOnly session
cookie — there is no bearer token to attach. Mock mode is the default
(`VITE_USE_MOCK=true` or unset).

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm run preview  # preview production build
npm run lint     # run oxlint (unused vars fail the lint)
npm test         # run the Vitest suite once
npm run test:watch  # run tests in watch mode
npm run smoke -- <url>  # live HTTP smoke test against a running deployment
```

## Tests

Vitest + React Testing Library (jsdom) cover the service layer, the `useApi`
hook, the auth flow and the Worker. `worker.test.js` runs in the node
environment:

- `src/services/api.test.js` — axios interceptors (response unwrapping,
  error normalization)
- `src/services/services.test.js` — entity services in mock mode
- `src/hooks/useApi.test.jsx` — loading, error, retry, dependency changes, `setData`
- `src/context/AuthContext.test.jsx` — the session surface from
  `useFreebuffUser` (user mapping, signed-out null, loading) and
  `ProtectedRoute` redirects with `authReturnTo`
- `src/pages/Landing.authReturn.test.jsx` — the sign-in returnTo round trip
  (sessionStorage hand-off, restore after sign-in)
- `src/utils/format.test.js` — `authReturnTo` validation helpers
- `src/utils/demoMode.test.js` — the demo-mode gate (off under the test
  runner and in every build)
- `src/demoMode.test.jsx` — demo mode end to end: Get Started opens the
  dashboard, protected routes need no session, Exit demo replaces sign-out
- `src/App.routes.test.jsx` — stale `/auth/freebuff/*` links land on the
  landing page instead of the not-found page when no Worker is serving
- `src/pages/*.test.jsx` — page error/retry states, the instance delete
  flow (confirm/cancel/failure, unit tier) and its end-to-end integration
  path through the real service and fixtures (integration tier)
- `src/components/layout/AppLayout.a11y.test.jsx` — one `<h1>` per page and
  the main/navigation landmarks in the app shell
- `worker.test.js` — SPA deep-link fallback, missing-asset 404s, the
  missing-assets-binding 500, and every security header/CSP directive

### Live smoke test

`npm run smoke -- <url>` exercises a **running** site over HTTP: SPA shell
and metadata, deep-link fallback, the hashed entry asset, favicon/robots/
sitemap (including a guard against dead `/login`/`/signup` URLs), missing
assets returning 404, the security headers/CSP, and — when the Worker is
serving — the auth surface: signed-out session JSON, the OIDC sign-in
redirect, same-origin signout and the foreign-origin 403.

```bash
npm run smoke -- https://<deployed-preview>
npm run smoke -- http://localhost:8787           # wrangler dev (Worker + auth)
npm run preview                                  # serve the build on 4173
npm run smoke -- http://localhost:4173 --static  # built assets only, no Worker
```

It exits non-zero on failure, so it can gate a deploy. Run the Worker
locally with `npm run build && npm run build:worker && npx wrangler dev
--config wrangler.test.json` plus the development auth variables — see
[docs/agents.md](docs/agents.md#6-deploy-flow-freebuff-sites).

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs `npm run lint`, `npm test`
and `npm run build` on every push and pull request (Node 24). The
contribution workflow — branch → PR → CI green → review → merge — is in
[docs/agents.md](docs/agents.md#5-feature-development-workflow).
