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
    <div className="min-w-0 bg-white border border-slate-200 rounded-xl p-4 shadow-subtle flex flex-col gap-3 transition-shadow hover:shadow-card">
      <div className="flex min-w-0 flex-col items-start gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">{label}</span>
        </div>
        <TriageConfidenceBadge confidence={recommendation.confidence} />
      </div>

      <div className="min-w-0">
        <span className="block break-words text-lg font-extrabold leading-snug text-slate-900">{recommendation.value}</span>

        {status === 'ACCEPTED' && (
          <span className="mt-2 inline-flex text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Accepted
          </span>
        )}
        {status === 'REJECTED' && (
          <span className="mt-2 inline-flex text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            Rejected
          </span>
        )}
      </div>

      {status === 'IDLE' && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
            {onAccept && (
              <Button
                size="sm"
                variant="primary"
                onClick={handleAccept}
                leftIcon={<Check className="w-3 h-3" />}
                className="flex-1"
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
                className="flex-1"
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
                className="flex-1"
              >
                Reject
              </Button>
            )}
        </div>
      )}

      <p className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
        {recommendation.reason}
      </p>
    </div>
  );
};
