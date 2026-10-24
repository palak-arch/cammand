# CloudOps Command Center — Design System

_Last reviewed 2026-10-20. Source of truth: `src/index.css` (tokens) and
`src/components/` (components)._

## 1. Principles

1. **Operational calm.** Neutral navy surfaces, colour reserved for state
   (success / warning / danger). A page full of red should mean something.
2. **One obvious next action.** Every error has Retry; every destructive
   instance action has a confirmation.
3. **Dense but readable.** Tables carry the detail; cards summarise.
4. **Never a dead end.** Loading, empty, error and success are explicit.
5. **Motion is decoration, never information.** All float/ping/spin
   animations stop under `prefers-reduced-motion`.

## 2. Colour

Tailwind v4 theme tokens defined in `src/index.css` under `@theme`. Use the
token class (`bg-navy-900`), never raw hex, in components.

### Neutral (navy) scale

| Token | Hex | Typical use |
| --- | --- | --- |
| `navy-900` | `#111827` | Primary text, primary button, active nav |
| `navy-800` | `#1f2937` | Button hover |
| `navy-700` | `#374151` | Secondary headings, icons |
| `navy-600` | `#4b5563` | Body text on white |
| `navy-500` | `#6b7280` | Secondary/muted text, chart axes |
| `navy-400` | `#9ca3af` | Placeholders, decorative text |
| `navy-300` | `#d1d5db` | Disabled/hint text |
| `navy-200` | `#e5e7eb` | Borders, dividers |
| `navy-100` | `#f3f4f6` | Subtle fills, icon chips |
| `navy-50` | `#f9fafb` | Section background, hover rows |

### Semantic

| Token | Hex | Meaning |
| --- | --- | --- |
| `success` | `#16a34a` | Running, healthy, resolved, success toast |
| `warning` | `#d97706` | Warning severity, stopped, pending attention |
| `danger` | `#dc2626` | Critical, failed, destructive actions |
| `accent` | `#111827` | Same as navy-900; kept for semantic clarity |
| `accent-light` / `accent-dark` | `#1f2937` / `#000000` | Hover/pressed accent |

Status badges use Tailwind's tinted pairs rather than a new token set:
`bg-green-50 text-green-700`, `bg-amber-50 text-amber-700`,
`bg-red-50 text-red-700`, `bg-blue-50 text-blue-700`,
`bg-navy-100 text-navy-600`.

### Chart palette

`#111827` (primary series), `#6b7280` (gradient start), grid `#e5e7eb`,
axis text `#9ca3af`; resource split uses `#22c55e` running, `#f59e0b`
stopped, `#3b82f6` pending.

### Page background

`body` is `#f3f4f6` (navy-100) with navy-900 text; content cards are white
on top of it. The landing page is white.

## 3. Typography

- Family: **Inter** via Google Fonts (`index.html`), fallbacks
  `-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif`.
- Base body text renders at Tailwind's default 16px; UI copy is usually
  `text-sm` (14px), metadata `text-xs` (12px).
- Page titles: `text-2xl`-ish bold via `PageHeader` (`<h1>`).
- Section titles: `text-base`/`text-sm` semibold, navy-900.
- Numbers in KPI cards: `text-2xl`–`text-3xl` bold.
- Uppercase micro-labels use `text-xs font-semibold uppercase tracking-wider`
  (table headers, sidebar section labels).

## 4. Layout & spacing

- Shell (`AppLayout`): `flex` row; `Sidebar` is `hidden lg:flex lg:w-72`;
  content column is `flex-1` with `TopNavbar` sticky at the top.
- Content padding: `p-6 lg:p-8` (see `AppLayout`), page sections use
  `space-y-6`/`space-y-8`.
- Grid rhythm: KPI cards `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3
  xl:grid-cols-5 gap-5`; charts `grid-cols-1 lg:grid-cols-3 gap-5`.
- Radius: cards `rounded-xl`, buttons/inputs `rounded-lg`, avatars/modals
  `rounded-2xl`, pills `rounded-full`.
- Elevation: `shadow-sm` at rest, `shadow-md` on hover/active nav,
  `shadow-lg` for primary CTAs and the sidebar logo.
- Borders: `border border-navy-200`; dividers `divide-navy-100`.

### Breakpoints

Tailwind defaults; the meaningful one is `lg` (1024px):

| Width | Navigation | Notes |
| --- | --- | --- |
| `< 640px` (`sm`) | Slide-over `MobileSidebar` | Tables scroll horizontally; KPI cards stack |
| `640–1023px` | Slide-over | 2-column KPI grid, top-nav search visible |
| `≥ 1024px` (`lg`) | Fixed 288px sidebar | Full dashboard layout |

## 5. Component inventory

All components live in `src/components/`, grouped by domain.

### Common (`components/common/`)

