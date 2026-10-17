export const cpuMetrics = [
  { time: '00:00', value: 23 }, { time: '01:00', value: 18 }, { time: '02:00', value: 15 },
  { time: '03:00', value: 12 }, { time: '04:00', value: 10 }, { time: '05:00', value: 14 },
  { time: '06:00', value: 20 }, { time: '07:00', value: 35 }, { time: '08:00', value: 52 },
  { time: '09:00', value: 65 }, { time: '10:00', value: 58 }, { time: '11:00', value: 62 },
  { time: '12:00', value: 55 }, { time: '13:00', value: 60 }, { time: '14:00', value: 72 },
  { time: '15:00', value: 68 }, { time: '16:00', value: 63 }, { time: '17:00', value: 55 },
  { time: '18:00', value: 48 }, { time: '19:00', value: 42 }, { time: '20:00', value: 38 },
  { time: '21:00', value: 32 }, { time: '22:00', value: 28 }, { time: '23:00', value: 25 },
];

export const networkInMetrics = [
  { time: '00:00', value: 0.8 }, { time: '04:00', value: 0.5 }, { time: '08:00', value: 2.1 },
  { time: '12:00', value: 1.8 }, { time: '16:00', value: 2.5 }, { time: '20:00', value: 1.2 },
];

export const networkOutMetrics = [
  { time: '00:00', value: 1.2 }, { time: '04:00', value: 0.8 }, { time: '08:00', value: 3.5 },
  { time: '12:00', value: 2.9 }, { time: '16:00', value: 4.1 }, { time: '20:00', value: 2.0 },
];

export const diskMetrics = [
  { time: '00:00', value: 45 }, { time: '04:00', value: 45 }, { time: '08:00', value: 48 },
  { time: '12:00', value: 52 }, { time: '16:00', value: 55 }, { time: '20:00', value: 50 },
];

export const memoryMetrics = [
  { time: '00:00', value: 55 }, { time: '04:00', value: 50 }, { time: '08:00', value: 62 },
  { time: '12:00', value: 68 }, { time: '16:00', value: 72 }, { time: '20:00', value: 60 },
];

export const resourceStatus = [
  { name: 'Running', value: 8, color: '#22c55e' },
  { name: 'Stopped', value: 3, color: '#f59e0b' },
  { name: 'Pending', value: 1, color: '#3b82f6' },
];

export const systemHealth = {
  status: 'healthy',
  message: 'All systems operational',
  lastUpdated: 'Just now',
  uptime: '99.97%',
};

export const dashboardSummary = {
  totalInstances: 12,
  runningInstances: 8,
  stoppedInstances: 3,
  activeAlerts: 2,
  overallHealth: 'Healthy',
};
