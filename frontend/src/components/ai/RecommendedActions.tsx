import React from 'react';
import { AIRecommendedAction } from '@app-issue-track/shared';
import { Wrench } from 'lucide-react';

interface RecommendedActionsProps {
  actions: AIRecommendedAction[];
}

export const RecommendedActions: React.FC<RecommendedActionsProps> = ({ actions }) => {
  if (actions.length === 0) return null;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-1.5">
        <Wrench className="w-4 h-4 text-brand-600" />
        <span>Recommended Engineering Actions</span>
      </div>

      <div className="space-y-2">
        {actions.map((act, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3 space-y-1">
            <div className="flex items-center space-x-2">
              <span className={`border font-mono text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${getPriorityBadge(act.priority)}`}>
                {act.priority}
              </span>
              <span className="text-xs font-bold text-slate-900">{act.action}</span>
            </div>
            <p className="text-[11px] text-slate-600 pl-1">{act.reason}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
