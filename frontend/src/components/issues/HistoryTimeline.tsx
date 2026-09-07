import React from 'react';
import { IssueHistoryDTO } from '@app-issue-track/shared';
import { Clock, User, ArrowRight } from 'lucide-react';

export interface HistoryTimelineProps {
  history: IssueHistoryDTO[];
}

export const HistoryTimeline: React.FC<HistoryTimelineProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-md">
        No history audit logs available for this issue.
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {history.map((item) => (
        <div key={item.id} className="relative flex items-start space-x-3 text-xs">
          <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-white border-2 border-brand-600 flex items-center justify-center text-brand-600 shadow-subtle">
            <Clock className="w-3 h-3" />
          </div>

          <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200 shadow-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 font-semibold text-slate-900">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {item.changedBy ? `${item.changedBy.firstName} ${item.changedBy.lastName}` : 'System'}
                </span>
                <span className="text-slate-500 font-normal">• {item.actionType}</span>
              </div>
              <span className="text-[10px] text-slate-400">
                {new Date(item.createdAt).toLocaleString()}
              </span>
            </div>

            {item.fieldChanged && (
              <div className="mt-2 text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 flex items-center space-x-2 font-mono text-[11px]">
                <span className="font-semibold text-slate-500">{item.fieldChanged}:</span>
                <span className="line-through text-slate-400">{item.oldValue || '(none)'}</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
                <span className="font-bold text-slate-900">{item.newValue || '(none)'}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
