import React from 'react';
import { SlaForecast } from '@app-issue-track/shared';
import { ForecastConfidenceBadge } from './ForecastConfidenceBadge';
import { Clock } from 'lucide-react';

interface SlaForecastCardProps {
  forecast: SlaForecast;
}

export const SlaForecastCard: React.FC<SlaForecastCardProps> = ({ forecast }) => {
  const { currentCompliancePercentage, forecast7Days, forecast14Days, forecast30Days, confidence, explanation } = forecast;

  const isInsufficient = confidence === 'INSUFFICIENT_DATA';

  if (isInsufficient) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-subtle">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">SLA Performance Forecast</h3>
          </div>
          <ForecastConfidenceBadge confidence={confidence} />
        </div>
        <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-xs space-y-1.5">
          <span className="font-bold text-amber-900 block">Insufficient SLA Resolution History</span>
          <p className="text-amber-800 text-[11px] leading-relaxed">
            SLA compliance forecasting requires completed issue turnaround samples. Current measured SLA compliance is{' '}
            <strong className="font-mono text-slate-900">{currentCompliancePercentage}%</strong>.
          </p>
        </div>
        <div className="text-[11px] text-slate-500 font-mono">
          Known facts: Current SLA = {currentCompliancePercentage}% | Resolved sample size &lt; threshold
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">SLA Performance Forecast</h3>
        </div>
        <ForecastConfidenceBadge confidence={confidence} />
      </div>

      <div className="grid grid-cols-4 gap-2 text-center border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Current</span>
          <span className="text-lg font-mono font-extrabold text-emerald-700">{currentCompliancePercentage}%</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase block">7-Day</span>
          <span className="text-lg font-mono font-bold text-slate-800">{forecast7Days}%</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase block">14-Day</span>
          <span className="text-lg font-mono font-bold text-brand-700">{forecast14Days}%</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase block">30-Day</span>
          <span className="text-lg font-mono font-bold text-slate-800">{forecast30Days}%</span>
        </div>
      </div>

      <div className="bg-slate-50 p-2.5 rounded border border-slate-200/80 text-xs space-y-1">
        <span className="font-bold text-slate-700 block">SLA Drivers:</span>
        <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
          {explanation.map((e, idx) => (
            <li key={idx}>{e}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
