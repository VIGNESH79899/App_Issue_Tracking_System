import React, { useState } from 'react';
import { AITriageRecommendation } from '@app-issue-track/shared';
import { TriageConfidenceBadge } from './TriageConfidenceBadge';
import { Button } from '../common/Button';
import { Check, Edit2, X, Sparkles } from 'lucide-react';

interface AIRecommendationCardProps {
  label: string;
  recommendation: AITriageRecommendation;
  onAccept?: (value: string) => void;
  onEdit?: (value: string) => void;
  onReject?: () => void;
}

export const AIRecommendationCard: React.FC<AIRecommendationCardProps> = ({
  label,
  recommendation,
  onAccept,
  onEdit,
  onReject,
}) => {
  const [status, setStatus] = useState<'IDLE' | 'ACCEPTED' | 'REJECTED'>('IDLE');

  const handleAccept = () => {
    setStatus('ACCEPTED');
    if (onAccept) onAccept(recommendation.value);
  };

  const handleReject = () => {
    setStatus('REJECTED');
    if (onReject) onReject();
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-2.5 shadow-subtle">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{label}</span>
        </div>
        <TriageConfidenceBadge confidence={recommendation.confidence} />
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <span className="text-sm font-extrabold text-slate-900 font-mono">{recommendation.value}</span>

        {status === 'ACCEPTED' && (
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Accepted
          </span>
        )}
        {status === 'REJECTED' && (
          <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Rejected
          </span>
        )}

        {status === 'IDLE' && (
          <div className="flex items-center space-x-1.5">
            {onAccept && (
              <Button
                size="sm"
                variant="primary"
                onClick={handleAccept}
                leftIcon={<Check className="w-3 h-3" />}
              >
                Accept
              </Button>
            )}
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onEdit(recommendation.value)}
                leftIcon={<Edit2 className="w-3 h-3" />}
              >
                Edit
              </Button>
            )}
            {onReject && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleReject}
                leftIcon={<X className="w-3 h-3" />}
              >
                Reject
              </Button>
            )}
          </div>
        )}
      </div>

      <p className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
        {recommendation.reason}
      </p>
    </div>
  );
};
