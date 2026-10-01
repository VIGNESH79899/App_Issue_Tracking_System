import React from 'react';
import { IssueTriageAnalysis } from '@app-issue-track/shared';
import { IssueQualityScore } from './IssueQualityScore';
import { AIRecommendationCard } from './AIRecommendationCard';
import { MissingInformationPanel } from './MissingInformationPanel';
import { DuplicateIssuesPanel } from './DuplicateIssuesPanel';
import { Sparkles } from 'lucide-react';

interface AITriagePanelProps {
  analysis: IssueTriageAnalysis;
  onAcceptPriority?: (val: string) => void;
  onAcceptSeverity?: (val: string) => void;
  onAcceptComponent?: (val: string) => void;
  onViewIssue?: (issueId: string) => void;
  onContinue?: () => void;
}

export const AITriagePanel: React.FC<AITriagePanelProps> = ({
  analysis,
  onAcceptPriority,
  onAcceptSeverity,
  onAcceptComponent,
  onViewIssue,
  onContinue,
}) => {
  if (!analysis) return null;

  return (
    <div className="space-y-5 bg-slate-50/50 p-4 border border-slate-200 rounded-xl shadow-subtle">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            AI Engineering Triage & Quality
          </h3>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300 rounded uppercase">
          AI Suggestion · Advisory
        </span>
      </div>

      {/* Quality Score */}
      <IssueQualityScore quality={analysis.qualityScore} />

      {/* Triage Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <AIRecommendationCard
          label="Suggested Priority"
          recommendation={analysis.suggestedPriority}
          onAccept={onAcceptPriority}
        />
        <AIRecommendationCard
          label="Suggested Severity"
          recommendation={analysis.suggestedSeverity}
          onAccept={onAcceptSeverity}
        />
        <AIRecommendationCard
          label="Suggested Component"
          recommendation={analysis.suggestedComponent}
          onAccept={onAcceptComponent}
        />
      </div>

      {/* Duplicate Candidate Detection */}
      <DuplicateIssuesPanel
        duplicates={analysis.duplicateCandidates}
        onViewIssue={onViewIssue}
        onContinue={onContinue}
      />

      {/* Missing Information Intelligence */}
      <MissingInformationPanel missingInfo={analysis.missingInformation} />

      {/* Mandatory Disclaimer */}
      <div className="pt-2 border-t border-slate-200 text-center">
        <p className="text-[11px] text-slate-500 italic">
          AI-generated recommendations are advisory and should be reviewed before applying.
        </p>
      </div>
    </div>
  );
};
