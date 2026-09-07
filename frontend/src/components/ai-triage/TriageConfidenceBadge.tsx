import React from 'react';

interface TriageConfidenceBadgeProps {
  confidence: number;
}

export const TriageConfidenceBadge: React.FC<TriageConfidenceBadgeProps> = ({ confidence }) => {
  let badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
  if (confidence >= 85) {
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  } else if (confidence >= 70) {
    badgeColor = 'bg-blue-50 text-blue-800 border-blue-200';
  } else {
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
  }

  return (
    <span className={`border font-mono text-[10px] font-bold px-2 py-0.5 rounded ${badgeColor}`}>
      {confidence}% Confidence
    </span>
  );
};
