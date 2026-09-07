import React from 'react';
import { HelpCircle } from 'lucide-react';

interface MissingInformationProps {
  missingInfo: string[];
}

export const MissingInformation: React.FC<MissingInformationProps> = ({ missingInfo }) => {
  if (!missingInfo || missingInfo.length === 0) return null;

  return (
    <div className="bg-amber-50/50 border border-amber-200 rounded-lg p-4 space-y-2">
      <div className="flex items-center space-x-2 text-xs font-bold text-amber-900 uppercase tracking-wider border-b border-amber-200/60 pb-2">
        <HelpCircle className="w-4 h-4 text-amber-600" />
        <span>Missing Information</span>
      </div>
      <ul className="list-disc list-inside space-y-1 text-xs text-amber-950 pt-1">
        {missingInfo.map((info, idx) => (
          <li key={idx}>{info}</li>
        ))}
      </ul>
    </div>
  );
};
