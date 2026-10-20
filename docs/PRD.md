# CloudOps Command Center — Product Requirements

_Status: living document. Last reviewed 2026-10-20._

## 1. Problem

A small platform/SRE team runs servers across several AWS regions. Their
signals live in separate places: the EC2 console for instance state,
CloudWatch for metrics, PagerDuty/email for alerts, and spreadsheets or
ticket history for "who did what". Answering "is anything on fire right
now?" means opening three tabs and correlating by hand.

CloudOps Command Center is one authenticated dashboard that answers three
questions in a single screen:

1. **What do I run?** — every instance, its type, region and state.
2. **Is it healthy?** — CPU, memory, disk and network trends plus alerts.
3. **Who changed what?** — an audit trail of operator and system actions.

## 2. Target users

| Persona | Role | Primary need | Success looks like |
| --- | --- | --- | --- |
| **Priya — on-call SRE** | Operator | Triage at 3 a.m. on a phone | "I saw the critical alert, acknowledged it, and opened the instance in under a minute." |
| **Dan — platform lead** | Admin | Fleet health and accountability | "I can prove who restarted the production box, and I can tune thresholds without a ticket." |
| **Mei — engineering manager** | Viewer | Read-only status during standup | "I can see uptime and open alerts without asking anyone." |
| **CloudOps maintainer** | Developer | Ship safely | "Lint, tests and build gate every change; deploys are one command." |

## 3. Goals

- One screen answers fleet state, health and recent changes.
- Instance lifecycle actions (start/stop/restart) are **confirmed**, not
  accidental, and produce visible feedback.
- Alert triage (acknowledge → resolve) is a two-click flow.
- Every data view has explicit loading, empty and error/retry states — a
  failed request never leaves a hung spinner.
- Access is delegated to **Sign in with Freebuff** — the app stores no
  passwords and no tokens in the browser.
- Each route is deep-linkable, including after a sign-in round trip.

## 4. Non-goals (current scope)

- No real AWS credential handling or cross-account role assumption.
- No agent/collector installation, no CloudWatch API integration yet.
- No billing, cost optimisation or forecasting.
- No multi-tenant organisations or per-team resource scoping.
- No mobile app; responsive web only.
- No server-side RBAC enforcement yet (roles are display + mock mutation only).

## 5. Implemented capabilities

Everything below is implemented in the SPA. Data is **mock-backed by
default** (`VITE_USE_MOCK` unset/`true`); every read and write goes through
`src/services/` so a real API can replace the mocks without UI changes.

### 5.1 Landing page (`/`)

- Marketing page: hero, four feature cards, three onboarding steps, stats,
  CTA band, footer.
- Every sign-in control is `<SignInWithFreebuff>`; no app-local login form.
- Remembers the page a signed-out visitor asked for and restores it after
  sign-in (`authReturnTo`, validated to same-site absolute paths).
- Decorative floating icons respect `prefers-reduced-motion`.

### 5.2 Dashboard (`/dashboard`)

- Five KPI cards: Total Instances, Running, Stopped, Active Alerts, Health
  (with uptime).
- CPU utilisation area chart with 24 hourly points and a trend delta.
- Infrastructure Health panel, Resource Status breakdown (running/stopped/
  pending) and a 3-up CPU/Disk/Network readout.
- **Recent Alerts** (active, max 3), linking into alert detail.
- **Recent Activity** (latest 6), with action-coloured badges.
- "Systems Operational" live badge (decorative ping, motion-safe).

### 5.3 EC2 Instances (`/instances`)

- Table of instances: name, type, region/AZ, IPs, state, CPU, network,
  disk, memory, launch time.
- Search by name/ID; filters for state, instance type and region.
- Row **Start / Stop / Restart** actions are gated by a confirmation modal;
  on success the row updates locally (state + CPU) and a toast confirms.
  Failures surface an error toast.
- Details modal with capacity and networking fields; Refresh re-runs the
  fetch; error state offers Retry.

### 5.4 Monitoring (`/monitoring`)

- Instance selector (all or one) and time range: 1h / 6h / 24h / 7d.
- Four charts: CPU, Network In, Network Out, Disk & Memory.
- **Resource Health** list derives `healthy` / `warning` / `critical` from
  CPU, disk and instance state (thresholds 60/75 and 80/90).

### 5.5 Alerts (`/alerts`)

