import React from 'react';
import { TrendingUp } from 'lucide-react';

export const AnalyticsEmptyState: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto my-12 bg-amber-50 border border-amber-200 rounded-xl p-8 text-center space-y-4 shadow-sm">
      <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
        <TrendingUp className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-amber-900">No Accessible Projects for Forecasting</h2>
        <p className="text-xs text-amber-800 max-w-lg mx-auto leading-relaxed">
          You currently have no project memberships or assigned projects to view predictive engineering analytics. Ask an administrator or project manager to add you to a project.
        </p>
      </div>
    </div>
  );
};
