import React from 'react';
import { Clock, Hourglass, Activity, UserCheck } from 'lucide-react';

interface IssueAgeCardProps {
  issueAge: { formatted: string; hours: number };
  timeSinceUpdate: { formatted: string; hours: number };
  currentStatusDuration: { formatted: string; hours: number };
  assignmentAge: { formatted: string; hours: number } | null;
}

export const IssueAgeCard: React.FC<IssueAgeCardProps> = ({
  issueAge,
  timeSinceUpdate,
  currentStatusDuration,
  assignmentAge,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-slate-100">
        <Clock className="w-4 h-4 text-brand-600" />
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Issue Aging Metrics</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-50 border border-slate-150 rounded-md p-2.5">
          <span className="text-[11px] font-medium text-slate-500 block">Total Issue Age</span>
          <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{issueAge.formatted}</span>
        </div>

        <div className="bg-slate-50 border border-slate-150 rounded-md p-2.5">
          <span className="text-[11px] font-medium text-slate-500 block">Time in Status</span>
          <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{currentStatusDuration.formatted}</span>
        </div>

        <div className="bg-slate-50 border border-slate-150 rounded-md p-2.5">
          <span className="text-[11px] font-medium text-slate-500 block">Time Since Update</span>
          <span className="text-sm font-semibold text-slate-900 mt-0.5 block">{timeSinceUpdate.formatted}</span>
        </div>

        <div className="bg-slate-50 border border-slate-150 rounded-md p-2.5">
          <span className="text-[11px] font-medium text-slate-500 block">Assignment Duration</span>
          <span className="text-sm font-semibold text-slate-900 mt-0.5 block">
            {assignmentAge ? assignmentAge.formatted : 'Unassigned'}
          </span>
        </div>
      </div>
    </div>
  );
};
