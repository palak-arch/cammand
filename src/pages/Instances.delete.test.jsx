import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Instances from './Instances';
import { ToastProvider } from '../context/ToastContext';
import { instanceService } from '../services/instanceService';

const RUNNING_INSTANCE = {
  id: 'i-1',
  name: 'Production Web Server',
  type: 't3.micro',
  region: 'us-east-1',
  privateIp: '10.0.0.1',
  publicIp: '54.0.0.1',
  state: 'running',
  cpu: 42,
  diskUsage: 30,
  memoryUsage: 50,
  networkIn: 1.2,
  networkOut: 0.8,
  az: 'us-east-1a',
  launchTime: '2025-07-01T00:00:00Z',
};

const STOPPED_INSTANCE = { ...RUNNING_INSTANCE, id: 'i-2', name: 'Staging Worker', state: 'stopped' };

function renderPage() {
  return render(
    <ToastProvider>
      <Instances />
    </ToastProvider>
  );
}

describe('Instances page delete action', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(instanceService, 'getAll').mockResolvedValue([RUNNING_INSTANCE, STOPPED_INSTANCE]);
  });

  it('deletes the instance after confirmation: service call, row gone, toast shown', async () => {
    vi.spyOn(instanceService, 'remove').mockResolvedValue({ success: true });
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText('Production Web Server')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete Production Web Server' }));

    // Confirmation is required — destructive actions must not fire on one click.
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Production Web Server')).toBeInTheDocument();
    expect(instanceService.remove).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('Instance deleted successfully')).toBeInTheDocument();
    expect(instanceService.remove).toHaveBeenCalledWith('i-1');
    expect(screen.queryByText('Production Web Server')).not.toBeInTheDocument();
    // The other row survives.
    expect(screen.getByText('Staging Worker')).toBeInTheDocument();
  });

  it('cancelling the confirmation deletes nothing', async () => {
    vi.spyOn(instanceService, 'remove').mockResolvedValue({ success: true });
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText('Production Web Server')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete Production Web Server' }));
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(screen.getByText('Production Web Server')).toBeInTheDocument();
    expect(screen.getByText('Staging Worker')).toBeInTheDocument();
    expect(instanceService.remove).not.toHaveBeenCalled();
  });

  it('keeps the row and surfaces an error when the delete fails', async () => {
    vi.spyOn(instanceService, 'remove').mockRejectedValue(new Error('Could not reach the server'));
    const user = userEvent.setup();
    renderPage();

    expect(await screen.findByText('Production Web Server')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Delete Production Web Server' }));
    await user.click(await screen.findByRole('button', { name: 'Delete' }));

    expect(await screen.findByText('Could not reach the server')).toBeInTheDocument();
    expect(screen.getByText('Production Web Server')).toBeInTheDocument();
  });

  it('offers delete for every row regardless of state', async () => {
    renderPage();

    expect(await screen.findByRole('button', { name: 'Delete Production Web Server' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Delete Staging Worker' })).toBeEnabled();
  });
});
