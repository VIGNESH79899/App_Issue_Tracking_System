import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, LayoutDashboard, User } from 'lucide-react';
import { Button } from './Button';

export const AccessLockedCard: React.FC<{ featureName?: string }> = ({ featureName = 'this section' }) => {
  return (
    <div className="max-w-xl mx-auto my-12 bg-amber-50 border border-amber-200 rounded-xl p-8 text-center space-y-5 shadow-sm">
      <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto border border-amber-300">
        <Lock className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h2 className="text-lg font-bold text-amber-900">Access Locked — Pending Project Assignment</h2>
        <p className="text-xs text-amber-800 leading-relaxed max-w-md mx-auto">
          You currently have no assigned projects. Access to <span className="font-semibold text-amber-950">{featureName}</span> remains locked until an Administrator or Project Lead assigns your account to a project.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <Link to="/">
          <Button variant="outline" size="sm" leftIcon={<LayoutDashboard className="w-4 h-4" />}>
            Go to Dashboard
          </Button>
        </Link>
        <Link to="/profile">
          <Button variant="primary" size="sm" leftIcon={<User className="w-4 h-4" />}>
            View My Profile
          </Button>
        </Link>
      </div>
    </div>
  );
};
