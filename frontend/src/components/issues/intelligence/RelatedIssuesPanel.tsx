import React from 'react';
import { Link } from 'react-router-dom';
import { RelatedIssue } from '@app-issue-track/shared';
import { Layers, ArrowUpRight } from 'lucide-react';

interface RelatedIssuesPanelProps {
  relatedIssues: RelatedIssue[];
}

export const RelatedIssuesPanel: React.FC<RelatedIssuesPanelProps> = ({ relatedIssues }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Related Issues</h3>
        </div>
        <span className="text-[11px] font-medium text-slate-500">{relatedIssues.length} found</span>
      </div>

      {relatedIssues.length === 0 ? (
        <div className="py-4 text-center text-xs text-slate-400 font-medium">
          No related issues detected in accessible workspace
        </div>
      ) : (
        <div className="space-y-2.5">
          {relatedIssues.map((item) => (
            <Link
              key={item.id}
              to={`/issues/${item.id}`}
              className="block bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-md p-2.5 transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-0.5 max-w-[75%]">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-[11px] text-brand-600 group-hover:underline">
                      {item.issueKey}
                    </span>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                      {item.priority}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-900 line-clamp-1 group-hover:text-brand-600">
                    {item.title}
                  </p>
                </div>

                <div className="text-right">
                  <span className="inline-block bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold px-1.5 py-0.5 rounded font-mono">
                    {item.relevanceScore}% Similarity
                  </span>
                </div>
              </div>

              <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-150">
                <span className="truncate max-w-[85%]">{item.relationshipReason}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-brand-600" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
