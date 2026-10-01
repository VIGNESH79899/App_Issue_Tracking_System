import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IssueDTO } from '@app-issue-track/shared';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { SeverityBadge } from '../common/SeverityBadge';
import { User, Calendar, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react';
import { typography, surfaces } from '../common/designSystem';

export interface IssueTableProps {
  issues: IssueDTO[];
  isLoading?: boolean;
}

type SortField = 'key' | 'title' | 'status' | 'priority' | 'severity' | 'created';

export const IssueTable: React.FC<IssueTableProps> = ({ issues }) => {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState<SortField>('created');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedIssues = [...issues].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'key') cmp = a.issueKey.localeCompare(b.issueKey);
    else if (sortField === 'title') cmp = a.title.localeCompare(b.title);
    else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
    else if (sortField === 'priority') cmp = a.priority.localeCompare(b.priority);
    else if (sortField === 'severity') cmp = a.severity.localeCompare(b.severity);
    else if (sortField === 'created') cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sortDirection === 'asc' ? cmp : -cmp;
  });

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-slate-300 group-hover:text-slate-500" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3 h-3 text-brand-600 font-bold" />
    ) : (
      <ChevronDown className="w-3 h-3 text-brand-600 font-bold" />
    );
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg shadow-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" role="table">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider select-none">
              <th
                onClick={() => handleSort('key')}
                className="py-2.5 px-3.5 cursor-pointer hover:bg-slate-100/80 transition-colors w-28 group"
              >
                <div className="flex items-center gap-1.5">
                  <span>Key</span>
                  {renderSortIcon('key')}
                </div>
              </th>
              <th
                onClick={() => handleSort('title')}
                className="py-2.5 px-3.5 cursor-pointer hover:bg-slate-100/80 transition-colors group min-w-[240px]"
              >
                <div className="flex items-center gap-1.5">
                  <span>Title & Context</span>
                  {renderSortIcon('title')}
                </div>
              </th>
              <th
                onClick={() => handleSort('status')}
                className="py-2.5 px-3.5 cursor-pointer hover:bg-slate-100/80 transition-colors group w-32"
              >
                <div className="flex items-center gap-1.5">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>
              <th
                onClick={() => handleSort('priority')}
                className="py-2.5 px-3.5 cursor-pointer hover:bg-slate-100/80 transition-colors group w-28"
              >
                <div className="flex items-center gap-1.5">
                  <span>Priority</span>
                  {renderSortIcon('priority')}
                </div>
              </th>
              <th
                onClick={() => handleSort('severity')}
                className="py-2.5 px-3.5 cursor-pointer hover:bg-slate-100/80 transition-colors group w-28"
              >
                <div className="flex items-center gap-1.5">
                  <span>Severity</span>
                  {renderSortIcon('severity')}
                </div>
              </th>
              <th className="py-2.5 px-3.5 w-44 hidden md:table-cell">App / Project</th>
              <th className="py-2.5 px-3.5 w-36">Assignee</th>
              <th
                onClick={() => handleSort('created')}
                className="py-2.5 px-3.5 text-right cursor-pointer hover:bg-slate-100/80 transition-colors group w-28"
              >
                <div className="flex items-center justify-end gap-1.5">
                  <span>Created</span>
                  {renderSortIcon('created')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {sortedIssues.map((issue) => (
              <tr
                key={issue.id}
                tabIndex={0}
                role="row"
                onClick={() => navigate(`/issues/${issue.id}`)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/issues/${issue.id}`);
                  }
                }}
                className={`${surfaces.hoverRow} group focus:bg-brand-50/50 focus:outline-hidden`}
              >
                <td className="py-2.5 px-3.5 whitespace-nowrap">
                  <span className="font-mono text-xs font-bold text-brand-600 group-hover:text-brand-700">
                    {issue.issueKey}
                  </span>
                </td>
                <td className="py-2.5 px-3.5 max-w-md">
                  <p className="font-semibold text-slate-900 truncate group-hover:text-brand-900">
                    {issue.title}
                  </p>
                  {issue.moduleComponent && (
                    <span className="inline-block font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded mt-0.5">
                      {issue.moduleComponent}
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3.5 whitespace-nowrap">
                  <StatusBadge status={issue.status} size="sm" />
                </td>
                <td className="py-2.5 px-3.5 whitespace-nowrap">
                  <PriorityBadge priority={issue.priority} size="sm" />
                </td>
                <td className="py-2.5 px-3.5 whitespace-nowrap">
                  <SeverityBadge severity={issue.severity} size="sm" />
                </td>
                <td className="py-2.5 px-3.5 whitespace-nowrap hidden md:table-cell">
                  <span className="text-slate-800 font-medium block truncate max-w-[140px]">
                    {issue.applicationName || 'Default'}
                  </span>
                  <span className="text-[11px] text-slate-500 block font-mono">
                    {issue.projectName}
                  </span>
                </td>
                <td className="py-2.5 px-3.5 whitespace-nowrap">
                  {issue.assignee ? (
                    <div className="flex items-center space-x-1.5">
                      <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                        {issue.assignee.firstName?.[0]}
                      </div>
                      <span className="text-slate-800 font-medium truncate max-w-[100px]">
                        {issue.assignee.firstName} {issue.assignee.lastName?.[0]}.
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-[11px] flex items-center gap-1">
                      <User className="w-3 h-3 text-slate-300" />
                      <span>Unassigned</span>
                    </span>
                  )}
                </td>
                <td className="py-2.5 px-3.5 text-right whitespace-nowrap text-slate-500 font-mono text-[11px]">
                  {new Date(issue.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default IssueTable;
