import React from 'react';
import { CheckSquare } from 'lucide-react';

interface TestingRecommendationsProps {
  recommendations: string[];
}

export const TestingRecommendations: React.FC<TestingRecommendationsProps> = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
      <div className="flex items-center space-x-2 text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
        <CheckSquare className="w-4 h-4 text-brand-600" />
        <span>Testing Recommendations</span>
      </div>
      <ul className="space-y-1.5 text-xs text-slate-700 pt-1">
        {recommendations.map((rec, idx) => (
          <li key={idx} className="flex items-start space-x-2">
            <span className="text-emerald-600 font-bold">✓</span>
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
