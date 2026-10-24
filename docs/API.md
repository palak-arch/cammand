# CloudOps Command Center — API Contract

_Last reviewed 2026-10-20._

## 1. Status

- **Auth endpoints exist and are served by the Worker** (`@freebuff/auth`).
- **Every data endpoint below is a client-side contract, not a running
  service.** `src/services/*` calls these paths only when
  `VITE_USE_MOCK=false`; the default build returns mock data and never
  performs a network request.
- A backend implementing this contract can be attached without UI changes.
  Field-level details are in [database.md](./database.md).

## 2. Conventions

| Aspect | Contract |
| --- | --- |
| Base URL | `VITE_API_BASE_URL`, default `http://localhost:8000/api` |
| Transport | HTTPS; JSON request/response bodies |
| Auth | The httpOnly `__Host-freebuff_session` cookie owned by the Worker. **No `Authorization` header** is sent and no token is available to JS. |
| Timeout | 10 s (`axios` `timeout: 10000`) |
| Response body | Return the **resource directly** — the axios interceptor unwraps `response.data`, so do not nest under `{ data: … }` |
| Dates | ISO-8601 UTC strings (`2025-07-29T14:32:00Z`) |
| Errors | `{ "detail": "…" }` (preferred) or `{ "message": "…" }`; the client turns it into `Error(message)` with `.status` |
| Status codes | `200` read/update, `201` create (optional), `204` no content (optional), `400` validation, `401` not signed in, `403` forbidden/CSRF, `404` missing, `409` conflict, `429` rate limit, `5xx` upstream |
| Caching | Per-user data: `Cache-Control: private, no-store` |
| CORS | Not needed if the API is same-origin behind the Worker. If it is not, credentials + an explicit allowlist are required **and** the CSP `connect-src` must include the API origin. |

### Error normalisation (client behaviour)

| Situation | Message surfaced |
| --- | --- |
| `4xx`/`5xx` with `detail`/`message` | that string |
| `4xx`/`5xx` without either | `Request failed with status <code>.` |
| Timeout (`ECONNABORTED`) | `The request timed out. Please try again.` |
| Network/CORS failure with `error.message` | `Could not reach the server: <message>` |
| Unknown | `Network error. Please check your connection and try again.` |

## 3. Authentication endpoints (implemented, Worker-owned)

