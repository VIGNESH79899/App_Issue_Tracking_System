import React from 'react';
import { IssueStatus } from '@app-issue-track/shared';

interface StatusBadgeProps {
  status: IssueStatus | string;
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  [IssueStatus.OPEN]: { label: 'Open', bg: 'bg-blue-100', text: 'text-blue-800' },
  [IssueStatus.ASSIGNED]: { label: 'Assigned', bg: 'bg-indigo-100', text: 'text-indigo-800' },
  [IssueStatus.IN_PROGRESS]: { label: 'In Progress', bg: 'bg-amber-100', text: 'text-amber-800' },
  [IssueStatus.RESOLVED]: { label: 'Resolved', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  [IssueStatus.VERIFIED]: { label: 'Verified', bg: 'bg-teal-100', text: 'text-teal-800' },
  [IssueStatus.CLOSED]: { label: 'Closed', bg: 'bg-gray-100', text: 'text-gray-800' },
  [IssueStatus.REOPENED]: { label: 'Reopened', bg: 'bg-rose-100', text: 'text-rose-800' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || {
    label: status,
    bg: 'bg-gray-100',
    text: 'text-gray-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
};

export default StatusBadge;
