import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { authService, platformAuth } from '../services/authService';
import { getSession } from '../services/session';
import { usePlatformAuth } from '../services/config';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Platform mode: the session lives in an httpOnly cookie owned by the
  // Worker; we verify it once on mount. Demo mode keeps localStorage.
  const [session, setSession] = useState(() => (usePlatformAuth ? null : getSession()));
  const [status, setStatus] = useState(usePlatformAuth ? 'loading' : 'ready');

  useEffect(() => {
    if (!usePlatformAuth) return undefined;
    let active = true;
    platformAuth
      .getSession()
      .then((next) => {
        if (active) {
          setSession(next);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (active) {
          setSession(null);
          setStatus('ready');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    if (usePlatformAuth) {
      platformAuth.signIn('/dashboard');
      return null;
    }
    const next = await authService.login(credentials);
    setSession(next);
    return next;
  }, []);

  const signup = useCallback(async (values) => {
    if (usePlatformAuth) {
      platformAuth.signIn('/dashboard');
      return null;
    }
    const next = await authService.signup(values);
    setSession(next);
    return next;
  }, []);

  const logout = useCallback(() => {
    if (usePlatformAuth) {
      platformAuth.signOut();
      return;
    }
    authService.logout();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      // 'loading' while a platform session is being verified; 'ready' in demo mode.
      status,
      mode: usePlatformAuth ? 'platform' : 'demo',
      login,
      signup,
      logout,
    }),
    [session, status, login, signup, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

/** Redirects signed-out visitors to /login, remembering where they wanted to go. */
export function ProtectedRoute({ children }) {
  const { isAuthenticated, status } = useAuth();
  const location = useLocation();

  // A platform session is verified server-side before deciding; don't flash
  // the login page while that check is in flight.
  if (status === 'loading') {
    return (
      <div className="flex justify-center py-24" role="status" aria-label="Checking your session">
        <Loader2 size={24} className="animate-spin text-navy-700" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  return children;
}
