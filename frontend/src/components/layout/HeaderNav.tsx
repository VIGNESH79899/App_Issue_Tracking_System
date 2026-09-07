import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import { LogOut, User as UserIcon, Menu, ShieldCheck } from 'lucide-react';

export const HeaderNav: React.FC<{ onToggleMobileSidebar?: () => void }> = ({
  onToggleMobileSidebar,
}) => {
  const { user, logout } = useAuth();
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

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between flex-shrink-0 z-10">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleMobileSidebar}
          className="md:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-md"
          aria-label="Toggle mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold text-slate-700 hidden sm:block">
          Applications Issue Tracking System
        </span>
      </div>

      <div className="flex items-center space-x-4">
        <NotificationDropdown />

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-2.5 p-1.5 rounded-full hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <div className="w-8 h-8 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-subtle">
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
            <div className="absolute right-0 mt-2 w-52 bg-white rounded-lg shadow-xl border border-slate-200 py-1 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/profile"
                  onClick={() => setIsProfileOpen(false)}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center space-x-2 transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-brand-600" />
                  <span>My Profile</span>
                </Link>

                <div className="px-4 py-1.5 text-xs text-slate-500 flex items-center space-x-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                  <span>Role: {user?.role}</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition-colors"
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
