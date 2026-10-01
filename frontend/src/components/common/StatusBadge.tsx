import React from 'react';
import { IssueStatus } from '@app-issue-track/shared';
import { statusColors } from './designSystem';

interface StatusBadgeProps {
  status: IssueStatus | string;
  size?: 'sm' | 'md';
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  showDot = true,
}) => {
  const color = statusColors[status as keyof typeof statusColors] || {
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
    label: status.replace('_', ' '),
  };

  const sizeClasses =
    size === 'sm'
      ? 'px-1.5 py-0.5 text-[10px]'
      : 'px-2 py-0.5 text-[11px]';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-medium border ${color.badge} ${sizeClasses} whitespace-nowrap`}
    >
      {showDot && <span className={`w-1.5 h-1.5 rounded-full ${color.dot} shrink-0`} />}
      <span>{color.label}</span>
    </span>
  );
};

export default StatusBadge;
