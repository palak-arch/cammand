import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Signed-out session, exactly like a built bundle served with no Worker
// (auth vars missing, or a stale sign-in link from an older deploy).
vi.mock('@freebuff/auth/react', () => ({
  useFreebuffUser: () => ({ user: null, isLoading: false, refresh: vi.fn() }),
  SignInWithFreebuff: ({ returnTo, children }) => (
    <a href={`/auth/freebuff/signin?returnTo=${encodeURIComponent(returnTo)}`}>{children}</a>
  ),
  SignOutButton: ({ children }) => <button type="button">{children}</button>,
}));

import App from './App';

function renderAt(path) {
  window.history.pushState({}, '', path);
  return render(<App />);
}

beforeEach(() => {
  sessionStorage.clear();
});

describe('auth routes served without a Worker', () => {
  it('sends a stale sign-in link to the landing page, not the not-found page', async () => {
    renderAt('/auth/freebuff/signin?returnTo=%2F');

    expect(await screen.findByText('Explore Features')).toBeInTheDocument();
    expect(screen.queryByText('Page not found')).not.toBeInTheDocument();
  });

  it('still shows the not-found page for genuinely unknown URLs', async () => {
    renderAt('/this-route-does-not-exist');

    expect(await screen.findByText('Page not found')).toBeInTheDocument();
  });

  it('bounces a signed-out visitor off a protected route with the target remembered', async () => {
    renderAt('/instances?region=us-east-1');

    expect(await screen.findByText('Explore Features')).toBeInTheDocument();
    expect(window.location.search).toContain('authReturnTo=%2Finstances');
  });
});
