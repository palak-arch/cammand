import axios from 'axios';
import { API_BASE_URL } from './config';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// No Authorization header here: the session cookie is httpOnly and owned by
// the Worker; the browser never holds a token to attach (when a real API is
// wired up, it must share the Worker's session cookie instead).

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