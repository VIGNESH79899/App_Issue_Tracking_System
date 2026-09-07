import React from 'react';
import { MissingInfoItem } from '@app-issue-track/shared';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface MissingInformationPanelProps {
  missingInfo: MissingInfoItem[];
}

export const MissingInformationPanel: React.FC<MissingInformationPanelProps> = ({ missingInfo }) => {
  if (!missingInfo || missingInfo.length === 0) return null;

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'CRITICAL':
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 uppercase tracking-wider border-b border-amber-200/60 pb-2">
        <HelpCircle className="w-4 h-4 text-amber-600" />
        <span>Missing Information Intelligence</span>
      </div>

      <div className="space-y-3">
        {missingInfo.map((item, idx) => (
          <div key={idx} className="bg-white border border-amber-200/80 rounded-lg p-3 space-y-1.5 shadow-subtle">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">{item.field}</span>
              <span className={`border font-mono text-[9px] font-bold px-1.5 py-0.2 rounded ${getImportanceBadge(item.importance)}`}>
                {item.importance}
              </span>
            </div>

            <div className="text-[11px] text-slate-700 space-y-1">
              <p>
                <strong className="text-slate-900">Why it matters:</strong> {item.whyItMatters}
              </p>
              <p className="text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-100 font-mono text-[10px]">
                💡 <strong>How to obtain:</strong> {item.howToObtain}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
