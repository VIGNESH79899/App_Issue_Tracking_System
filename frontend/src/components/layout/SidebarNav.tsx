import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@app-issue-track/shared';
import {
  LayoutDashboard,
  ShieldAlert,
  LineChart,
  Bug,
  PlusCircle,
  FolderGit2,
  Boxes,
  Users,
  Bell,
  ShieldCheck,
} from 'lucide-react';

export const SidebarNav: React.FC<{ isOpen?: boolean; onCloseMobile?: () => void }> = ({
  onCloseMobile,
}) => {
  const { user } = useAuth();
  const role = user?.role || UserRole.REPORTER;

  const links = [
    { label: 'Dashboard', to: '/', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER, UserRole.REPORTER] },
    { label: 'Command Center', to: '/command-center', icon: LayoutDashboard, roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER] },
    { label: 'Analytics & Forecasts', to: '/analytics', icon: LineChart, roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER, UserRole.REPORTER] },
    { label: 'Incidents', to: '/incidents', icon: ShieldAlert, roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER, UserRole.REPORTER] },
    { label: 'Issues', to: '/issues', icon: Bug, roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER, UserRole.REPORTER] },
    { label: 'Create Issue', to: '/issues/new', icon: PlusCircle, roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER, UserRole.REPORTER] },
    { label: 'Applications', to: '/applications', icon: Boxes, roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER, UserRole.REPORTER] },
    { label: 'Projects', to: '/projects', icon: FolderGit2, roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER, UserRole.REPORTER] },
    { label: 'Team', to: '/team', icon: Users, roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER, UserRole.REPORTER] },
    { label: 'Users', to: '/users', icon: ShieldCheck, roles: [UserRole.ADMIN] },
    { label: 'Operations', to: '/operations', icon: ShieldCheck, roles: [UserRole.ADMIN] },
    { label: 'Notifications', to: '/notifications', icon: Bell, roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER, UserRole.REPORTER] },
  ];

  const filteredLinks = links.filter((link) => link.roles.includes(role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen border-r border-slate-800 flex-shrink-0">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-6 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            AI
          </div>
          <div>
            <span className="font-bold text-white tracking-wide text-base block leading-none">AITS</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold block mt-0.5">
              Issue Tracking
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Main Menu
        </div>
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/' || link.to === '/issues'}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-subtle'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Info Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-xs border border-slate-700">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <div className="flex items-center space-x-1 mt-0.5">
              <ShieldCheck className="w-3 h-3 text-brand-400" />
              <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                {role}
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
