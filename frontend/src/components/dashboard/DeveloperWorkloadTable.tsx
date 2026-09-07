import React from 'react';
import { DeveloperWorkloadMetric } from '../../services/dashboardApi';

export const DeveloperWorkloadTable: React.FC<{ workload: DeveloperWorkloadMetric[] }> = ({ workload }) => {
  if (workload.length === 0) {
    return <div className="p-6 text-center text-xs text-slate-500">No developer workload metrics found</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
            <th className="py-2.5 px-4">Developer</th>
            <th className="py-2.5 px-4">Assigned</th>
            <th className="py-2.5 px-4">In Progress</th>
            <th className="py-2.5 px-4 text-right">Total Active</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {workload.map((dev) => (
            <tr key={dev.id} className="hover:bg-slate-50">
              <td className="py-2.5 px-4">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                    {dev.name[0]}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 block">{dev.name}</span>
                    <span className="text-[10px] text-slate-400 block">{dev.email}</span>
                  </div>
                </div>
              </td>
              <td className="py-2.5 px-4 font-mono font-medium text-slate-700">{dev.assignedCount ?? '-'}</td>
              <td className="py-2.5 px-4 font-mono font-medium text-amber-600">{dev.inProgressCount ?? '-'}</td>
              <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">{dev.activeIssuesCount ?? dev.totalCount ?? 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
