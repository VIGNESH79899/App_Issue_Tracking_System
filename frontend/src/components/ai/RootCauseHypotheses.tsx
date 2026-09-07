import React from 'react';
import { AIRootCauseHypothesis } from '@app-issue-track/shared';
import { BrainCircuit, AlertCircle } from 'lucide-react';

interface RootCauseHypothesesProps {
  hypotheses: AIRootCauseHypothesis[];
}

export const RootCauseHypotheses: React.FC<RootCauseHypothesesProps> = ({ hypotheses }) => {
  if (hypotheses.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 pb-1.5">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
          <BrainCircuit className="w-4 h-4 text-brand-600" />
          <span>AI-Generated Root Cause Hypotheses</span>
        </div>
        <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-medium">
          Hypotheses Only — Not Confirmed Facts
        </span>
      </div>

      <div className="space-y-2.5">
        {hypotheses.map((item, idx) => (
          <div key={idx} className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2 shadow-subtle">
            <div className="flex items-start justify-between">
              <span className="text-xs font-bold text-slate-900 leading-snug">
                {idx + 1}. {item.hypothesis}
              </span>
              <span className="bg-slate-100 text-slate-700 border border-slate-200 font-mono text-[10px] font-bold px-2 py-0.5 rounded">
                Confidence: {item.confidence}%
              </span>
            </div>

            {item.evidence && item.evidence.length > 0 && (
              <div className="space-y-1 pt-1 border-t border-slate-100 text-[11px] text-slate-600">
                <span className="font-semibold text-slate-700 text-[10px] uppercase tracking-wider block">
                  Supporting Context Evidence:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                  {item.evidence.map((ev, eIdx) => (
                    <li key={eIdx}>{ev}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
