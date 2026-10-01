import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import {
  LogOut,
  User as UserIcon,
  Menu,
  ShieldCheck,
  Search,
  ChevronRight,
  Command,
} from 'lucide-react';

export const HeaderNav: React.FC<{
  onToggleMobileSidebar?: () => void;
  onOpenCommandSearch?: () => void;
}> = ({ onToggleMobileSidebar, onOpenCommandSearch }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute breadcrumbs from pathname
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return [{ label: 'Workspace', path: '/' }, { label: 'Dashboard' }];
    if (path === '/issues') return [{ label: 'Workspace', path: '/' }, { label: 'Issues' }];
    if (path === '/issues/new') return [{ label: 'Issues', path: '/issues' }, { label: 'New Issue' }];
    if (path.startsWith('/issues/')) return [{ label: 'Issues', path: '/issues' }, { label: 'Issue Detail' }];
    if (path === '/projects') return [{ label: 'Workspace', path: '/' }, { label: 'Projects' }];
    if (path === '/applications') return [{ label: 'Workspace', path: '/' }, { label: 'Applications' }];
    if (path === '/team') return [{ label: 'Workspace', path: '/' }, { label: 'Team' }];
    if (path === '/command-center') return [{ label: 'Intelligence', path: '/command-center' }, { label: 'Command Center' }];
    if (path === '/analytics') return [{ label: 'Intelligence', path: '/analytics' }, { label: 'Analytics & Forecasts' }];
    if (path === '/incidents') return [{ label: 'Operations', path: '/incidents' }, { label: 'Incidents' }];
    if (path.startsWith('/incidents/')) return [{ label: 'Incidents', path: '/incidents' }, { label: 'War Room' }];
    if (path === '/operations') return [{ label: 'Operations', path: '/operations' }, { label: 'System Cockpit' }];
    if (path === '/users') return [{ label: 'Administration', path: '/users' }, { label: 'User Directory' }];
    if (path === '/notifications') return [{ label: 'Account', path: '/' }, { label: 'Notifications' }];
    if (path === '/profile') return [{ label: 'Account', path: '/' }, { label: 'Profile' }];
    return [{ label: 'AITS' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-14 bg-white/95 backdrop-blur-xs border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between flex-shrink-0 z-10 select-none shadow-2xs">
      {/* Left: Mobile Toggle & Breadcrumbs */}
      <div className="flex items-center space-x-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          aria-label="Toggle navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-slate-500 min-w-0">
          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                {crumb.path && !isLast ? (
                  <Link
                    to={crumb.path}
                    className="hover:text-slate-900 transition-colors truncate max-w-[120px] font-medium"
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={`truncate max-w-[160px] ${isLast ? 'font-semibold text-slate-900' : ''}`}>
                    {crumb.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Center/Right: Global Command Search Trigger + Notifications + User Menu */}
      <div className="flex items-center space-x-3">
        {/* Global Search Button (Ctrl+K) */}
        <button
          onClick={onOpenCommandSearch}
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg text-xs text-slate-500 hover:text-slate-700 transition-colors shadow-2xs"
          title="Search anything (Ctrl+K or ⌘K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 font-normal">Search workspace...</span>
          <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded shadow-3xs">
            <Command className="w-2.5 h-2.5" />K
          </kbd>
        </button>

        {/* Mobile search icon */}
        <button
          onClick={onOpenCommandSearch}
          className="sm:hidden p-1.5 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <NotificationDropdown />

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2 p-1 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
            aria-expanded={isProfileOpen}
            aria-label="User menu"
          >
            <div className="w-7 h-7 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
              {user?.firstName?.[0] || 'U'}
            </div>
            <div className="text-left hidden lg:block pr-1">
              <span className="block text-xs font-semibold text-slate-900 leading-tight">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="block text-[10px] text-slate-500 uppercase font-medium">
                {user?.role}
              </span>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-brand-600" />
                  <span>My Profile</span>
                </Link>

                <div className="px-4 py-1.5 text-[11px] text-slate-500 flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Role: <strong className="text-slate-700">{user?.role}</strong></span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