These paths are intercepted by `auth.wrap()` in `worker.js` before assets.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/auth/freebuff/signin?returnTo=<local path>` | Starts OIDC + PKCE; redirects to Freebuff. `returnTo` must be a local path. |
| `GET` | `/auth/freebuff/callback` | OIDC callback: validates `state`/`nonce`, exchanges the code, sets the session cookie, redirects. |
| `POST` | `/auth/freebuff/signout` | Revokes the session, clears the cookie, redirects to `returnTo`/`/`. Same-origin only. |
| `GET` | `/auth/freebuff/session` | `{ "user": { "sub": "…", "name": "…", "email": "…", "picture": "…" } }` or `{ "user": null }` |

Notes:

- The cookie is `__Host-` prefixed (`HttpOnly`, `Secure`, `SameSite=Lax`,
  path `/`) and refreshed server-side.
- Profile fields are optional; the SPA falls back to "CloudOps user", empty
  email and initials.
- Treat `email_verified` as false when absent. Do **not** build authorisation
  on email.
- State-changing routes must be POST/PUT/PATCH/DELETE and pass
  `isSameOriginRequest()` server-side.

## 4. Data endpoints the client calls

All paths are relative to `VITE_API_BASE_URL`.

### 4.1 Instances (`instanceService`)

#### `GET /ec2/instances`

Returns `Instance[]` (see [database.md §2.1](./database.md#21-instance)).
Used by Instances, Monitoring (selector) and the Instances refresh button.

```json
[
  {
    "id": "i-0a1b2c3d4e5f6g7h8",
    "name": "Production Web Server",
    "type": "t3.large",
    "region": "us-east-1",
    "az": "us-east-1a",
    "privateIp": "10.0.1.15",
    "publicIp": "52.23.45.67",
    "state": "running",
    "cpu": 42,
    "networkIn": 1.2,
    "networkOut": 3.4,
    "diskUsage": 45,
    "memoryUsage": 62,
    "launchTime": "2025-01-15T08:30:00Z"
  }
]
```

#### `GET /ec2/instances/{id}`

Returns a single `Instance`. Currently called only by
`instanceService.getById` (no page uses it — the details modal reads the
already-loaded row). Keep it for deep links and future refactors; `404` if
unknown.

#### `POST /ec2/instances/{id}/start`

#### `POST /ec2/instances/{id}/stop`

#### `POST /ec2/instances/{id}/restart`

No request body. Return an acknowledgement; the client does not read fields
from it, it updates the row locally and shows a toast.

```json
{ "success": true, "message": "Instance started" }
```

Expected effects server-side: update `state` (and zero metrics on stop),
append an activity record, and make the next `GET` reflect the change.
Idempotency is desirable: starting a running instance can return `200` with
`{ "success": true }` rather than `409`.

### 4.2 Monitoring (`monitoringService`)

#### `GET /monitoring/metrics?instanceId=<id|all>&timeRange=<1h|6h|24h|7d>`

```json
{
  "cpu":        [{ "time": "00:00", "value": 23 }],
  "networkIn":  [{ "time": "00:00", "value": 0.8 }],
  "networkOut": [{ "time": "00:00", "value": 1.2 }],
  "disk":       [{ "time": "00:00", "value": 45 }],
  "memory":     [{ "time": "00:00", "value": 55 }]
}
```

`instanceId=all` means fleet aggregate. `time` is currently a display label;
a real API should return a `timestamp` and the client formatter should be
updated with it. Points are hourly by default; finer resolution for `1h` is
acceptable as long as the chart still renders.

#### `GET /monitoring/dashboard`

```json
{
  "dashboardSummary": {
    "totalInstances": 12,
    "runningInstances": 8,
    "stoppedInstances": 3,
    "activeAlerts": 2,
    "overallHealth": "Healthy"
  },
  "cpu": [{ "time": "00:00", "value": 23 }],
  "resourceStatus": [
    { "name": "Running", "value": 8, "color": "#22c55e" },
    { "name": "Stopped", "value": 3, "color": "#f59e0b" },
    { "name": "Pending", "value": 1, "color": "#3b82f6" }
  ],
  "systemHealth": {
    "status": "healthy",
    "message": "All systems operational",
    "lastUpdated": "Just now",
    "uptime": "99.97%"
  }
}
```

`color` is presentation data in the current mock. Prefer returning a
status key (`running`/`stopped`/`pending`) and letting the client map
colours; until then, keep the hex values to avoid UI changes.

### 4.3 Alerts (`alertService`)

#### `GET /alerts`

Returns `Alert[]`; the client filters by severity/status and search locally.
The Dashboard also consumes the full list and computes open-alert counts, so
a paginated response would break it — return the full set or add a separate
summary endpoint first.

#### `PATCH /alerts/{id}/acknowledge`

#### `PATCH /alerts/{id}/resolve`

No body. Response:

```json
{ "success": true, "message": "Alert acknowledged" }
```

Server-side effects: set `status` (`acknowledged`/`resolved`), stamp
`acknowledgedBy`/`acknowledgedAt` or `resolvedBy`/`resolvedAt`, append an
`alert_events` row and an activity record, return `404` for unknown ids,
`409` when resolving an already-resolved alert (or make it idempotent — but
choose one and document it).

### 4.4 Users (`userService`)

#### `GET /users`

Returns `User[]`. No pagination today; the page filters locally.

#### `POST /users`

Request (client sends exactly this shape plus server-owned defaults):

```json
{ "name": "Jane Doe", "email": "jane@example.com", "role": "Operator", "status": "active" }
```

Response: the created `User`, including `id`, `createdAt` and `lastLogin`
(`"-"` in the mock when never signed in). Return `409` for a duplicate
email, `400` for an invalid role/email.

> A user record is not an auth identity. Linking a Freebuff `sub` to a
> record is a server-side operation and must not be done by matching an
> email supplied by the client.

#### `PATCH /users/{id}`

Partial update — any of `name`, `email`, `role`, `status`.

```json
{ "status": "inactive" }
```

Response: `{ "success": true, "status": "inactive" }` in mock mode; a real
API may return the full updated user (the client merges what it sent, so
either works).

### 4.5 Activities (`activityService`)

#### `GET /activities`

Returns `Activity[]`, newest first, **unpaginated** today (20 rows in
mocks; the page paginates 10 at a time client-side). For a real backend add
`?page=&limit=` and return `{ items, total }` — this requires a small
service/UI change, so do it deliberately.

## 5. Mock-mode behaviour (default build)

No network calls are made. Methods return mock data or synthetic
acknowledgements:

| Method | Mock return |
| --- | --- |
| `instanceService.getAll` | copy of `mockInstances` |
| `instanceService.getById` | matching row or `undefined` |
| `instanceService.start/stop/restart` | `{ success: true, message: 'Instance <action>' }` |
| `monitoringService.getMetrics` | all five series from `mockMetrics` |
| `monitoringService.getDashboard` | `{ dashboardSummary, cpu, resourceStatus, systemHealth }` |
| `alertService.getAll` | copy of `mockAlerts` |
| `alertService.acknowledge/resolve` | `{ success: true, message: 'Alert …' }` |
| `userService.getAll` | copy of `mockUsers` |
| `userService.create` | echoes input + `id: 'usr-<timestamp>'`, `createdAt: now` |
| `userService.update` | `{ success: true, ...patch }` |
| `activityService.getAll` | copy of `mockActivities` |

The UI then applies the change locally (`setData`), so mock mode is
coherent for a session but resets on reload.

## 6. Endpoints needed but not yet called

These are implied by the UI copy or the planned data model, and must be
designed before they are "discovered" during implementation:

| Need | Suggested endpoint | Notes |
| --- | --- | --- |
| Persisted preferences | `GET/PUT /users/me/settings` | Replace `localStorage` (`cloudops.settings`); validate keys server-side |
| Session-to-directory link | server-side on first sign-in | Key on `sub`, never on email |
| Instance list pagination | `GET /ec2/instances?page=&limit=&region=&state=` | Return `{ items, total }` when lists grow |
| Activity pagination | `GET /activities?page=&limit=&user=&action=` | Currently client-side |
| Alert summary | `GET /alerts/summary` | Avoids loading all alerts for Dashboard KPIs |
| Notification channels | `POST /notifications/test` etc. | Settings toggles are cosmetic today |

## 7. Versioning & compatibility

- Paths are unversioned while the backend does not exist. If the API ships
  externally, prefix `/v1`.
- The client is the contract: changing a field name requires a matching
  change in `src/services/*` and the mock fixtures, plus tests.
- When wiring a backend:
  1. Implement every endpoint in §4 with the documented shapes.
  2. Set `VITE_API_BASE_URL` and `VITE_USE_MOCK=false`.
  3. Update CSP `connect-src` if the API is cross-origin.
  4. Add service-layer tests that run against the real shapes.
  5. Verify signed-out requests get `401`, not mock data.
