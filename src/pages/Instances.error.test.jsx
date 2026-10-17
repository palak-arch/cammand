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

describe('Instances page error handling', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('turns a failed request into a retry state instead of a hung spinner', async () => {
    vi.spyOn(instanceService, 'getAll')
      .mockRejectedValueOnce(new Error('Could not reach the server'))
      .mockResolvedValueOnce([RUNNING_INSTANCE]);

    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Instances />
      </ToastProvider>
    );

    // The spinner must resolve into an actionable error state.
    expect(await screen.findByText('Could not reach the server')).toBeInTheDocument();
    expect(screen.queryByText('Loading instances...')).not.toBeInTheDocument();

    // Retry refetches and renders the table on success.
    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(await screen.findByText('Production Web Server')).toBeInTheDocument();
    expect(instanceService.getAll).toHaveBeenCalledTimes(2);
    expect(screen.queryByText('Could not reach the server')).not.toBeInTheDocument();
  });

  it('shows the error again if the retry also fails', async () => {
    vi.spyOn(instanceService, 'getAll')
      .mockRejectedValueOnce(new Error('First failure'))
      .mockRejectedValueOnce(new Error('Second failure'));

    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Instances />
      </ToastProvider>
    );

    expect(await screen.findByText('First failure')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByText('Second failure')).toBeInTheDocument();
  });
});
