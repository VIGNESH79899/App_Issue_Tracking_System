import React from 'react';
import { DuplicateCandidateItem } from '@app-issue-track/shared';
import { Copy, AlertTriangle, ExternalLink } from 'lucide-react';
import { Button } from '../common/Button';

interface DuplicateIssuesPanelProps {
  duplicates: DuplicateCandidateItem[];
  onViewIssue?: (issueId: string) => void;
  onContinue?: () => void;
}

export const DuplicateIssuesPanel: React.FC<DuplicateIssuesPanelProps> = ({
  duplicates,
  onViewIssue,
  onContinue,
}) => {
  if (!duplicates || duplicates.length === 0) return null;

  const topMatch = duplicates[0];
  const hasHighSimilarity = topMatch && topMatch.similarityScore >= 85;

  return (
    <div className="space-y-3">
      {hasHighSimilarity && (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-3.5 flex items-start justify-between">
          <div className="flex items-start space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-900">Possible Duplicate Detected ({topMatch.similarityScore}% Similar)</h4>
              <p className="text-[11px] text-rose-700 mt-0.5">
                Issue <strong>[{topMatch.issueKey}]</strong> has very high similarity to your submitted report. Please check if this issue already exists.
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 shrink-0 ml-4">
            {onViewIssue && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewIssue(topMatch.issueId)}
                leftIcon={<ExternalLink className="w-3 h-3" />}
              >
                View Issue
              </Button>
            )}
            {onContinue && (
              <Button size="sm" variant="secondary" onClick={onContinue}>
                Continue Creating
              </Button>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-subtle">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
          <Copy className="w-4 h-4 text-brand-600" />
          <span>Project Duplicate Candidates ({duplicates.length})</span>
        </div>

        <div className="space-y-2">
          {duplicates.map((item) => (
            <div key={item.issueId} className="bg-slate-50/70 border border-slate-200 rounded-lg p-3 space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-bold text-brand-600">{item.issueKey}</span>
                  <span className="text-xs font-bold text-slate-900">{item.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-slate-200 text-slate-800 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                    {item.similarityScore}% Similar
                  </span>
                  {onViewIssue && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewIssue(item.issueId)}
                      leftIcon={<ExternalLink className="w-3 h-3" />}
                    >
                      View
                    </Button>
                  )}
                </div>
              </div>

              {item.reasons && item.reasons.length > 0 && (
                <p className="text-[11px] text-slate-600 pl-1">
                  <strong>Reasons:</strong> {item.reasons.join('; ')}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
