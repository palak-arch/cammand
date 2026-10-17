import api from './api';
import { mockAlerts } from '../data/mockAlerts';
import { useMock } from './config';

export const alertService = {
  async getAll() {
    if (useMock) return [...mockAlerts];
    return api.get('/alerts');
  },

  async acknowledge(id) {
    if (useMock) return { success: true, message: 'Alert acknowledged' };
    return api.patch(`/alerts/${id}/acknowledge`);
  },

  async resolve(id) {
    if (useMock) return { success: true, message: 'Alert resolved' };
    return api.patch(`/alerts/${id}/resolve`);
  },
};
