import { useState } from 'react';

/**
 * The signed-in user's Freebuff profile picture. Falls back to initials —
 * and the fallback also takes over if the avatar URL dies (onError), so the
 * circle is never a broken image.
 */
export default function UserAvatar({ user, className = 'h-11 w-11 text-sm' }) {
  const [failed, setFailed] = useState(false);

  const name = user?.name || user?.email || 'Unknown User';
  const initials = name
    .split(' ')
    .map((word) => word[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  if (user?.avatarUrl && !failed) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        onError={() => setFailed(true)}
        className={`${className} shrink-0 rounded-full bg-navy-100 object-cover shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-800 to-navy-600 font-bold text-white shadow-sm`}
    >
      {initials}
    </div>
  );
}
