# CloudOps Command Center

A modern, responsive cloud infrastructure management dashboard built with React. Includes a marketing landing page, authentication pages, and a full command center with mock data.

## Tech Stack

- React 19
- Vite
- Tailwind CSS v4
- React Router DOM
- Lucide React (icons)
- Recharts (charts)
- Axios (API)

## Getting Started

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173`.

## Authentication

All `/dashboard`…`/settings` routes are protected — signed-out visitors are redirected to `/login` and returned to the page they asked for after signing in.

Deployed previews use **Sign in with Freebuff**: the Worker owns a real
httpOnly session cookie (OIDC + PKCE, verified server-side), and the login
page offers a single "Sign in with Freebuff" button — there is no app
password. This mode is enabled at build time with `VITE_AUTH_PLATFORM=true`
and the platform-injected `FREEBUFF_CLIENT_ID` / `FREEBUFF_ISSUER` /
`APP_ORIGIN` variables; `npm run build:worker` bundles the Worker with
`@freebuff/auth` inlined.

Local development keeps the demo flow: any valid email with a password of
8+ characters signs in and the session is stored in `localStorage` under
`cloudops.session`. Signing out from the sidebar clears it.

## Routes

| Route          | Description                     |
| -------------- | ------------------------------- |
| `/`            | Landing page                    |
| `/login`       | Sign in                         |
| `/signup`      | Create account                  |
| `/dashboard`   | Overview dashboard              |
| `/instances`   | EC2 instance management         |
| `/monitoring`  | Live metrics and health         |
| `/alerts`      | Alert configuration and history |
| `/activity`    | Activity and audit logs         |
| `/users`       | User management                 |
| `/settings`    | Preferences and thresholds      |
| `/404`         | Not-found page (also catches unknown URLs) |

## Backend Integration

To connect to a FastAPI backend:

1. Copy `.env.example` to `.env.local`
2. Set `VITE_API_BASE_URL` to your API URL
3. Set `VITE_USE_MOCK=false` — every service in `src/services/` then calls the real API instead of the bundled mock data (auth included: `POST /auth/login`, `POST /auth/register`)
4. Expected endpoints are documented in each file under `src/services/`

Mock mode is the default (`VITE_USE_MOCK=true` or unset).

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

- `src/services/*.test.js` — session storage, axios interceptors (token
  injection, response unwrapping, error normalization), entity services in
  mock mode, and auth validation
- `src/hooks/useApi.test.jsx` — loading, error, retry, dependency changes, `setData`
- `src/context/AuthContext.test.jsx` — login/logout/persisted session and
  `ProtectedRoute` redirects
- `src/pages/Auth.test.jsx` — the login/signup page end to end (submit,
  navigation, inline errors)

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs `npm run lint`, `npm test`
and `npm run build` on every push and pull request.
