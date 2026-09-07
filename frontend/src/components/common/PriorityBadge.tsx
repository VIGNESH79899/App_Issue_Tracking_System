import React from 'react';
import { IssuePriority } from '@app-issue-track/shared';
import { ArrowUp, ArrowDown, AlertOctagon, Minus } from 'lucide-react';

export const PriorityBadge: React.FC<{ priority: IssuePriority; size?: 'sm' | 'md' }> = ({ priority, size = 'sm' }) => {
  const isSm = size === 'sm';
  const sizeClasses = isSm ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';
  const iconSize = isSm ? 'w-3 h-3' : 'w-4 h-4';

  switch (priority) {
    case IssuePriority.CRITICAL:
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-md bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <AlertOctagon className={iconSize} />
          <span>Critical</span>
        </span>
      );
    case IssuePriority.HIGH:
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-md bg-amber-50 text-amber-700 border border-amber-200 ${sizeClasses}`}>
          <ArrowUp className={iconSize} />
          <span>High</span>
        </span>
      );
    case IssuePriority.MEDIUM:
      return (
        <span className={`inline-flex items-center gap-1 font-semibold rounded-md bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <Minus className={iconSize} />
          <span>Medium</span>
        </span>
      );
    case IssuePriority.LOW:
    default:
      return (
        <span className={`inline-flex items-center gap-1 font-medium rounded-md bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>
          <ArrowDown className={iconSize} />
          <span>Low</span>
        </span>
      );
  }
};
