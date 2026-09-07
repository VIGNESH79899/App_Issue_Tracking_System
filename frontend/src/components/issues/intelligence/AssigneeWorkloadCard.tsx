import React from 'react';
import { AssigneeWorkloadSummary } from '@app-issue-track/shared';
import { UserCheck, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface AssigneeWorkloadCardProps {
  workload: AssigneeWorkloadSummary | null;
}

export const AssigneeWorkloadCard: React.FC<AssigneeWorkloadCardProps> = ({ workload }) => {
  if (!workload) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center space-x-2 pb-3 mb-2 border-b border-slate-100">
          <UserCheck className="w-4 h-4 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Assignee Workload</h3>
        </div>
        <p className="text-xs text-slate-400 font-medium py-2 text-center">Unassigned issue</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <UserCheck className="w-4 h-4 text-sky-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Assignee Workload</h3>
        </div>
        <span className="text-xs font-semibold text-slate-900 truncate max-w-[130px]">
          {workload.assigneeName}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-slate-50 border border-slate-150 rounded p-2 text-center">
          <span className="text-[10px] text-slate-500 font-medium block">Total Assigned</span>
          <span className="text-sm font-bold text-slate-900">{workload.totalAssigned}</span>
        </div>

        <div className="bg-slate-50 border border-slate-150 rounded p-2 text-center">
          <span className="text-[10px] text-slate-500 font-medium block">In Progress</span>
          <span className="text-sm font-bold text-brand-600">{workload.inProgressAssigned}</span>
        </div>

        <div className="bg-slate-50 border border-slate-150 rounded p-2 text-center">
          <span className="text-[10px] text-slate-500 font-medium block">Critical / High</span>
          <span className="text-sm font-bold text-amber-600">{workload.criticalHighAssigned}</span>
        </div>

        <div className="bg-slate-50 border border-slate-150 rounded p-2 text-center">
          <span className="text-[10px] text-slate-500 font-medium block">Avg Resolution</span>
          <span className="text-sm font-bold text-slate-900">
            {workload.averageResolutionHours !== null ? `${workload.averageResolutionHours}h` : 'N/A'}
          </span>
        </div>
      </div>
    </div>
  );
};
