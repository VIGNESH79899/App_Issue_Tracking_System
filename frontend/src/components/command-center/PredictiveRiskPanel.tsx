import React from 'react';
import { PredictiveSlaRisk } from '@app-issue-track/shared';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

interface PredictiveRiskPanelProps {
  risk: PredictiveSlaRisk;
}

export const PredictiveRiskPanel: React.FC<PredictiveRiskPanelProps> = ({ risk }) => {
  const { issueKey, title, riskLevel, estimatedRiskScore, timeRemainingHours, factors, recommendedAction } = risk;

  let badgeColor = 'bg-slate-100 text-slate-800 border-slate-200';
  if (riskLevel === 'LIKELY_TO_BREACH') {
    badgeColor = 'bg-rose-100 text-rose-900 border-rose-300';
  } else if (riskLevel === 'HIGH') {
    badgeColor = 'bg-amber-100 text-amber-900 border-amber-300';
  } else if (riskLevel === 'MEDIUM') {
    badgeColor = 'bg-blue-100 text-blue-900 border-blue-300';
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 shadow-subtle">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-brand-600" />
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Estimated SLA Risk</span>
        </div>
        <span className={`border font-mono text-[10px] font-bold px-2 py-0.5 rounded ${badgeColor}`}>
          {riskLevel} ({estimatedRiskScore} Risk Score)
        </span>
      </div>

      <div className="text-xs space-y-1">
        <div className="font-bold text-slate-900">
          [{issueKey}] {title}
        </div>
        <div className="text-slate-500 font-mono">
          Time Remaining: {timeRemainingHours !== null ? `${timeRemainingHours} hrs` : 'N/A'}
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-2.5 space-y-1.5 text-xs">
        <div className="font-bold text-slate-700">Contributing Risk Factors:</div>
        <ul className="list-disc pl-4 space-y-0.5 text-slate-600 text-[11px]">
          {factors.map((f, idx) => (
            <li key={idx}>{f}</li>
          ))}
        </ul>
        <div className="pt-1 text-[11px] text-brand-700 font-semibold border-t border-slate-200">
          💡 Recommended Action: {recommendedAction}
        </div>
      </div>
    </div>
  );
};
