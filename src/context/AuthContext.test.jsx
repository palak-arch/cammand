import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth, ProtectedRoute } from './AuthContext';
import { saveSession, clearSession } from '../services/session';

const hookWrapper = ({ children }) => (
  <AuthProvider>
    <MemoryRouter>{children}</MemoryRouter>
  </AuthProvider>
);

async function caught(promise) {
  try {
    await promise;
    throw new Error('expected rejection');
  } catch (error) {
    return error;
  }
}

describe('AuthProvider', () => {
  beforeEach(() => {
    clearSession();
  });

  it('starts unauthenticated', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: hookWrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('login stores the session and exposes the user', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: hookWrapper });

    await act(async () => {
      await result.current.login({ email: 'jane.doe@example.com', password: 'password1' });
    });

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toMatchObject({ name: 'Jane Doe', email: 'jane.doe@example.com', role: 'Admin' });
  });

  it('a failed login keeps the user signed out and rejects', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: hookWrapper });

    const error = await act(async () => caught(result.current.login({ email: 'a@b.c', password: 'short' })));

    expect(error.message).toMatch(/at least 8 characters/i);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('signup authenticates with the provided name', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: hookWrapper });

    await act(async () => {
      await result.current.signup({ name: 'Sam Ops', email: 'sam@cloudops.io', password: 'password1' });
    });

    expect(result.current.user).toMatchObject({ name: 'Sam Ops' });
  });

  it('logout clears the session', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper: hookWrapper });

    await act(async () => {
      await result.current.login({ email: 'a@b.c', password: 'password1' });
    });
    act(() => result.current.logout());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('restores a persisted session on mount', () => {
    saveSession({ token: 'tok', user: { name: 'Admin User', email: 'admin@cloudops.io', role: 'Admin' } });
    const { result } = renderHook(() => useAuth(), { wrapper: hookWrapper });
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user.name).toBe('Admin User');
  });
});

describe('ProtectedRoute', () => {
  beforeEach(() => {
    clearSession();
  });

  function renderProtected() {
    return render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login page</div>} />
            <Route path="/dashboard" element={<ProtectedRoute><div>Secret dashboard</div></ProtectedRoute>} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  }

  it('redirects signed-out visitors to /login', async () => {
    renderProtected();
    expect(await screen.findByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText('Secret dashboard')).not.toBeInTheDocument();
  });

  it('renders the protected content for an authenticated session', () => {
    saveSession({ token: 'tok', user: { name: 'Admin User', email: 'admin@cloudops.io', role: 'Admin' } });
    renderProtected();
    expect(screen.getByText('Secret dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });
});
