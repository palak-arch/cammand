/**
 * Local demo mode.
 *
 * `vite dev` serves the SPA with no Worker behind it, so /auth/freebuff/* has
 * no server: sign-in links fall through to the SPA fallback (and used to land
 * on the not-found page) and the session endpoint answers HTML, which locks
 * every protected route. In that one environment the app opens as a demo
 * session so the dashboard, instances and settings are reachable.
 *
 * The gate is the literal `import.meta.env` expression, not a helper call, so
 * Vite can replace it with a constant and fold every demo branch out of a
 * production build:
 *
 * - `vite build` always sets DEV=false, so a built bundle — `wrangler dev` or
 *   any deployment — can never enter demo mode; there, sign-in is the real
 *   Worker flow and the Worker alone decides access.
 * - Vitest also runs with DEV=true, so MODE keeps the session tests honest
 *   (asserted in demoMode.test.js).
 */
export const DEMO_MODE = import.meta.env.DEV === true && import.meta.env.MODE !== 'test';

/**
 * The identity the shell shows while running in demo mode.
 * The PURE annotation on the freeze call lets a build drop this literal once
 * every demo branch has folded away, instead of keeping the call for its
 * possible side effects.
 */
export const DEMO_USER = /*#__PURE__*/ Object.freeze({
  name: 'Local demo',
  email: 'demo@cloudops.local',
  avatarUrl: null,
  signedIn: true,
  demo: true,
});
