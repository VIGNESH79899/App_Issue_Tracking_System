import React from 'react';
import { AIRiskAssessment as AIRiskType } from '@app-issue-track/shared';
import { ShieldAlert } from 'lucide-react';

interface AIRiskAssessmentProps {
  risk: AIRiskType;
}

export const AIRiskAssessment: React.FC<AIRiskAssessmentProps> = ({ risk }) => {
  if (!risk) return null;

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <ShieldAlert className="w-4 h-4 text-brand-600" />
          <span>Engineering Risk Assessment</span>
        </div>
        <span className={`border font-mono text-[10px] font-bold px-2 py-0.5 rounded uppercase ${getRiskBadge(risk.level)}`}>
          {risk.level} RISK
        </span>
      </div>

      {risk.reasons && risk.reasons.length > 0 && (
        <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 pt-1">
          {risk.reasons.map((r, idx) => (
            <li key={idx}>{r}</li>
          ))}
        </ul>
      )}
    </div>
  );
};
