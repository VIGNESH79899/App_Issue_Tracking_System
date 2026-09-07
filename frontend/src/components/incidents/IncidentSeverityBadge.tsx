import React from 'react';
import { IncidentSeverity } from '@app-issue-track/shared';

interface IncidentSeverityBadgeProps {
  severity: IncidentSeverity;
}

export const IncidentSeverityBadge: React.FC<IncidentSeverityBadgeProps> = ({ severity }) => {
  let color = 'bg-slate-100 text-slate-800 border-slate-200';

  switch (severity) {
    case IncidentSeverity.SEV1:
      color = 'bg-rose-600 text-white border-rose-700 font-extrabold shadow-sm';
      break;
    case IncidentSeverity.SEV2:
      color = 'bg-rose-100 text-rose-900 border-rose-300 font-bold';
      break;
    case IncidentSeverity.SEV3:
      color = 'bg-amber-100 text-amber-900 border-amber-300 font-semibold';
      break;
    case IncidentSeverity.SEV4:
      color = 'bg-slate-100 text-slate-700 border-slate-300 font-medium';
      break;
  }

  return (
    <span className={`border font-mono text-[10px] px-2 py-0.5 rounded ${color}`}>
      {severity}
    </span>
  );
};
