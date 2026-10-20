import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import { AuthProvider, ProtectedRoute } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import LoadingSpinner from './components/common/LoadingSpinner';
import Landing from './pages/Landing';
import { formatAuthReturnPath } from './utils/format';
import { DEMO_MODE } from './utils/demoMode';

// Route-level code splitting keeps recharts (only used by Dashboard/Monitoring)
// out of the landing bundle.
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Instances = lazy(() => import('./pages/Instances'));
const Monitoring = lazy(() => import('./pages/Monitoring'));
const Alerts = lazy(() => import('./pages/Alerts'));
const ActivityLogs = lazy(() => import('./pages/ActivityLogs'));
const Users = lazy(() => import('./pages/Users'));
const Settings = lazy(() => import('./pages/Settings'));
const NotFound = lazy(() => import('./pages/NotFound'));

function PageFallback() {
  return (
    <div className="flex justify-center py-24">
      <LoadingSpinner text="Loading page..." />
    </div>
  );
}

/** Landing reads the signed-out bounce param (?authReturnTo=...) to restore the requested page. */
function LandingRoute() {
  const location = useLocation();
  return <Landing authReturn={formatAuthReturnPath(location.search)} />;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<LandingRoute />} />

              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/instances" element={<Instances />} />
                <Route path="/monitoring" element={<Monitoring />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/activity" element={<ActivityLogs />} />
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/** The Worker owns /auth/freebuff/* whenever one is running. If a
               * bundle is ever served without it (local dev, or a deployment
               * whose auth vars are missing), a stale sign-in link must not land
               * on the not-found page — send it somewhere that exists. */}
              <Route
                path="/auth/freebuff/*"
                element={<Navigate to={DEMO_MODE ? '/dashboard' : '/'} replace />}
              />

              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
