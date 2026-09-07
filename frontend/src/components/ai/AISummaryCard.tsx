import React from 'react';
import { FileText } from 'lucide-react';

interface AISummaryCardProps {
  summary: string;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({ summary }) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
        <FileText className="w-4 h-4 text-brand-600" />
        <span>Executive Summary</span>
      </div>
      <p className="text-xs text-slate-700 leading-relaxed font-normal">{summary}</p>
    </div>
  );
};