| Component | Responsibility | Notes |
| --- | --- | --- |
| `PageHeader` | Page `<h1>`, subtitle, right-aligned actions | Exactly one per page |
| `MetricCard` | KPI value, label, subtext, trend arrow, colour | 5-up on xl |
| `ChartCard` | White card wrapper with title/subtitle/header slot | Used by all charts |
| `StatusBadge` | Maps status/severity/result strings to tinted pill | Single source of status colour |
| `HealthIndicator` | Dot + label + last-updated line | Used on Dashboard/Monitoring |
| `LoadingSpinner` | Centred spinner + text | Every async view |
| `ErrorState` | Error message + **Try again** button | Wired to `useApi().retry` |
| `EmptyState` | Title + description for zero results | After filtering |
| `ConfirmationModal` | Destructive-action confirm dialog | Esc/overlay close, labelled |
| `Pagination` | Prev/next + page indicator | Activity logs |
| `SearchInput` | Labelled search field with icon | Debounce-free, instant |
| `UserAvatar` | Image or initials fallback | From Freebuff `picture`/name |
| `Field` | `Field`, `Toggle`, `inputClass`, `selectClass` | Form atoms; `Toggle` is a switch with label + description |

### Domain

| Component | Responsibility |
| --- | --- |
| `instances/InstanceDetailsModal` | Instance metadata + capacity/networking; action buttons |
| `alerts/AlertDetailsModal` | Message, resource, timeline, acknowledge/resolve |
| `layout/Sidebar` | Desktop nav (4 sections), signed-in card, Sign Out (POST) |
| `layout/MobileSidebar` | Slide-over version of the sidebar |
| `layout/TopNavbar` | Breadcrumb-ish page label, search, notifications, avatar |
| `layout/AppLayout` | Shell composition + `<Outlet />` |

### Contexts & hooks

| Module | Purpose |
| --- | --- |
| `context/AuthContext` | Session surface (name, email, avatar), `ProtectedRoute` |
| `context/ToastContext` | `success`/`error` toasts, provider at app root |
| `hooks/useApi` | `{data, loading, error, retry, setData}`, unmount-safe |
| `hooks/useEscapeKey` | Closes overlays on Escape |

## 6. Interaction patterns

- **Confirmation before impact.** Instance start/stop/restart open
  `ConfirmationModal`; the row only changes after the service resolves.
- **Optimistic-free updates.** Mutations await the service, then update
  local state via `setData`; errors show a toast and leave state unchanged.
- **Toast semantics.** Success confirms a completed action; error explains
  the failure. Toasts are supplementary — never the only signal.
- **Filters reset pagination** in the change handler (no effect), so page 3
  of a now-shorter list can't render blank.
- **Modal behaviour.** Overlay click and Escape close; close buttons carry
  `aria-label`; titles are `<h3>`; dialogs use `role="dialog"`
  `aria-modal="true"`.
- **Table rows** highlight on hover (`hover:bg-navy-50`); icon-only actions
  always have `aria-label`/`title` including the row identity, e.g.
  `Restart API Server`.
- **Charts** share `ResponsiveContainer`, muted grid lines, no dots on
  series, and a custom tooltip.

## 7. Accessibility standards

- **One `<h1>` per page** (owned by `PageHeader`). The top-nav page label
  and the sidebar/mobile-sidebar product name are `<p>` elements on
  purpose; `AppLayout.a11y.test.jsx` fails if the shell adds another `<h1>`.
  The landing page and NotFound own their `<h1>` because they render no
  `PageHeader`.
- All form controls have a `<label>` (visible or `sr-only`); selects use
  `aria-label` when no visible label fits.
- Icon-only buttons: `aria-label` describing the action **and** target.
- Toggle/segment controls expose state (`aria-pressed`, or a switch role).
- Live notices use `role="status"` (e.g. the Settings sign-in notice).
- Decorative icons are `aria-hidden="true"`.
- Focus is always visible: `focus:border-navy-400 focus:ring-1
  focus:ring-navy-400`; do not remove outlines without a replacement.
- Colour is never the only signal — badges include text, alerts include a
  severity label.
- `prefers-reduced-motion` disables float/ping/spin and collapses
  transitions to 0.01ms.

## 8. Content & copy

- Sentence case for headings and buttons ("Save settings" is acceptable;
  current UI uses "Save Settings" — stay consistent within a view).
- Numbers carry units (`42%`, `1.2 MB/s`, `3d ago`).
- Empty states say what to do next ("Try adjusting your search or filters.").
- Errors say what failed and what to do ("Could not reach the server: …").
- Never claim a feature is live when it is mock-backed. Marketing copy on
  the landing page describes the product vision; docs and UI must be honest
  that AWS integration is not wired.

## 9. Extending the UI

When adding a page or component:

1. Compose from `PageHeader`, `ChartCard`/card surface, `StatusBadge`,
   `EmptyState`, `ErrorState`, `LoadingSpinner`.
2. Fetch with `useApi`; handle all four states.
3. Use tokens, not hex. Use `text-sm` for body/controls, `text-xs` for
   metadata.
4. Add `aria-label` to every icon-only control and label every input.
5. Verify at 375px, 768px and 1440px widths; tables must scroll, not
   overflow the viewport.
6. Run `npm run lint && npm test && npm run build`.

## 10. Not implemented yet

- **Dark mode.** Planned via Tailwind v4 `@custom-variant dark`; tokens are
  already centralised, but no dark palette exists and no toggle is shipped.
- **Design tokens as CSS variables for runtime theming** (only theme tokens
  exist today).
- **Storybook / visual regression.** Components are exercised through page
  tests only.
