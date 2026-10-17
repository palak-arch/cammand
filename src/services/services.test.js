import { describe, it, expect } from 'vitest';
import { instanceService } from './instanceService';
import { alertService } from './alertService';
import { userService } from './userService';
import { monitoringService } from './monitoringService';
import { activityService } from './activityService';
import { mockInstances } from '../data/mockInstances';
import { mockAlerts } from '../data/mockAlerts';
import { mockUsers } from '../data/mockUsers';
import { mockActivities } from '../data/mockActivities';

// VITE_USE_MOCK is unset in tests, so every service serves mock data.

describe('instanceService (mock mode)', () => {
  it('returns a defensive copy of the instance list', async () => {
    const list = await instanceService.getAll();
    expect(list).toHaveLength(mockInstances.length);
    list.pop();
    const again = await instanceService.getAll();
    expect(again).toHaveLength(mockInstances.length);
  });

  it('finds an instance by id', async () => {
    const first = mockInstances[0];
    await expect(instanceService.getById(first.id)).resolves.toMatchObject({ id: first.id });
  });

  it('performs lifecycle actions', async () => {
    await expect(instanceService.start('i-1')).resolves.toMatchObject({ success: true });
    await expect(instanceService.stop('i-1')).resolves.toMatchObject({ success: true });
    await expect(instanceService.restart('i-1')).resolves.toMatchObject({ success: true });
  });
});

describe('alertService (mock mode)', () => {
  it('returns a defensive copy of alerts', async () => {
    const list = await alertService.getAll();
    expect(list).toHaveLength(mockAlerts.length);
    list.pop();
    expect(await alertService.getAll()).toHaveLength(mockAlerts.length);
  });

  it('acknowledges and resolves alerts', async () => {
    await expect(alertService.acknowledge('al-1')).resolves.toMatchObject({ success: true });
    await expect(alertService.resolve('al-1')).resolves.toMatchObject({ success: true });
  });
});

describe('userService (mock mode)', () => {
  it('returns a defensive copy of users', async () => {
    const list = await userService.getAll();
    expect(list).toHaveLength(mockUsers.length);
  });

  it('creates a user with an id and createdAt', async () => {
    const created = await userService.create({ name: 'New', email: 'new@x.io', role: 'Viewer', status: 'active' });
    expect(created).toMatchObject({ name: 'New', email: 'new@x.io' });
    expect(created.id).toMatch(/^usr-/);
    expect(created.createdAt).toBeTruthy();
  });

  it('updates a user', async () => {
    await expect(userService.update('usr-1', { role: 'Admin' })).resolves.toMatchObject({ success: true, role: 'Admin' });
  });
});

describe('monitoringService (mock mode)', () => {
  it('returns all metric series', async () => {
    const metrics = await monitoringService.getMetrics('all', '24h');
    expect(Object.keys(metrics).sort()).toEqual(['cpu', 'disk', 'memory', 'networkIn', 'networkOut']);
    expect(Array.isArray(metrics.cpu)).toBe(true);
  });

  it('returns the dashboard widget payload', async () => {
    const dash = await monitoringService.getDashboard();
    expect(dash.dashboardSummary).toBeDefined();
    expect(Array.isArray(dash.cpu)).toBe(true);
    expect(Array.isArray(dash.resourceStatus)).toBe(true);
    expect(dash.systemHealth).toBeDefined();
  });
});

describe('activityService (mock mode)', () => {
  it('returns a defensive copy of activities', async () => {
    const list = await activityService.getAll();
    expect(list).toHaveLength(mockActivities.length);
    list.pop();
    expect(await activityService.getAll()).toHaveLength(mockActivities.length);
  });
});
