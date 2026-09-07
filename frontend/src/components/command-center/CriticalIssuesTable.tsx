import React from 'react';
import { CriticalIssueSummary } from '@app-issue-track/shared';
import { ShieldAlert, ExternalLink } from 'lucide-react';
import { Button } from '../common/Button';

interface CriticalIssuesTableProps {
  issues: CriticalIssueSummary[];
  onViewIssue?: (issueId: string) => void;
}

export const CriticalIssuesTable: React.FC<CriticalIssuesTableProps> = ({ issues, onViewIssue }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Prioritized Critical Issues</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">{issues.length} Issues</span>
      </div>

      {issues.length === 0 ? (
        <p className="text-xs text-slate-500 italic text-center py-4">Zero active critical issues in project queue.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Issue Key</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Component</th>
                <th className="py-2.5 px-3 text-center">Priority</th>
                <th className="py-2.5 px-3 text-center">Severity</th>
                <th className="py-2.5 px-3 text-center">Estimated SLA Risk</th>
                <th className="py-2.5 px-3">Assignee</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {issues.map((i) => (
                <tr key={i.issueId} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-mono font-bold text-brand-700">{i.issueKey}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 max-w-xs truncate">{i.title}</td>
                  <td className="py-2.5 px-3 font-mono">{i.component}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-700">{i.priority}</td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold text-rose-700">{i.severity}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border ${
                        i.riskLevel === 'LIKELY_TO_BREACH'
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : i.riskLevel === 'HIGH'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {i.riskLevel}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-slate-700">{i.assigneeName || 'Unassigned'}</td>
                  <td className="py-2.5 px-3 text-right">
                    {onViewIssue && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onViewIssue(i.issueId)}
                        leftIcon={<ExternalLink className="w-3 h-3" />}
                      >
                        View
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
