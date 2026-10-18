import { useLocation } from 'react-router-dom';
import { Search, Bell, Menu } from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import UserAvatar from '../common/UserAvatar';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/instances': 'EC2 Instances',
  '/monitoring': 'Monitoring',
  '/alerts': 'Alerts',
  '/activity': 'Activity Logs',
  '/users': 'User Management',
  '/settings': 'Settings',
};

export default function TopNavbar({ onMenuClick }) {
  const location = useLocation();
  const { user } = useAuth();
  const title = pageTitles[location.pathname] || 'CloudOps';

  const displayName = user?.name || user?.email || 'Unknown User';

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-navy-200">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="lg:hidden rounded-lg p-1.5 text-navy-500 hover:bg-navy-100 hover:text-navy-900 transition-colors"
          >
            <Menu size={20} />
          </button>
          {/* Not a heading: each page owns its single <h1> via PageHeader. */}
          <p className="text-lg font-semibold text-navy-900">{title}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block relative">
            <label htmlFor="topnav-search" className="sr-only">Search resources</label>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400" aria-hidden="true" />
            <input
              id="topnav-search"
              type="text"
              placeholder="Search resources..."
              className="w-56 lg:w-64 rounded-lg border border-navy-200 bg-navy-50 py-1.5 pl-9 pr-3 text-sm text-navy-900 placeholder-navy-400 outline-none transition-colors focus:border-navy-400 focus:ring-1 focus:ring-navy-400"
            />
          </div>

          <button
            type="button"
            aria-label="View notifications"
            className="relative rounded-lg p-1.5 text-navy-400 hover:bg-navy-100 hover:text-navy-900 transition-colors"
          >
            <Bell size={18} />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-navy-200">
            <UserAvatar user={user} className="h-8 w-8 text-xs" />
            <div className="hidden md:block">
              <p className="text-sm font-medium text-navy-900 leading-tight">{displayName}</p>
              <p className="text-xs text-navy-500 leading-tight">{user?.email || 'Not signed in'}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
