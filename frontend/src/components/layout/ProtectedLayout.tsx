import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@app-issue-track/shared';
import { SkeletonLoader } from '../common/SkeletonLoader';

export interface ProtectedLayoutProps {
  allowedRoles?: UserRole[];
}

export const ProtectedLayout: React.FC<ProtectedLayoutProps> = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center p-8 bg-slate-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-sm border border-slate-200">
          <SkeletonLoader rows={4} />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