- Severity and status filters plus free-text search.
- Counts by severity, and per-alert row actions.
- **Acknowledge** and **Resolve** update the row and toast on success.
- Details modal shows message, resource, timestamps, acknowledgement state
  and the event timeline.

### 5.6 Activity Logs (`/activity`)

- Search across user, action and resource; filter by user and action.
- Paginated table (10 per page) of timestamp, user, action, resource,
  result badge and IP.
- Filter changes reset to page 1 without an effect loop.

### 5.7 User Management (`/users`)

- Table of users with role, status, last login and creation date.
- Add user and edit user modals (name, email, role) with validation.
- Activate/deactivate toggle; search and role filter.

### 5.8 Settings (`/settings`)

- Signed-in identity notice (dismissible) and read-only profile from the
  Freebuff profile.
- Notification toggles (email/Slack/SMS/weekly digest), alert thresholds
  (CPU/memory/disk), refresh interval, default region, 2FA/session-timeout
  toggles.
- Persisted to `localStorage` under `cloudops.settings`; when storage is
  unavailable the change applies for the session with an explanatory toast.
- **These preferences are UI-only today** — they are not sent to a backend.

### 5.9 Cross-cutting

- Protected routes: signed-out visitors bounce to `/` with
  `?authReturnTo=<path>`; loading shows "Checking your session..." instead
  of flashing the landing page.
- Sign out is a same-site POST handled by the Worker.
- Unknown URLs redirect to `/404`; stale `/auth/freebuff/*` links (a bundle
  served with no Worker) redirect to `/` instead.
- Local development (`npm run dev`, no Worker) runs in **demo mode**: the
  sign-in controls open the dashboard as a `Local demo` identity and the
  sidebar offers *Exit demo* instead of sign-out. The mode is compiled out
  of every build, so a deployed site always requires a real Worker session.
- Responsive shell: fixed sidebar ≥ `lg`, slide-over mobile sidebar below.

## 6. Authentication requirements

- **Sign in with Freebuff only** (OIDC + PKCE). No app password, signup form
  or demo login.
- The Worker owns `/auth/freebuff/{signin,callback,signout,session}` and the
  httpOnly session cookie; the SPA reads only the session endpoint.
- No token in `localStorage`/`sessionStorage`/JS-accessible cookies. The one
  stored key is `authReturnTo` (a path string).
- Server-side enforcement is required for anything private: the SPA hides
  UI, the Worker/API must deny requests. (The mock build has no private API.)

## 7. Success metrics (targets, not yet instrumented)

| Metric | Target | How it would be measured |
| --- | --- | --- |
| Time to triage a critical alert | < 60 s | Instrument alert-open → acknowledge (needs analytics) |
| Dashboard LCP (mobile) | < 2.5 s | Lighthouse mobile preset |
| JS shipped on landing | < 120 kB gzip | Build output (currently ~80 kB gzip for the entry chunk) |
| Failed-request recovery | 100% of views expose Retry | Vitest page error tests |
| Auth incidents (token leakage) | 0 | Design: tokens never reach JS |
| CI pass rate on `main` | > 95% | GitHub Actions history |

## 8. Assumptions & risks

- **Mock data looks real.** Screenshots can be mistaken for live AWS data;
  the README and UI copy must keep saying "mock". Risk: stakeholder
  confusion, demoing stale numbers.
- **Auth is delegated.** Freebuff availability and correct callback/origin
  registration gate sign-in; a misconfigured `APP_ORIGIN` breaks the round
  trip.
- **Settings are local.** Clearing browser data resets them; they do not
  follow the user across devices.
- **No server-side roles yet.** Any signed-in user can reach every page;
  RBAC in the UI is cosmetic until the API enforces it.

## 9. Open questions

1. Should the first real backend be Workers + D1 (same-origin, reuses the
   session cookie) or an external FastAPI service?
2. Are alert notifications (email/Slack) in scope for v1, or does triage
   stay in-app?
3. Do Viewer users need a genuinely read-only UI, or is RBAC server-only?
4. Which region/account is the "default" for a new user — `us-east-1` today
   is a hard-coded fallback, not a stored preference.
5. Is a custom domain required before Search Console submission?

## 10. Related documents

- [Design system](./design.md)
- [Architecture](./architecture.md)
- [Data model](./database.md)
- [API contract](./API.md)
- [Agent guide](./agents.md)
- [Implementation plan](./implementation-plan.md)
