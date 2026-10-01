import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedLayout } from './components/layout/ProtectedLayout';
import { UserRole } from '@app-issue-track/shared';

// Lazy-Loaded Page Views for optimal performance and code-splitting
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(m => ({ default: m.RegisterPage })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const EngineeringCommandCenterPage = lazy(() => import('./pages/EngineeringCommandCenterPage').then(m => ({ default: m.EngineeringCommandCenterPage })));
const EngineeringAnalyticsPage = lazy(() => import('./pages/EngineeringAnalyticsPage').then(m => ({ default: m.EngineeringAnalyticsPage })));
const IncidentCommandCenterPage = lazy(() => import('./pages/IncidentCommandCenterPage').then(m => ({ default: m.IncidentCommandCenterPage })));
const IncidentDetailPage = lazy(() => import('./pages/IncidentDetailPage').then(m => ({ default: m.IncidentDetailPage })));
const IssuesPage = lazy(() => import('./pages/IssuesPage').then(m => ({ default: m.IssuesPage })));
const CreateIssuePage = lazy(() => import('./pages/CreateIssuePage').then(m => ({ default: m.CreateIssuePage })));
const IssueDetailPage = lazy(() => import('./pages/IssueDetailPage').then(m => ({ default: m.IssueDetailPage })));
const ApplicationsPage = lazy(() => import('./pages/ApplicationsPage').then(m => ({ default: m.ApplicationsPage })));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const UsersPage = lazy(() => import('./pages/UsersPage').then(m => ({ default: m.UsersPage })));
const TeamPage = lazy(() => import('./pages/TeamPage').then(m => ({ default: m.TeamPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then(m => ({ default: m.ProfilePage })));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const OperationsPage = lazy(() => import('./pages/OperationsPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <Suspense
              fallback={
                <div className="flex h-screen w-full items-center justify-center bg-slate-900">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                    <span className="font-mono text-xs text-slate-400">Loading AITS Engine...</span>
                  </div>
                </div>
              }
            >
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected App Routes */}
                <Route element={<ProtectedLayout />}>
                  <Route element={<AppLayout />}>
                    <Route path="/" element={<DashboardPage />} />
                    <Route path="/command-center" element={<EngineeringCommandCenterPage />} />
                    <Route path="/analytics" element={<EngineeringAnalyticsPage />} />
                    <Route path="/incidents" element={<IncidentCommandCenterPage />} />
                    <Route path="/incidents/:id" element={<IncidentDetailPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/issues" element={<IssuesPage />} />
                    <Route path="/issues/new" element={<CreateIssuePage />} />
                    <Route path="/issues/:id" element={<IssueDetailPage />} />
                    <Route path="/applications" element={<ApplicationsPage />} />
                    <Route path="/projects" element={<ProjectsPage />} />
                    <Route path="/team" element={<TeamPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />

                    {/* Admin Only Routes */}
                    <Route element={<ProtectedLayout allowedRoles={[UserRole.ADMIN]} />}>
                      <Route path="/users" element={<UsersPage />} />
                      <Route path="/operations" element={<OperationsPage />} />
                    </Route>

                    <Route path="/404" element={<NotFoundPage />} />
                    <Route path="*" element={<Navigate to="/404" replace />} />
                  </Route>
                </Route>
              </Routes>
            </Suspense>
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
