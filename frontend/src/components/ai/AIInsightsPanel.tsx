import React, { useState, useEffect } from 'react';
import { AIInsightResponseData } from '@app-issue-track/shared';
import { aiApi } from '../../services/aiApi';
import { AISummaryCard } from './AISummaryCard';
import { RootCauseHypotheses } from './RootCauseHypotheses';
import { RecommendedActions } from './RecommendedActions';
import { AIRiskAssessment } from './AIRiskAssessment';
import { TestingRecommendations } from './TestingRecommendations';
import { MissingInformation } from './MissingInformation';
import { Button } from '../common/Button';
import { Sparkles, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';

interface AIInsightsPanelProps {
  issueId: string;
}

export const AIInsightsPanel: React.FC<AIInsightsPanelProps> = ({ issueId }) => {
  const [data, setData] = useState<AIInsightResponseData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegenerating, setIsRegenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnavailable, setIsUnavailable] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    setError(null);
    setIsUnavailable(false);

    aiApi
      .getAiInsights(issueId)
      .then((res) => {
        if (isMounted) setData(res);
      })
      .catch((err: any) => {
        if (isMounted) {
          const code = err.code || err.response?.data?.error?.code;
          if (code === 'AI_UNAVAILABLE' || err.status === 400) {
            setIsUnavailable(true);
          } else {
            setError(err.message || err.response?.data?.error?.message || 'Failed to load AI insights');
          }
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [issueId]);

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    setError(null);
    try {
      const res = await aiApi.regenerateAiInsights(issueId);
      setData(res);
    } catch (err: any) {
      setError(err.message || err.response?.data?.error?.message || 'Failed to regenerate AI insights');
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-6 text-center space-y-3">
        <Loader2 className="w-6 h-6 animate-spin text-brand-600 mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Generating structured AI engineering analysis...</p>
      </div>
    );
  }

  if (isUnavailable) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-center space-y-2">
        <Sparkles className="w-5 h-5 text-slate-400 mx-auto" />
        <p className="text-xs font-semibold text-slate-700">AI assistance is currently unavailable.</p>
        <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
          AI features are currently disabled or unconfigured in this environment. Deterministic tracking remains fully operational.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 text-xs text-rose-700 space-y-3">
        <div className="flex items-center space-x-2 font-bold">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>AI Insight Generation Failed</span>
        </div>
        <p>{error}</p>
        <Button size="sm" variant="outline" onClick={handleRegenerate} isLoading={isRegenerating}>
          Try Again
        </Button>
      </div>
    );
  }

  if (!data || !data.insights) return null;

  const { insights } = data;

  return (
    <div className="space-y-5 bg-slate-50/50 p-4 border border-slate-200 rounded-xl shadow-subtle">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            AI Issue Intelligence
          </h3>
        </div>
        <Button
          size="sm"
          variant="outline"
          isLoading={isRegenerating}
          onClick={handleRegenerate}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Regenerate Analysis
        </Button>
      </div>

      {/* Summary */}
      <AISummaryCard summary={insights.summary} />

      {/* Root Cause Hypotheses */}
      <RootCauseHypotheses hypotheses={insights.rootCauseHypotheses} />

      {/* Recommended Actions */}
      <RecommendedActions actions={insights.recommendedActions} />

      {/* Risk Assessment */}
      <AIRiskAssessment risk={insights.riskAssessment} />

      {/* Testing Recommendations */}
      <TestingRecommendations recommendations={insights.testingRecommendations} />

      {/* Missing Information */}
      <MissingInformation missingInfo={insights.missingInformation} />

      {/* Mandatory Disclaimer */}
      <div className="pt-2 border-t border-slate-200 text-center">
        <p className="text-[11px] text-slate-500 italic">
          AI-generated content may be incorrect. Verify recommendations before taking action.
        </p>
      </div>
    </div>
  );
};
