import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedLayout } from './components/layout/ProtectedLayout';
import { UserRole } from '@app-issue-track/shared';

// Page Views
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { EngineeringCommandCenterPage } from './pages/EngineeringCommandCenterPage';
import { EngineeringAnalyticsPage } from './pages/EngineeringAnalyticsPage';
import { IncidentCommandCenterPage } from './pages/IncidentCommandCenterPage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { IssuesPage } from './pages/IssuesPage';
import { CreateIssuePage } from './pages/CreateIssuePage';
import { IssueDetailPage } from './pages/IssueDetailPage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { UsersPage } from './pages/UsersPage';
import { TeamPage } from './pages/TeamPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import OperationsPage from './pages/OperationsPage';

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
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
