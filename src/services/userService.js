import api from './api';
import { mockUsers } from '../data/mockUsers';
import { useMock } from './config';

export const userService = {
  async getAll() {
    if (useMock) return [...mockUsers];
    return api.get('/users');
  },

  async create(user) {
    if (useMock) return { ...user, id: 'usr-' + Date.now(), createdAt: new Date().toISOString() };
    return api.post('/users', user);
  },

  async update(id, data) {
    if (useMock) return { success: true, ...data };
    return api.patch(`/users/${id}`, data);
  },
};
