import api from './api';
import { useMock } from './config';
import { mockActivities } from '../data/mockActivities';

export const activityService = {
  async getAll() {
    if (useMock) return [...mockActivities];
    return api.get('/activities');
  },
};