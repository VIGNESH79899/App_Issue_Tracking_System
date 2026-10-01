import React from 'react';
import { IssueSeverity } from '@app-issue-track/shared';

export const SeverityBadge: React.FC<{
  severity: IssueSeverity;
  size?: 'sm' | 'md';
}> = ({ severity, size = 'sm' }) => {
  const sizeClasses = size === 'sm' ? 'px-1.5 py-0.2 text-[10px]' : 'px-2 py-0.5 text-xs';

  switch (severity) {
    case IssueSeverity.BLOCKER:
      return (
        <span className={`${sizeClasses} font-bold bg-rose-100 text-rose-800 border border-rose-300 rounded whitespace-nowrap`}>
          Blocker
        </span>
      );
    case IssueSeverity.CRITICAL:
      return (
        <span className={`${sizeClasses} font-semibold bg-rose-50 text-rose-700 border border-rose-200 rounded whitespace-nowrap`}>
          Critical
        </span>
      );
    case IssueSeverity.MAJOR:
      return (
        <span className={`${sizeClasses} font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded whitespace-nowrap`}>
          Major
        </span>
      );
    case IssueSeverity.MODERATE:
      return (
        <span className={`${sizeClasses} font-medium bg-sky-50 text-sky-700 border border-sky-200 rounded whitespace-nowrap`}>
          Moderate
        </span>
      );
    case IssueSeverity.MINOR:
      return (
        <span className={`${sizeClasses} font-medium bg-slate-100 text-slate-700 border border-slate-200 rounded whitespace-nowrap`}>
          Minor
        </span>
      );
    case IssueSeverity.COSMETIC:
    default:
      return (
        <span className={`${sizeClasses} font-medium bg-slate-50 text-slate-500 border border-slate-200 rounded whitespace-nowrap`}>
          Cosmetic
        </span>
      );
  }
};

export default SeverityBadge;
