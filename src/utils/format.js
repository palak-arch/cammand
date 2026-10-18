/** Captured once at module load so components never call `new Date()` during render. */
const NOW = Date.now();

export const CURRENT_YEAR = new Date(NOW).getFullYear();

/** "3h ago" / "12m ago" relative to app load time. */
export function timeAgo(timestamp) {
  const time = new Date(timestamp).getTime();
  if (Number.isNaN(time)) return '';
  const diff = Math.max(0, NOW - time);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  return `${minutes}m ago`;
}

/** Query param that carries the page a signed-out visitor asked for. */
export const AUTH_RETURN_PARAM = 'authReturnTo';

/**
 * Validates the page requested via ?authReturnTo= when bouncing home.
 * Only same-site absolute paths may round-trip — never `//host` or a
 * scheme — so a crafted link can't bounce visitors off-site after sign-in.
 * Returns null when there is nothing to restore.
 */
export function formatAuthReturnPath(search) {
  const raw = new URLSearchParams(search).get(AUTH_RETURN_PARAM);
  if (raw && raw.startsWith('/') && !raw.startsWith('//')) return raw;
  return null;
}

/** "?authReturnTo=..." for the landing bounce; empty at the landing page itself. */
export function authReturnQuery(location) {
  const path = `${location.pathname}${location.search}`;
  if (!path || path === '/') return '';
  return `?${AUTH_RETURN_PARAM}=${encodeURIComponent(path)}`;
}
