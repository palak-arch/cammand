import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Cloud, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import { floatingIcons } from '../utils/floatingIcons';
import { useAuth } from '../context/AuthContext';
import { platformAuth } from '../services/authService';

export default function Auth({ mode }) {
  const isLogin = mode === 'login';
  const { login, signup, isAuthenticated, mode: authMode } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from || '/dashboard';

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const credentials = { email: form.email.trim(), password: form.password };
      if (isLogin) {
        await login(credentials);
      } else {
        await signup({ name: form.name.trim(), ...credentials });
      }
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Already signed in (session restored on mount) — no reason to show the form.
  if (isAuthenticated) return <Navigate to={redirectTo} replace />;

  const inputClass =
    'w-full rounded-lg border border-navy-200 bg-navy-50 px-3 py-2.5 pl-10 text-sm text-navy-900 outline-none transition-colors focus:border-navy-400 focus:ring-1 focus:ring-navy-400 placeholder-navy-400';

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-navy-100 px-4 py-10 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none z-0" aria-hidden="true">
        {floatingIcons.map(({ Icon, left, top, size, delay }, i) => (
          <Icon
            key={i}
            size={size}
            className="absolute text-navy-200 animate-float"
            style={{ left: `${left}%`, top: `${top}%`, animationDelay: `${delay}s` }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="rounded-xl border border-navy-200 bg-white shadow-sm p-8">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 flex items-center justify-center shadow-lg shadow-navy-900/20">
              <Cloud size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-navy-900 tracking-tight">CloudOps</h1>
              <p className="text-xs text-navy-500 font-medium tracking-wide uppercase">Command Center</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold text-navy-900">{isLogin ? 'Welcome back' : 'Create your account'}</h2>
          <p className="mt-1 text-sm text-navy-500 mb-6">
            {isLogin ? 'Sign in to access the Command Center' : 'Start managing your infrastructure in minutes'}
          </p>

          {error && (
            <div role="alert" className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 border-l-4 border-l-red-500 bg-red-50 px-3 py-2.5 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {authMode === 'platform' ? (
            <div className="space-y-4">
              <a
                href={platformAuth.signInUrl(redirectTo)}
                className="w-full flex items-center justify-center gap-2 rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-800 transition-colors shadow-sm"
              >
                Sign in with Freebuff
                <ArrowRight size={16} aria-hidden="true" />
              </a>
              <p className="text-center text-xs text-navy-500">
                Use your Freebuff account (Google, GitHub or Apple) — there is no CloudOps password.
              </p>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label htmlFor="auth-name" className="block text-sm text-navy-600 mb-1">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" aria-hidden="true" />
                  <input
                    id="auth-name"
                    type="text"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={inputClass}
                    autoComplete="name"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-sm text-navy-600 mb-1">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" aria-hidden="true" />
                <input
                  id="auth-email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={inputClass}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-sm text-navy-600 mb-1">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" aria-hidden="true" />
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inputClass}
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-navy-600">
                  <input type="checkbox" className="rounded border-navy-300 text-navy-900 focus:ring-navy-400" />
                  Remember me
                </label>
                <a href="#" className="font-medium text-navy-900 hover:underline">Forgot password?</a>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-navy-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-navy-800 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Please wait…' : isLogin ? 'Sign In' : 'Create Account'}
              <ArrowRight size={16} />
            </button>
          </form>
          )}

          {authMode === 'demo' && (
          <div className="mt-6 pt-6 border-t border-navy-100 text-center text-sm text-navy-500">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <Link to="/signup" className="font-medium text-navy-900 hover:underline">Sign up</Link>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-navy-900 hover:underline">Sign in</Link>
              </>
            )}
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
