import React from 'react';
import { BacklogForecast } from '@app-issue-track/shared';
import { ForecastConfidenceBadge } from './ForecastConfidenceBadge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BacklogForecastCardProps {
  forecast: BacklogForecast;
}

export const BacklogForecastCard: React.FC<BacklogForecastCardProps> = ({ forecast }) => {
  const { currentBacklog, forecast7Days, forecast14Days, forecast30Days, direction, confidence, explanation } = forecast;

  let TrendIcon = Minus;
  let trendColor = 'text-slate-600';

  if (direction === 'DETERIORATING') {
    TrendIcon = TrendingUp;
    trendColor = 'text-rose-600';
  } else if (direction === 'IMPROVING') {
    TrendIcon = TrendingDown;
    trendColor = 'text-emerald-600';
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Backlog Growth Forecast</h3>
        </div>
        <ForecastConfidenceBadge confidence={confidence} />
      </div>

      <div className="grid grid-cols-4 gap-2 text-center border-b border-slate-100 pb-3">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Current</span>
          <span className="text-lg font-mono font-extrabold text-slate-900">{currentBacklog}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase block">7-Day</span>
          <span className="text-lg font-mono font-bold text-slate-800">{forecast7Days}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase block">14-Day</span>
          <span className="text-lg font-mono font-bold text-brand-700">{forecast14Days}</span>
        </div>
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase block">30-Day</span>
          <span className="text-lg font-mono font-bold text-slate-800">{forecast30Days}</span>
        </div>
      </div>

      <div className="bg-slate-50 p-2.5 rounded border border-slate-200/80 text-xs space-y-1">
        <span className="font-bold text-slate-700 block">Forecast Drivers:</span>
        <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
          {explanation.map((e, idx) => (
            <li key={idx}>{e}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
