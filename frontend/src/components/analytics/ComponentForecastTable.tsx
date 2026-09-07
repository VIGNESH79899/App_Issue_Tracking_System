import React from 'react';
import { ComponentForecast } from '@app-issue-track/shared';
import { Layers } from 'lucide-react';

interface ComponentForecastTableProps {
  forecasts: ComponentForecast[];
}

export const ComponentForecastTable: React.FC<ComponentForecastTableProps> = ({ forecasts }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Component Risk & Incident Trajectory</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">{forecasts.length} Components</span>
      </div>

      {forecasts.length === 0 ? (
        <p className="text-xs text-slate-500 italic text-center py-4">No component risk forecast data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Module Component</th>
                <th className="py-2.5 px-3">Current Risk</th>
                <th className="py-2.5 px-3 text-center">Active</th>
                <th className="py-2.5 px-3 text-center">Growth %</th>
                <th className="py-2.5 px-3 text-center">Proj Active</th>
                <th className="py-2.5 px-3 text-center">Projected Risk</th>
                <th className="py-2.5 px-3 text-center">Incident Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {forecasts.map((comp, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-mono font-bold text-brand-700">{comp.component}</td>
                  <td className="py-2.5 px-3">
                    <span className="border font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-800">
                      {comp.currentRisk}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold">{comp.currentActiveIssues}</td>
                  <td className="py-2.5 px-3 text-center font-mono">+{comp.growthPercentage}%</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-brand-700">{comp.projectedActiveIssues}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`border font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                        comp.projectedRisk === 'CRITICAL'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : comp.projectedRisk === 'HIGH'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}
                    >
                      {comp.projectedRisk}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-semibold text-slate-700">{comp.incidentTrend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
