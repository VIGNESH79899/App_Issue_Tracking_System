import React from 'react';
import { IssueSeverity } from '@app-issue-track/shared';

export const SeverityBadge: React.FC<{ severity: IssueSeverity }> = ({ severity }) => {
  switch (severity) {
    case IssueSeverity.BLOCKER:
      return <span className="px-2 py-0.5 text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 rounded">Blocker</span>;
    case IssueSeverity.CRITICAL:
      return <span className="px-2 py-0.5 text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded">Critical</span>;
    case IssueSeverity.MAJOR:
      return <span className="px-2 py-0.5 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded">Major</span>;
    case IssueSeverity.MINOR:
      return <span className="px-2 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200 rounded">Minor</span>;
    case IssueSeverity.COSMETIC:
    default:
      return <span className="px-2 py-0.5 text-xs font-medium bg-slate-50 text-slate-500 border border-slate-200 rounded">Cosmetic</span>;
  }
};
