import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IssueDTO } from '@app-issue-track/shared';
import { StatusBadge } from '../common/StatusBadge';
import { PriorityBadge } from '../common/PriorityBadge';
import { SeverityBadge } from '../common/SeverityBadge';
import { User, Calendar } from 'lucide-react';

export interface IssueTableProps {
  issues: IssueDTO[];
  isLoading?: boolean;
}

export const IssueTable: React.FC<IssueTableProps> = ({ issues }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full bg-white border border-slate-200 rounded-lg shadow-subtle overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="py-3 px-4">Key</th>
              <th className="py-3 px-4">Title</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Priority</th>
              <th className="py-3 px-4">Severity</th>
              <th className="py-3 px-4">App / Project</th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {issues.map((issue) => (
              <tr
                key={issue.id}
                onClick={() => navigate(`/issues/${issue.id}`)}
                className="hover:bg-slate-50/80 cursor-pointer transition-colors group"
              >
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="font-mono text-xs font-bold text-brand-600 group-hover:underline">
                    {issue.issueKey}
                  </span>
                </td>
                <td className="py-3 px-4 max-w-md">
                  <p className="font-semibold text-slate-900 truncate">{issue.title}</p>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <StatusBadge status={issue.status} />
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <PriorityBadge priority={issue.priority} />
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <SeverityBadge severity={issue.severity} />
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  <span className="text-xs font-medium text-slate-700 block">
                    {issue.applicationName || 'N/A'}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    {issue.projectName || 'N/A'}
                  </span>
                </td>
                <td className="py-3 px-4 whitespace-nowrap">
                  {issue.assignee ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                        {issue.assignee.firstName?.[0]}
                      </div>
                      <span className="text-xs font-medium text-slate-800">
                        {issue.assignee.firstName} {issue.assignee.lastName}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 italic flex items-center space-x-1">
                      <User className="w-3.5 h-3.5" />
                      <span>Unassigned</span>
                    </span>
                  )}
                </td>
                <td className="py-3 px-4 text-right whitespace-nowrap">
                  <span className="text-xs text-slate-500 inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {new Date(issue.createdAt).toLocaleDateString()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
