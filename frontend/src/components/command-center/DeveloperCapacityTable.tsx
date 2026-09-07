import React from 'react';
import { DeveloperCapacitySummary } from '@app-issue-track/shared';
import { Users } from 'lucide-react';

interface DeveloperCapacityTableProps {
  developers: DeveloperCapacitySummary[];
}

export const DeveloperCapacityTable: React.FC<DeveloperCapacityTableProps> = ({ developers }) => {
  const getBadgeColor = (level: DeveloperCapacitySummary['capacityLevel']) => {
    switch (level) {
      case 'OVERLOADED':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'BUSY':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'NORMAL':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Developer Capacity & Workload</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">{developers.length} Developers</span>
      </div>

      {developers.length === 0 ? (
        <p className="text-xs text-slate-500 italic text-center py-4">No developer capacity metrics available for this project.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Developer</th>
                <th className="py-2.5 px-3">Capacity Level</th>
                <th className="py-2.5 px-3 text-center">Active</th>
                <th className="py-2.5 px-3 text-center">In Progress</th>
                <th className="py-2.5 px-3 text-center">Critical/High</th>
                <th className="py-2.5 px-3 text-center">Overdue</th>
                <th className="py-2.5 px-3 text-center">SLA Breaches</th>
                <th className="py-2.5 px-3">Why? / Breakdown</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {developers.map((dev) => (
                <tr key={dev.developerId} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{dev.developerName}</td>
                  <td className="py-2.5 px-3">
                    <span className={`border font-mono text-[10px] font-bold px-2 py-0.5 rounded ${getBadgeColor(dev.capacityLevel)}`}>
                      {dev.capacityLevel}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold">{dev.activeIssues}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{dev.inProgressIssues}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-rose-700 font-bold">{dev.criticalHighIssues}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{dev.overdueIssues}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-rose-700">{dev.slaBreaches}</td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-600 max-w-xs truncate">
                    {dev.reasons.join('; ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
