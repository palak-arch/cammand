import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// The dev-server configuration under test: plain `vite dev`, no Worker.
vi.mock('./utils/demoMode', () => ({
  DEMO_MODE: true,
  DEMO_USER: Object.freeze({
    name: 'Local demo',
    email: 'demo@cloudops.local',
    avatarUrl: null,
    signedIn: true,
    demo: true,
  }),
}));

// Dashboard pulls recharts into jsdom for no benefit here.
vi.mock('./pages/Dashboard', () => ({
  default: () => <div data-testid="dashboard-probe">Dashboard page</div>,
}));

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

describe('demo mode (vite dev, no Worker)', () => {
  it('Get Started opens the dashboard instead of the sign-in route', async () => {
    const user = userEvent.setup();
    renderAt('/');

    await user.click(screen.getByRole('link', { name: 'Get Started' }));

    expect(await screen.findByTestId('dashboard-probe')).toBeInTheDocument();
    expect(screen.queryByText('Page not found')).not.toBeInTheDocument();
  });

  it('every sign-in control points at the dashboard while the Worker is absent', () => {
    renderAt('/');

    const signInControls = screen
      .getAllByRole('link')
      .filter((link) => ['Get Started', 'Sign in with Freebuff', 'Start Free Trial', 'Sign In']
        .includes(link.textContent.trim()));

    expect(signInControls).toHaveLength(4);
    for (const link of signInControls) {
      expect(link).toHaveAttribute('href', '/dashboard');
    }
  });

  it('opens a protected route with no session at all', async () => {
    renderAt('/instances?region=us-east-1');

    expect(await screen.findByRole('heading', { name: 'EC2 Instances' })).toBeInTheDocument();
    expect(screen.queryByText(/Landing page|Explore Features/)).not.toBeInTheDocument();
  });

  it('lands a hand-typed sign-in URL on the dashboard, not the not-found page', async () => {
    renderAt('/auth/freebuff/signin?returnTo=%2F');

    expect(await screen.findByTestId('dashboard-probe')).toBeInTheDocument();
    expect(screen.queryByText('Page not found')).not.toBeInTheDocument();
  });

  it('shows the demo identity and offers Exit demo instead of posting sign-out', async () => {
    renderAt('/dashboard');

    // Sidebar and top navbar both show the identity.
    expect((await screen.findAllByText('Local demo')).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole('link', { name: /Exit demo/ })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('button', { name: /Sign Out/ })).not.toBeInTheDocument();
  });
});
