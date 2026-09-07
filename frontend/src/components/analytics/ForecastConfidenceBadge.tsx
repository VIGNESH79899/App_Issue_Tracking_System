import React from 'react';
import { ForecastConfidence } from '@app-issue-track/shared';

interface ForecastConfidenceBadgeProps {
  confidence: ForecastConfidence;
}

export const ForecastConfidenceBadge: React.FC<ForecastConfidenceBadgeProps> = ({ confidence }) => {
  let color = 'bg-slate-100 text-slate-800 border-slate-200';

  switch (confidence) {
    case ForecastConfidence.HIGH:
      color = 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold';
      break;
    case ForecastConfidence.MEDIUM:
      color = 'bg-blue-50 text-blue-800 border-blue-200 font-medium';
      break;
    case ForecastConfidence.LOW:
      color = 'bg-amber-50 text-amber-800 border-amber-200 font-medium';
      break;
    case ForecastConfidence.INSUFFICIENT_DATA:
      color = 'bg-slate-100 text-slate-600 border-slate-300 italic';
      break;
  }

  return (
    <span className={`border font-mono text-[10px] uppercase px-2 py-0.5 rounded tracking-wide ${color}`}>
      {confidence.replace('_', ' ')}
    </span>
  );
};
