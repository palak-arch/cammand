export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Mock data is the default; set VITE_USE_MOCK=false in .env.local to hit the real API.
export const useMock = import.meta.env.VITE_USE_MOCK !== 'false';

// Real Sign in with Freebuff is enabled at build time for deployed previews
// (VITE_AUTH_PLATFORM=true). Without it the app runs the local demo login.
export const usePlatformAuth = import.meta.env.VITE_AUTH_PLATFORM === 'true';