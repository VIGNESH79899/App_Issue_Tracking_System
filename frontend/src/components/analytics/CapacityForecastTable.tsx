import React from 'react';
import { DeveloperCapacityForecast } from '@app-issue-track/shared';
import { Users } from 'lucide-react';

interface CapacityForecastTableProps {
  forecasts: DeveloperCapacityForecast[];
}

export const CapacityForecastTable: React.FC<CapacityForecastTableProps> = ({ forecasts }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <Users className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Developer Workload & Overload Forecast</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">{forecasts.length} Developers</span>
      </div>

      {forecasts.length === 0 ? (
        <p className="text-xs text-slate-500 italic text-center py-4">No developer capacity metrics available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Developer</th>
                <th className="py-2.5 px-3">Current Capacity</th>
                <th className="py-2.5 px-3 text-center">Active</th>
                <th className="py-2.5 px-3 text-center">Proj 7D</th>
                <th className="py-2.5 px-3 text-center">Proj 14D</th>
                <th className="py-2.5 px-3 text-center">Projected Capacity</th>
                <th className="py-2.5 px-3 text-center">Days to Overload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {forecasts.map((dev) => (
                <tr key={dev.developerId} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{dev.developerName}</td>
                  <td className="py-2.5 px-3">
                    <span className="border font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {dev.currentCapacity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold">{dev.activeIssues}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{dev.projectedIssues7Days}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-brand-700">{dev.projectedIssues14Days}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`border font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        dev.projectedCapacity === 'OVERLOADED'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : dev.projectedCapacity === 'BUSY'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {dev.projectedCapacity}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold">
                    {dev.estimatedDaysToOverload !== null
                      ? dev.estimatedDaysToOverload === 0
                        ? 'OVERLOADED NOW'
                        : `${dev.estimatedDaysToOverload} days`
                      : 'N/A'}
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
