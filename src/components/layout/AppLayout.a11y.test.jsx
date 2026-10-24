import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Signed-in session so the shell renders the user card and sign-out control.
vi.mock('@freebuff/auth/react', () => ({
  useFreebuffUser: () => ({
    user: { name: 'Jane Doe', email: 'jane@example.com', picture: null },
    isLoading: false,
  }),
  SignOutButton: ({ children }) => <button type="button">{children}</button>,
}));

import { AuthProvider } from '../../context/AuthContext';
import PageHeader from '../common/PageHeader';
import AppLayout from './AppLayout';

function DashboardProbe() {
  return <PageHeader title="Dashboard" subtitle="Probe page" />;
}

function renderShell() {
  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthProvider>
        <Routes>
          <Route path="/dashboard" element={<AppLayout />}>
            <Route index element={<DashboardProbe />} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('AppLayout accessibility', () => {
  it('exposes exactly one h1: the page heading, not the sidebar brand', () => {
    renderShell();

    const headings = document.querySelectorAll('h1');
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Dashboard');
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Dashboard');
  });

  it('provides a main landmark and a labelled primary navigation', () => {
    renderShell();

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
  });
});
