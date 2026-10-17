import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Alerts from './Alerts';
import Users from './Users';
import ActivityLogs from './ActivityLogs';
import { ToastProvider } from '../context/ToastContext';
import { alertService } from '../services/alertService';
import { userService } from '../services/userService';
import { activityService } from '../services/activityService';

const cases = [
  {
    page: 'Alerts',
    Component: Alerts,
    service: alertService,
    loadingText: 'Loading alerts...',
    emptyMarker: 'No alerts found',
  },
  {
    page: 'Users',
    Component: Users,
    service: userService,
    loadingText: 'Loading users...',
    emptyMarker: 'No users found',
  },
  {
    page: 'ActivityLogs',
    Component: ActivityLogs,
    service: activityService,
    loadingText: 'Loading activity logs...',
    emptyMarker: 'No activities found',
  },
];

describe.each(cases)('$page page error handling', ({ Component, service, loadingText, emptyMarker }) => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('shows a retry state on failure and recovers when the retry succeeds', async () => {
    vi.spyOn(service, 'getAll')
      .mockRejectedValueOnce(new Error('Service unavailable'))
      .mockResolvedValueOnce([]);

    const user = userEvent.setup();
    render(
      <ToastProvider>
        <Component />
      </ToastProvider>
    );

    expect(await screen.findByText('Service unavailable')).toBeInTheDocument();
    expect(screen.queryByText(loadingText)).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));

    expect(await screen.findByText(emptyMarker)).toBeInTheDocument();
    expect(service.getAll).toHaveBeenCalledTimes(2);
  });
});
