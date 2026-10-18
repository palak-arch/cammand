import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

const sdk = vi.hoisted(() => ({ user: null, isLoading: false }));

vi.mock('@freebuff/auth/react', () => ({
  useFreebuffUser: () => ({ user: sdk.user, isLoading: sdk.isLoading, refresh: vi.fn() }),
  // Mirrors the real component: an <a href={signInUrl(returnTo)}>.
  SignInWithFreebuff: ({ returnTo, className, children }) => (
    <a href={`/auth/freebuff/signin?returnTo=${encodeURIComponent(returnTo)}`} className={className}>
      {children}
    </a>
  ),
  SignOutButton: () => null,
}));

import Landing from './Landing';
import { AuthProvider, ProtectedRoute } from '../context/AuthContext';
import { formatAuthReturnPath, AUTH_RETURN_PARAM } from '../utils/format';

// Same composition App renders for the "/" route.
function LandingRoute() {
  const location = useLocation();
  return <Landing authReturn={formatAuthReturnPath(location.search)} />;
}

function renderLanding(initialEntry) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingRoute />} />
          <Route
            path="/instances"
            element={
              <ProtectedRoute>
                <div>Instances page</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  sdk.user = null;
  sdk.isLoading = false;
  sessionStorage.clear();
});

describe('Landing sign-in round trip', () => {
  it('remembers the requested page when a signed-out visitor is bounced home', () => {
    renderLanding('/?authReturnTo=/instances');

    expect(sessionStorage.getItem(AUTH_RETURN_PARAM)).toBe('/instances');
    expect(screen.queryByText('Instances page')).not.toBeInTheDocument();
  });

  it('stores nothing on a plain landing visit', () => {
    renderLanding('/');

    expect(sessionStorage.getItem(AUTH_RETURN_PARAM)).toBeNull();
    expect(screen.getByText('Explore Features')).toBeInTheDocument();
  });

  it('links every sign-in control to the Worker sign-in route returning to "/"', () => {
    renderLanding('/?authReturnTo=/instances');

    const signInLinks = screen
      .getAllByRole('link')
      .filter((link) => link.getAttribute('href')?.startsWith('/auth/freebuff/signin'));

    expect(signInLinks.length).toBeGreaterThanOrEqual(3);
    for (const link of signInLinks) {
      expect(link.getAttribute('href')).toBe('/auth/freebuff/signin?returnTo=%2F');
    }
  });

  it('restores the remembered page after signing in and clears the key', async () => {
    sdk.user = { sub: 'usr-1', name: 'Jane Doe', email: 'jane@freebuff.com' };
    sessionStorage.setItem(AUTH_RETURN_PARAM, '/instances');

    renderLanding('/');

    expect(await screen.findByText('Instances page')).toBeInTheDocument();
    expect(sessionStorage.getItem(AUTH_RETURN_PARAM)).toBeNull();
  });

  it('does not bounce a signed-out visitor who returns without the param', () => {
    sdk.user = null;
    sessionStorage.setItem(AUTH_RETURN_PARAM, '/instances');

    renderLanding('/');

    expect(screen.queryByText('Instances page')).not.toBeInTheDocument();
    // The target is kept for the sign-in round trip instead of being consumed.
    expect(sessionStorage.getItem(AUTH_RETURN_PARAM)).toBe('/instances');
  });
});
