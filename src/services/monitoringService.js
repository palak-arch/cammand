import api from './api';
import { cpuMetrics, networkInMetrics, networkOutMetrics, diskMetrics, memoryMetrics, dashboardSummary, resourceStatus, systemHealth } from '../data/mockMetrics';
import { useMock } from './config';

export const monitoringService = {
  async getMetrics(instanceId, timeRange) {
    if (useMock) return { cpu: cpuMetrics, networkIn: networkInMetrics, networkOut: networkOutMetrics, disk: diskMetrics, memory: memoryMetrics };
    return api.get('/monitoring/metrics', { params: { instanceId, timeRange } });
  },

  /** Aggregated dashboard widgets: summary counts, CPU series, resource split, system health. */
  async getDashboard() {
    if (useMock) return { dashboardSummary, cpu: cpuMetrics, resourceStatus, systemHealth };
    return api.get('/monitoring/dashboard');
  },
};
