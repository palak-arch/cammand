export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Mock data is the default; set VITE_USE_MOCK=false in .env.local to hit the real API.
// (Auth is always Sign in with Freebuff — there is no auth flag or local login.)
export const useMock = import.meta.env.VITE_USE_MOCK !== 'false';