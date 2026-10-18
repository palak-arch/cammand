import { NavLink } from 'react-router-dom';
import { SignOutButton } from '@freebuff/auth/react';
import { LayoutDashboard, Server, BarChart3, Bell, ClipboardList, Users, Settings, LogOut, Cloud, X, ChevronRight } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../common/UserAvatar';

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Infrastructure',
    items: [
      { to: '/instances', icon: Server, label: 'EC2 Instances' },
      { to: '/monitoring', icon: BarChart3, label: 'Monitoring' },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/alerts', icon: Bell, label: 'Alerts' },
      { to: '/activity', icon: ClipboardList, label: 'Activity Logs' },
    ],
  },
  {
    label: 'Administration',
    items: [
      { to: '/users', icon: Users, label: 'User Management' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ],
  },
];

export default function MobileSidebar({ isOpen, onClose }) {
  const { user } = useAuth();

  if (!isOpen) return null;

  const displayName = user?.name || user?.email || 'Unknown User';

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="fixed inset-y-0 left-0 w-72 bg-white flex flex-col z-50 shadow-2xl" aria-label="Mobile navigation">
        {/* Logo + Close */}
        <div className="flex items-center justify-between px-8 pt-6 pb-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-700 flex items-center justify-center shadow-lg shadow-navy-900/20">
              <Cloud size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-navy-900 tracking-tight">CloudOps</h1>
              <p className="text-xs text-navy-500 font-medium tracking-wide uppercase">Command Center</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-xl p-2 text-navy-400 hover:bg-navy-100 hover:text-navy-900 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-5 overflow-y-auto">
          {navSections.map((section, sIdx) => (
            <div key={section.label} className={sIdx > 0 ? 'mt-5' : ''}>
              <p className="px-5 mb-2 text-xs font-semibold uppercase tracking-[0.1em] text-navy-500">
                {section.label}
              </p>
              <div className="flex flex-col">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `group flex items-center gap-4 px-5 py-2.5 mx-2 my-0.5 rounded-xl text-[15px] font-medium transition-all duration-200 ${
                        isActive
                          ? 'bg-navy-900 text-white shadow-md shadow-navy-900/20'
                          : 'text-navy-600 hover:bg-navy-50 hover:text-navy-900'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={22} strokeWidth={isActive ? 2.2 : 1.8} className={isActive ? 'text-white' : 'text-navy-500 group-hover:text-navy-700'} aria-hidden="true" />
                        <span className="flex-1">{item.label}</span>
                        {!isActive && <ChevronRight size={15} className="text-navy-300 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" aria-hidden="true" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* User Profile */}
        <div className="px-6 pb-4 pt-3">
          <div className="rounded-2xl bg-navy-50 border border-navy-100 p-5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <UserAvatar user={user} className="h-11 w-11 text-sm" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-navy-900 truncate">{displayName}</p>
                <p className="text-xs text-navy-500 truncate">{user?.email || 'Not signed in'}</p>
              </div>
            </div>
            {/* Sign-out must be a POST handled by the Worker — a plain link would let other sites sign visitors out. */}
            <SignOutButton
              returnTo="/"
              className="mt-4 w-full flex items-center justify-center gap-2.5 rounded-xl border border-navy-200 bg-white px-4 py-2.5 text-sm font-medium text-navy-600 hover:bg-navy-900 hover:text-white hover:border-navy-900 transition-all duration-200 shadow-sm"
            >
              <LogOut size={16} aria-hidden="true" />
              Sign Out
            </SignOutButton>
          </div>
        </div>
      </aside>
    </div>
  );
}
