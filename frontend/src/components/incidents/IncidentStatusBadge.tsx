import React from 'react';
import { IncidentStatus } from '@app-issue-track/shared';

interface IncidentStatusBadgeProps {
  status: IncidentStatus;
}

export const IncidentStatusBadge: React.FC<IncidentStatusBadgeProps> = ({ status }) => {
  let color = 'bg-slate-100 text-slate-800 border-slate-200';

  switch (status) {
    case IncidentStatus.DETECTED:
      color = 'bg-rose-100 text-rose-900 border-rose-300 animate-pulse';
      break;
    case IncidentStatus.ACKNOWLEDGED:
      color = 'bg-amber-100 text-amber-900 border-amber-300';
      break;
    case IncidentStatus.INVESTIGATING:
      color = 'bg-blue-100 text-blue-900 border-blue-300';
      break;
    case IncidentStatus.MITIGATING:
      color = 'bg-purple-100 text-purple-900 border-purple-300';
      break;
    case IncidentStatus.RESOLVED:
      color = 'bg-emerald-100 text-emerald-900 border-emerald-300';
      break;
    case IncidentStatus.CLOSED:
      color = 'bg-slate-100 text-slate-700 border-slate-300';
      break;
  }

  return (
    <span className={`border font-mono text-[10px] font-extrabold px-2 py-0.5 rounded tracking-wide ${color}`}>
      {status}
    </span>
  );
};
