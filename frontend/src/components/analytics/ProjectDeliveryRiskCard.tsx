import React from 'react';
import { ProjectDeliveryRisk } from '@app-issue-track/shared';
import { ForecastConfidenceBadge } from './ForecastConfidenceBadge';
import { ShieldAlert, HelpCircle } from 'lucide-react';

interface ProjectDeliveryRiskCardProps {
  risk: ProjectDeliveryRisk;
}

export const ProjectDeliveryRiskCard: React.FC<ProjectDeliveryRiskCardProps> = ({ risk }) => {
  const { score, level, reasons, confidence } = risk;

  let levelStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (level === 'CRITICAL') levelStyle = 'bg-rose-50 text-rose-900 border-rose-300';
  else if (level === 'HIGH') levelStyle = 'bg-amber-50 text-amber-900 border-amber-300';
  else if (level === 'MEDIUM') levelStyle = 'bg-blue-50 text-blue-900 border-blue-200';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Project Delivery Risk Engine</h3>
        </div>
        <ForecastConfidenceBadge confidence={confidence} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Risk Level</span>
          <span className={`text-sm font-extrabold px-2.5 py-1 rounded border font-mono ${levelStyle}`}>
            {level} ({score}/100)
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Current Health Score</span>
          <span className="text-lg font-mono font-bold text-slate-900">{risk.currentHealthScore}/100</span>
        </div>
      </div>

      {/* Contributing Risk Factors */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 space-y-1.5 text-xs">
        <div className="flex items-center space-x-1.5 font-bold text-slate-700">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>Operational Risk Factors:</span>
        </div>
        <ul className="space-y-1 text-slate-600 pl-1">
          {reasons.map((r, idx) => (
            <li key={idx} className="flex items-start space-x-1.5">
              <span className="text-slate-400">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
