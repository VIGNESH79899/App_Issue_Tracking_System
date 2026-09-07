import React from 'react';
import { LifecycleDuration } from '@app-issue-track/shared';
import { GitCommit, CheckCircle2, PlayCircle, AlertCircle } from 'lucide-react';

interface LifecycleDurationPanelProps {
  durations: LifecycleDuration[];
}

export const LifecycleDurationPanel: React.FC<LifecycleDurationPanelProps> = ({ durations }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center space-x-2 pb-3 mb-3 border-b border-slate-100">
        <GitCommit className="w-4 h-4 text-emerald-600" />
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Status Lifecycle Duration</h3>
      </div>

      <div className="space-y-2">
        {durations.map((item, idx) => (
          <div
            key={`${item.status}-${idx}`}
            className={`flex items-center justify-between px-3 py-2 rounded-md text-xs border ${
              item.isCurrent
                ? 'bg-brand-50 border-brand-200 text-brand-900 font-medium'
                : 'bg-slate-50 border-slate-150 text-slate-700'
            }`}
          >
            <div className="flex items-center space-x-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  item.isCurrent ? 'bg-brand-600 animate-pulse' : 'bg-slate-400'
                }`}
              />
              <span className="font-semibold uppercase text-[11px] tracking-wide">{item.status}</span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs">{item.durationFormatted}</span>
              {item.isCurrent && (
                <span className="bg-brand-600 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold uppercase">
                  Active
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
