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

## Getting Started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

> `npm run dev` serves the SPA only (no Worker), so sign-in links need the
> Worker: run `npx wrangler dev` with the development client ID returned by
> `sites_enable_auth` to exercise the full sign-in/sign-out flow locally.

## Authentication

All `/dashboard`…`/settings` routes are protected — signed-out visitors are
sent back to the landing page with an `?authReturnTo=` param, and after
sign-in they are returned to the page they asked for.

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
```

## Tests

Vitest + React Testing Library (jsdom) cover the service layer, the `useApi`
hook and the auth flow:

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
- `src/pages/*.test.jsx` — page error/retry states

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs `npm run lint`, `npm test`
and `npm run build` on every push and pull request.
