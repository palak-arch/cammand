import api from './api';
import { mockInstances } from '../data/mockInstances';
import { useMock } from './config';

export const instanceService = {
  async getAll() {
    if (useMock) return [...mockInstances];
    return api.get('/ec2/instances');
  },

  async getById(id) {
    if (useMock) return mockInstances.find((i) => i.id === id);
    return api.get(`/ec2/instances/${id}`);
  },

  async start(id) {
    if (useMock) return { success: true, message: 'Instance started' };
    return api.post(`/ec2/instances/${id}/start`);
  },

  async stop(id) {
    if (useMock) return { success: true, message: 'Instance stopped' };
    return api.post(`/ec2/instances/${id}/stop`);
  },

  async restart(id) {
    if (useMock) return { success: true, message: 'Instance restarting' };
    return api.post(`/ec2/instances/${id}/restart`);
  },

  async remove(id) {
    if (useMock) return { success: true, message: 'Instance deleted' };
    return api.delete(`/ec2/instances/${id}`);
  },
};
