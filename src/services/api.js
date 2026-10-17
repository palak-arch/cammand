import axios from 'axios';
import { API_BASE_URL } from './config';
import { getToken } from './session';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function toError(error) {
  if (error?.response) {
    const data = error.response.data;
    const message = data?.detail || data?.message || `Request failed with status ${error.response.status}.`;
    const normalized = new Error(message);
    normalized.status = error.response.status;
    return normalized;
  }
  if (error?.code === 'ECONNABORTED') return new Error('The request timed out. Please try again.');
  if (error?.message) return new Error(`Could not reach the server: ${error.message}`);
  return new Error('Network error. Please check your connection and try again.');
}

api.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(toError(error))
);

export default api;