import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';

// useFreebuffUser is the single source of the session — drive it per test.
const session = vi.hoisted(() => ({ user: null, isLoading: false }));

vi.mock('@freebuff/auth/react', () => ({
  useFreebuffUser: () => ({
    user: session.user,
    isLoading: session.isLoading,
    refresh: vi.fn(),
  }),
  SignInWithFreebuff: () => null,
  SignOutButton: () => null,
}));

import { AuthProvider, useAuth, ProtectedRoute } from './AuthContext';

const FREEBUFF_USER = {
  sub: 'usr-1',
  name: 'Jane Doe',
  email: 'jane@freebuff.com',
  picture: 'https://cdn.example/jane.png',
};

const hookWrapper = ({ children }) => (
  <AuthProvider>
    <MemoryRouter>{children}</MemoryRouter>
  </AuthProvider>
);

beforeEach(() => {
  session.user = null;
  session.isLoading = false;
});

describe('AuthProvider session surface', () => {
  it('exposes the Freebuff profile as { name, email, avatarUrl, signedIn }', () => {
    session.user = FREEBUFF_USER;
    const { result } = renderHook(() => useAuth(), { wrapper: hookWrapper });

    expect(result.current.user).toEqual({
      name: 'Jane Doe',
      email: 'jane@freebuff.com',
      avatarUrl: 'https://cdn.example/jane.png',
      signedIn: true,
    });
  });

  it('maps a missing picture to avatarUrl: null and falls back for a missing name', () => {
    session.user = { sub: 'usr-2', email: 'ops@cloudops.io' };
    const { result } = renderHook(() => useAuth(), { wrapper: hookWrapper });

    expect(result.current.user).toMatchObject({
      name: 'CloudOps user',
      email: 'ops@cloudops.io',
      avatarUrl: null,
      signedIn: true,
    });
  });

  it('is null when signed out', () => {
    session.user = null;
    const { result } = renderHook(() => useAuth(), { wrapper: hookWrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('reports the in-flight session check as loading', () => {
    session.isLoading = true;
    const { result } = renderHook(() => useAuth(), { wrapper: hookWrapper });

    expect(result.current.loading).toBe(true);
  });
});

describe('ProtectedRoute', () => {
  function LandingProbe() {
    const location = useLocation();
    return <div>Landing page {location.search}</div>;
  }

  function renderProtected() {
    return render(
      <MemoryRouter initialEntries={['/instances?region=us-east-1']}>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingProbe />} />
            <Route
              path="/instances"
              element={
                <ProtectedRoute>
                  <div>Secret instances</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  }

  it('bounces signed-out visitors to the landing page, remembering the target', async () => {
    renderProtected();

    expect(await screen.findByText(/Landing page/)).toHaveTextContent(
      'authReturnTo=%2Finstances%3Fregion%3Dus-east-1'
    );
    expect(screen.queryByText('Secret instances')).not.toBeInTheDocument();
  });

  it('shows the session-check state instead of flashing the landing page', () => {
    session.isLoading = true;
    renderProtected();

    expect(screen.getByText('Checking your session...')).toBeInTheDocument();
    expect(screen.queryByText(/Landing page/)).not.toBeInTheDocument();
    expect(screen.queryByText('Secret instances')).not.toBeInTheDocument();
  });

  it('renders the protected content once the session resolves', async () => {
    session.user = FREEBUFF_USER;
    renderProtected();

    expect(await screen.findByText('Secret instances')).toBeInTheDocument();
    expect(screen.queryByText(/Landing page/)).not.toBeInTheDocument();
  });
});
