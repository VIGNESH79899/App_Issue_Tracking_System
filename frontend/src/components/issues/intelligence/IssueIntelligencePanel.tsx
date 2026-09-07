import React from 'react';
import { IssueIntelligence } from '@app-issue-track/shared';
import { IssueAgeCard } from './IssueAgeCard';
import { SlaCard } from './SlaCard';
import { LifecycleDurationPanel } from './LifecycleDurationPanel';
import { RelatedIssuesPanel } from './RelatedIssuesPanel';
import { AssigneeWorkloadCard } from './AssigneeWorkloadCard';
import { Sparkles } from 'lucide-react';

interface IssueIntelligencePanelProps {
  intelligence: IssueIntelligence | null;
  isLoading: boolean;
  error: string | null;
}

export const IssueIntelligencePanel: React.FC<IssueIntelligencePanelProps> = ({
  intelligence,
  isLoading,
  error,
}) => {
  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-32 bg-slate-100 rounded-lg" />
        <div className="h-44 bg-slate-100 rounded-lg" />
        <div className="h-44 bg-slate-100 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-xs text-red-700 font-medium">
        Unable to load issue intelligence metrics: {error}
      </div>
    );
  }

  if (!intelligence) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Explicit AI Architecture Boundary Banner */}
      <div className="bg-slate-900 text-slate-200 rounded-lg p-3 border border-slate-800 flex items-center justify-between text-xs shadow-sm">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-100">Issue Intelligence Engine</span>
        </div>
        <span className="bg-slate-800 text-slate-400 border border-slate-700 text-[10px] px-2 py-0.5 rounded font-mono">
          AI Insights — Coming in Intelligence Phase
        </span>
      </div>

      {/* Real PostgreSQL Calculated SLA & Intelligence Cards */}
      <SlaCard sla={intelligence.sla} />

      <IssueAgeCard
        issueAge={intelligence.issueAge}
        timeSinceUpdate={intelligence.timeSinceUpdate}
        currentStatusDuration={intelligence.currentStatusDuration}
        assignmentAge={intelligence.assignmentAge}
      />

      <LifecycleDurationPanel durations={intelligence.lifecycleDurations} />

      <AssigneeWorkloadCard workload={intelligence.assigneeWorkload} />

      <RelatedIssuesPanel relatedIssues={intelligence.relatedIssues} />
    </div>
  );
};
