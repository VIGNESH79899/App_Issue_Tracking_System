import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@app-issue-track/shared';
import {
  LayoutDashboard,
  Bug,
  FolderGit2,
  Boxes,
  Users,
  Activity,
  LineChart,
  ShieldAlert,
  ShieldCheck,
  Bell,
  Cpu,
} from 'lucide-react';

interface NavSection {
  title: string;
  items: {
    label: string;
    to: string;
    icon: React.ElementType;
    roles: UserRole[];
    badge?: string;
  }[];
}

export const SidebarNav: React.FC<{ isOpen?: boolean; onCloseMobile?: () => void }> = ({
  onCloseMobile,
}) => {
  const { user } = useAuth();
  const role = user?.role || UserRole.REPORTER;

  const sections: NavSection[] = [
    {
      title: 'WORKSPACE',
      items: [
        {
          label: 'Dashboard',
          to: '/',
          icon: LayoutDashboard,
          roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER, UserRole.REPORTER],
        },
        {
          label: 'Issues',
          to: '/issues',
          icon: Bug,
          roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER, UserRole.REPORTER],
        },
        {
          label: 'Projects',
          to: '/projects',
          icon: FolderGit2,
          roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER, UserRole.REPORTER],
        },
        {
          label: 'Applications',
          to: '/applications',
          icon: Boxes,
          roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER, UserRole.REPORTER],
        },
        {
          label: 'Team',
          to: '/team',
          icon: Users,
          roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER, UserRole.REPORTER],
        },
      ],
    },
    {
      title: 'ENGINEERING INTELLIGENCE',
      items: [
        {
          label: 'Command Center',
          to: '/command-center',
          icon: Activity,
          roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER],
        },
        {
          label: 'Analytics & Forecasts',
          to: '/analytics',
          icon: LineChart,
          roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER, UserRole.REPORTER],
        },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        {
          label: 'Incidents',
          to: '/incidents',
          icon: ShieldAlert,
          roles: [UserRole.ADMIN, UserRole.PROJECT_MANAGER, UserRole.DEVELOPER, UserRole.REPORTER],
        },
        {
          label: 'Operations',
          to: '/operations',
          icon: Cpu,
          roles: [UserRole.ADMIN],
        },
      ],
    },
    {
      title: 'ADMINISTRATION',
      items: [
        {
          label: 'Users',
          to: '/users',
          icon: ShieldCheck,
          roles: [UserRole.ADMIN],
        },
      ],
    },
  ];

  return (
    <aside className="w-60 bg-[#0f1117] text-slate-400 flex flex-col h-screen border-r border-[#1e2330] flex-shrink-0 select-none relative z-20">
      {/* Brand Header */}
      <div className="h-14 flex items-center px-4 border-b border-[#1e2330] gap-3">
        <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
          A
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-semibold text-white tracking-tight text-sm">AITS</span>
          <span className="text-[11px] text-slate-500 font-normal">Ops</span>
        </div>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-2.5 py-4 space-y-5">
        {sections.map((sec) => {
          const authorizedItems = sec.items.filter((item) => item.roles.includes(role));
          if (authorizedItems.length === 0) return null;

          return (
            <div key={sec.title} className="space-y-0.5">
              <div className="px-2.5 pb-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                {sec.title}
              </div>
              {authorizedItems.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/' || link.to === '/issues'}
                    onClick={onCloseMobile}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-[#1e2330] text-white font-semibold'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a23]'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Notifications Quick Link */}
      <div className="px-2.5 py-2 border-t border-[#1e2330]">
        <NavLink
          to="/notifications"
          onClick={onCloseMobile}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
              isActive
                ? 'bg-[#1e2330] text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#161a23]'
            }`
          }
        >
          <Bell className="w-4 h-4 shrink-0" />
          <span>Notifications</span>
        </NavLink>
      </div>

      {/* User Info Footer */}
      <div className="p-3 border-t border-[#1e2330] bg-[#0c0e14]">
        <div className="flex items-center space-x-2.5">
          <div className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-medium text-xs border border-slate-700">
            {user?.firstName?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
              {role}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
