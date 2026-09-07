import React from 'react';
import { IncidentForecast } from '@app-issue-track/shared';
import { ForecastConfidenceBadge } from './ForecastConfidenceBadge';
import { ShieldAlert } from 'lucide-react';

interface IncidentForecastCardProps {
  forecast: IncidentForecast;
}

export const IncidentForecastCard: React.FC<IncidentForecastCardProps> = ({ forecast }) => {
  const { currentIncidentCount, incidentsLast7Days, incidentsLast30Days, projectedIncidents14Days, recurrenceRisk, confidence, explanation } = forecast;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Incident Frequency & Recurrence Forecast</h3>
        </div>
        <ForecastConfidenceBadge confidence={confidence} />
      </div>

      <div className="grid grid-cols-4 gap-2 text-center border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Active</span>
          <span className="text-lg font-mono font-extrabold text-rose-700">{currentIncidentCount}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Last 7D</span>
          <span className="text-lg font-mono font-bold text-slate-800">{incidentsLast7Days}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Last 30D</span>
          <span className="text-lg font-mono font-bold text-slate-800">{incidentsLast30Days}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Proj 14D</span>
          <span className="text-lg font-mono font-bold text-brand-700">{projectedIncidents14Days}</span>
        </div>
      </div>

      <div className="bg-slate-50 p-2.5 rounded border border-slate-200/80 text-xs space-y-1">
        <div className="flex justify-between items-center pb-1 border-b border-slate-200">
          <span className="font-bold text-slate-700">Recurrence Risk:</span>
          <span className="font-mono font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-900 border">
            {recurrenceRisk}
          </span>
        </div>
        <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px] pt-1">
          {explanation.map((e, idx) => (
            <li key={idx}>{e}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
