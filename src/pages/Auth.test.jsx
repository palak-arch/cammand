import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Auth from './Auth';
import { AuthProvider } from '../context/AuthContext';
import { authService } from '../services/authService';
import { clearSession, getSession } from '../services/session';

function renderAuth(initialPath = '/login') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/signup" element={<Auth mode="signup" />} />
          <Route path="/dashboard" element={<div>Dashboard page</div>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Auth page', () => {
  beforeEach(() => {
    clearSession();
    vi.restoreAllMocks();
  });

  it('signs in with valid credentials and navigates to the dashboard', async () => {
    const user = userEvent.setup();
    renderAuth();

    await user.type(screen.getByLabelText(/email address/i), 'jane.doe@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText('Dashboard page')).toBeInTheDocument();
    expect(getSession()).toMatchObject({ user: { name: 'Jane Doe', email: 'jane.doe@example.com' } });
  });

  it('shows an inline error and stays on the login page when auth fails', async () => {
    vi.spyOn(authService, 'login').mockRejectedValue(new Error('Invalid credentials'));
    const user = userEvent.setup();
    renderAuth();

    await user.type(screen.getByLabelText(/email address/i), 'jane@example.com');
    await user.type(screen.getByLabelText(/^password$/i), 'password1');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
    expect(screen.queryByText('Dashboard page')).not.toBeInTheDocument();
  });

  it('signup mode collects a name and creates an account session', async () => {
    const user = userEvent.setup();
    renderAuth('/signup');

    await user.type(screen.getByLabelText(/full name/i), 'Sam Ops');
    await user.type(screen.getByLabelText(/email address/i), 'sam@cloudops.io');
    await user.type(screen.getByLabelText(/^password$/i), 'password1');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Dashboard page')).toBeInTheDocument();
    expect(getSession()).toMatchObject({ user: { name: 'Sam Ops', email: 'sam@cloudops.io' } });
  });

  it('links between sign in and sign up', async () => {
    renderAuth();
    await screen.findByRole('link', { name: /sign up/i });
    renderAuth('/signup');
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument();
  });
});
