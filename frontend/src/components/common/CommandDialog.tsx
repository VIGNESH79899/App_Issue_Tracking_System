import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@app-issue-track/shared';
import { issuesApi } from '../../services/issuesApi';
import { projectsApi } from '../../services/projectsApi';
import { applicationsApi } from '../../services/applicationsApi';
import { incidentApi } from '../../services/incidentApi';
import { usersApi } from '../../services/usersApi';
import {
  Search,
  LayoutDashboard,
  Bug,
  FolderGit2,
  Boxes,
  ShieldAlert,
  LineChart,
  Users,
  ShieldCheck,
  Bell,
  ArrowRight,
  Sparkles,
  Command,
} from 'lucide-react';

interface CommandItem {
  id: string;
  category: 'NAVIGATION' | 'ISSUES' | 'PROJECTS' | 'APPLICATIONS' | 'INCIDENTS' | 'USERS';
  title: string;
  subtitle?: string;
  path: string;
  icon: React.ReactNode;
}

export const CommandDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role || UserRole.REPORTER;

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [results, setResults] = useState<CommandItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Static Navigation items filtered by role
  const navigationItems: CommandItem[] = [
    {
      id: 'nav-dashboard',
      category: 'NAVIGATION',
      title: 'Dashboard',
      subtitle: 'Workspace operational summary',
      path: '/',
      icon: <LayoutDashboard className="w-4 h-4 text-blue-500" />,
    },
    {
      id: 'nav-issues',
      category: 'NAVIGATION',
      title: 'Issues Workspace',
      subtitle: 'Browse and triage defects',
      path: '/issues',
      icon: <Bug className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: 'nav-create-issue',
      category: 'NAVIGATION',
      title: 'Create New Issue',
      subtitle: 'Report a defect with AI assistance',
      path: '/issues/new',
      icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'nav-projects',
      category: 'NAVIGATION',
      title: 'Projects',
      subtitle: 'Active software projects and keys',
      path: '/projects',
      icon: <FolderGit2 className="w-4 h-4 text-indigo-500" />,
    },
    {
      id: 'nav-applications',
      category: 'NAVIGATION',
      title: 'Applications',
      subtitle: 'Enterprise application boundaries',
      path: '/applications',
      icon: <Boxes className="w-4 h-4 text-purple-500" />,
    },
    {
      id: 'nav-team',
      category: 'NAVIGATION',
      title: 'Team Workload',
      subtitle: 'Developer capacity and active assignments',
      path: '/team',
      icon: <Users className="w-4 h-4 text-slate-500" />,
    },
    ...(role === UserRole.ADMIN || role === UserRole.PROJECT_MANAGER
      ? [
          {
            id: 'nav-command-center',
            category: 'NAVIGATION' as const,
            title: 'Engineering Command Center',
            subtitle: 'Operational cockpit and bottlenecks',
            path: '/command-center',
            icon: <LayoutDashboard className="w-4 h-4 text-brand-600" />,
          },
        ]
      : []),
    {
      id: 'nav-analytics',
      category: 'NAVIGATION',
      title: 'Analytics & Forecasts',
      subtitle: 'Backlog, SLA, and capacity forecasting',
      path: '/analytics',
      icon: <LineChart className="w-4 h-4 text-sky-500" />,
    },
    {
      id: 'nav-incidents',
      category: 'NAVIGATION',
      title: 'Incidents Command Center',
      subtitle: 'Operational SEV triage and war room',
      path: '/incidents',
      icon: <ShieldAlert className="w-4 h-4 text-rose-500" />,
    },
    ...(role === UserRole.ADMIN
      ? [
          {
            id: 'nav-operations',
            category: 'NAVIGATION' as const,
            title: 'System Operations',
            subtitle: 'API performance, health & security logs',
            path: '/operations',
            icon: <ShieldCheck className="w-4 h-4 text-indigo-600" />,
          },
          {
            id: 'nav-users',
            category: 'NAVIGATION' as const,
            title: 'User Administration',
            subtitle: 'Manage roles and system directory',
            path: '/users',
            icon: <Users className="w-4 h-4 text-slate-600" />,
          },
        ]
      : []),
    {
      id: 'nav-notifications',
      category: 'NAVIGATION',
      title: 'Notifications',
      subtitle: 'System alerts and assignments',
      path: '/notifications',
      icon: <Bell className="w-4 h-4 text-amber-500" />,
    },
  ];

  // Search execution
  const performSearch = useCallback(
    async (term: string) => {
      const q = term.trim().toLowerCase();

      // 1. Navigation matches
      const matchedNav = navigationItems.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.subtitle?.toLowerCase().includes(q)
      );

      if (!q) {
        setResults(matchedNav);
        setSelectedIndex(0);
        return;
      }

      setLoading(true);
      try {
        // Fetch authorized entities in parallel
        const promises: Promise<any>[] = [
          issuesApi.getIssues({ search: q, limit: 5 }).catch(() => ({ data: [] })),
          projectsApi.getProjects().catch(() => []),
          applicationsApi.getApplications().catch(() => []),
          incidentApi.getIncidents({}).catch(() => []),
        ];

        if (role === UserRole.ADMIN) {
          promises.push(usersApi.getUsers().catch(() => []));
        }

        const [issuesRes, projectsRes, appsRes, incidentsRes, usersRes] =
          await Promise.all(promises);

        const issueItems: CommandItem[] = (issuesRes?.data || [])
          .slice(0, 5)
          .map((iss: any) => ({
            id: `issue-${iss.id}`,
            category: 'ISSUES',
            title: `${iss.issueKey}: ${iss.title}`,
            subtitle: `${iss.status} · ${iss.priority} · ${iss.applicationName || 'App'}`,
            path: `/issues/${iss.id}`,
            icon: <Bug className="w-4 h-4 text-brand-600" />,
          }));

        const projectItems: CommandItem[] = (projectsRes || [])
          .filter(
            (p: any) =>
              p.name.toLowerCase().includes(q) ||
              p.key.toLowerCase().includes(q)
          )
          .slice(0, 4)
          .map((p: any) => ({
            id: `proj-${p.id}`,
            category: 'PROJECTS',
            title: `${p.name} (${p.key})`,
            subtitle: p.description || 'Project Workspace',
            path: `/projects`,
            icon: <FolderGit2 className="w-4 h-4 text-indigo-600" />,
          }));

        const appItems: CommandItem[] = (appsRes || [])
          .filter(
            (a: any) =>
              a.name.toLowerCase().includes(q) ||
              a.code.toLowerCase().includes(q)
          )
          .slice(0, 3)
          .map((a: any) => ({
            id: `app-${a.id}`,
            category: 'APPLICATIONS',
            title: `${a.name} (${a.code})`,
            subtitle: `v${a.version} · ${a.description || 'Application'}`,
            path: `/applications`,
            icon: <Boxes className="w-4 h-4 text-purple-600" />,
          }));

        const incidentItems: CommandItem[] = (incidentsRes || [])
          .filter(
            (inc: any) =>
              inc.title.toLowerCase().includes(q) ||
              inc.incidentKey.toLowerCase().includes(q)
          )
          .slice(0, 4)
          .map((inc: any) => ({
            id: `inc-${inc.id}`,
            category: 'INCIDENTS',
            title: `${inc.incidentKey}: ${inc.title}`,
            subtitle: `${inc.severity} · ${inc.status}`,
            path: `/incidents/${inc.id}`,
            icon: <ShieldAlert className="w-4 h-4 text-rose-600" />,
          }));

        const userItems: CommandItem[] = (usersRes || [])
          .filter(
            (u: any) =>
              u.firstName.toLowerCase().includes(q) ||
              u.lastName.toLowerCase().includes(q) ||
              u.email.toLowerCase().includes(q)
          )
          .slice(0, 3)
          .map((u: any) => ({
            id: `usr-${u.id}`,
            category: 'USERS',
            title: `${u.firstName} ${u.lastName}`,
            subtitle: `${u.email} · ${u.role}`,
            path: `/users`,
            icon: <Users className="w-4 h-4 text-slate-600" />,
          }));

        const combined = [
          ...matchedNav,
          ...issueItems,
          ...projectItems,
          ...incidentItems,
          ...appItems,
          ...userItems,
        ];

        setResults(combined);
        setSelectedIndex(0);
      } finally {
        setLoading(false);
      }
    },
    [role, navigationItems]
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults(navigationItems);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (isOpen) {
        performSearch(query);
      }
    }, 150);
    return () => clearTimeout(handler);
  }, [query, isOpen, performSearch]);

  const handleSelect = (item: CommandItem) => {
    onClose();
    navigate(item.path);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(results.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + results.length) % Math.max(results.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selectedIndex]) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  // Group items by category
  const categories: CommandItem['category'][] = [
    'NAVIGATION',
    'ISSUES',
    'PROJECTS',
    'INCIDENTS',
    'APPLICATIONS',
    'USERS',
  ];

  let flatCounter = -1;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command search"
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200 gap-3 bg-white">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, issue key (e.g. PORT-122), project, or incident..."
            className="w-full text-xs text-slate-900 placeholder:text-slate-400 outline-none bg-transparent"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-100">
          {loading && results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">Searching workspace...</div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching issues, projects, or commands found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            categories.map((cat) => {
              const catItems = results.filter((item) => item.category === cat);
              if (catItems.length === 0) return null;

              return (
                <div key={cat} className="py-1.5 first:pt-0 last:pb-0">
                  <div className="px-3 py-1 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    {cat}
                  </div>
                  {catItems.map((item) => {
                    flatCounter++;
                    const isSelected = flatCounter === selectedIndex;
                    const thisIndex = flatCounter;

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(thisIndex)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer text-xs transition-colors ${
                          isSelected
                            ? 'bg-brand-50 text-brand-900 font-medium'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="shrink-0">{item.icon}</div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate text-xs">
                              {item.title}
                            </p>
                            {item.subtitle && (
                              <p className="text-[11px] text-slate-500 truncate">
                                {item.subtitle}
                              </p>
                            )}
                          </div>
                        </div>
                        <ArrowRight
                          className={`w-3.5 h-3.5 text-slate-400 transition-opacity ${
                            isSelected ? 'opacity-100' : 'opacity-0'
                          }`}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Bar */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">
                ↑
              </kbd>{' '}
              <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">
                ↓
              </kbd>{' '}
              navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-white border border-slate-200 rounded font-mono text-[10px]">
                ↵
              </kbd>{' '}
              select
            </span>
          </div>
          <span className="flex items-center gap-1">
            <Command className="w-3 h-3 text-slate-400" /> AITS Command
          </span>
        </div>
      </div>
    </div>
  );
};
