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