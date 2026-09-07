import React from 'react';
import { IssueQualityMetric } from '@app-issue-track/shared';
import { Award } from 'lucide-react';

interface IssueQualityScoreProps {
  quality: IssueQualityMetric;
}

export const IssueQualityScore: React.FC<IssueQualityScoreProps> = ({ quality }) => {
  const { score, reasons } = quality;

  let scoreBadgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  if (score < 60) {
    scoreBadgeColor = 'bg-rose-50 text-rose-800 border-rose-200';
  } else if (score < 80) {
    scoreBadgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-subtle">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <Award className="w-4 h-4 text-brand-600" />
          <span>Issue Quality Score</span>
        </div>
        <div className={`flex items-baseline space-x-1 border font-mono font-extrabold text-xs px-2.5 py-1 rounded ${scoreBadgeColor}`}>
          <span className="text-base leading-none">{score}</span>
          <span className="text-[10px] opacity-75">/ 100</span>
        </div>
      </div>

      <div className="space-y-1.5 pt-1 text-xs">
        {reasons.map((r, idx) => {
          const isCheck = r.startsWith('✓');
          return (
            <div
              key={idx}
              className={`flex items-start space-x-2 font-medium ${
                isCheck ? 'text-emerald-800' : 'text-amber-800'
              }`}
            >
              <span>{r}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
