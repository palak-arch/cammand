import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Instances from './Instances';
import { ToastProvider } from '../context/ToastContext';
import { instanceService } from '../services/instanceService';
import { mockInstances } from '../data/mockInstances';

// Integration test — nothing is spied or mocked here. The real page runs
// against the real useApi hook, the real instanceService (mock mode) and the
// real fixtures, so this catches wiring bugs the boundary-mocked unit tests
// in Instances.delete.test.jsx cannot see.
describe('Instances page ↔ instanceService integration (mock mode)', () => {
  function renderPage() {
    return render(
      <ToastProvider>
        <Instances />
      </ToastProvider>
    );
  }

  it('loads all fixtures through the real service and deletes one end-to-end', async () => {
    const user = userEvent.setup();
    renderPage();

    // Every fixture arrives through useApi → instanceService.getAll().
    const first = mockInstances[0];
    expect(await screen.findByText(first.name)).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(mockInstances.length + 1); // + header

    // Delete through the UI: row button → confirmation dialog → confirm.
    await user.click(screen.getByRole('button', { name: `Delete ${first.name}` }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('Instance deleted successfully')).toBeInTheDocument();
    expect(screen.queryByText(first.name)).not.toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(mockInstances.length); // one row gone

    // The rest of the fixtures survive, untouched.
    const second = mockInstances[1];
    expect(screen.getByText(second.name)).toBeInTheDocument();

    // Page state is a defensive copy: the fixture list itself is intact, so
    // other pages and a reload still see the full dataset.
    await expect(instanceService.getAll()).resolves.toHaveLength(mockInstances.length);
  });

  it('cancelling leaves the full stack unchanged', async () => {
    const user = userEvent.setup();
    renderPage();

    const first = mockInstances[0];
    expect(await screen.findByText(first.name)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: `Delete ${first.name}` }));
    await user.click(await screen.findByRole('button', { name: 'Cancel' }));

    expect(screen.getByText(first.name)).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(mockInstances.length + 1);
  });
});
