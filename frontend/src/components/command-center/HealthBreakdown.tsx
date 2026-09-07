import React from 'react';
import { ProjectHealthScore } from '@app-issue-track/shared';

interface HealthBreakdownProps {
  breakdown: ProjectHealthScore['breakdown'];
}

export const HealthBreakdown: React.FC<HealthBreakdownProps> = ({ breakdown }) => {
  const items = [
    { label: 'SLA Performance (25%)', score: breakdown.slaPerformance },
    { label: 'Resolution Velocity (20%)', score: breakdown.resolutionVelocity },
    { label: 'Critical Backlog (20%)', score: breakdown.criticalBacklog },
    { label: 'Developer Capacity (15%)', score: breakdown.developerCapacity },
    { label: 'Report Quality (10%)', score: breakdown.issueQuality },
    { label: 'Issue Aging (10%)', score: breakdown.issueAging },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
        Health Factor Breakdown
      </h3>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex justify-between text-xs font-medium">
              <span className="text-slate-700">{item.label}</span>
              <span className="font-mono font-bold text-slate-900">{item.score}/100</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  item.score >= 85 ? 'bg-emerald-500' : item.score >= 70 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
