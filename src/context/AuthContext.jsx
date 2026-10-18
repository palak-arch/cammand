import { createContext, useContext, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFreebuffUser } from '@freebuff/auth/react';

import LoadingSpinner from '../components/common/LoadingSpinner';
import { authReturnQuery } from '../utils/format';

const AuthContext = createContext(null);

/**
 * Reads the signed-in visitor from the site's own /auth/freebuff/session
 * (served by the Worker from its httpOnly cookie). The browser never sees
 * or decodes tokens — this user object is for display only; the server
 * decides access on every protected route and API call.
 */
export function AuthProvider({ children }) {
  const { user: freebuffUser, isLoading } = useFreebuffUser();

  // Session surface for the UI: signed-out visitors get null.
  const user = useMemo(() => {
    if (!freebuffUser) return null;
    return {
      name: freebuffUser.name || 'CloudOps user',
      email: freebuffUser.email || '',
      avatarUrl: freebuffUser.picture || null,
      signedIn: true,
    };
  }, [freebuffUser]);

  const value = useMemo(() => ({ user, loading: isLoading }), [user, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>');
  return context;
}

/**
 * Signed-out visitors go back to the landing page; the authReturnTo query
 * param remembers which page they wanted so sign-in can return them there.
 */
export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Don't flash the landing page while the session check is in flight.
  if (loading) {
    return <LoadingSpinner text="Checking your session..." />;
  }

  if (!user) {
    return <Navigate to={`/${authReturnQuery(location)}`} replace />;
  }
  return children;
}
