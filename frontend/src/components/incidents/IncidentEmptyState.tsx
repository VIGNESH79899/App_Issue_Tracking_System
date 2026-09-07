import React from 'react';
import { ShieldCheck } from 'lucide-react';

export const IncidentEmptyState: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto my-12 bg-emerald-50/50 border border-emerald-200 rounded-xl p-8 text-center space-y-4 shadow-sm">
      <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
        <ShieldCheck className="w-8 h-8" />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-bold text-emerald-900">Zero Active Incidents</h2>
        <p className="text-xs text-emerald-800 max-w-lg mx-auto leading-relaxed">
          All projects are operating normally within SLA parameters. No active SEV1-SEV4 incidents logged.
        </p>
      </div>
    </div>
  );
};
