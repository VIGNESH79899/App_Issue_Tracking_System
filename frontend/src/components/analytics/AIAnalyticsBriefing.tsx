import React from 'react';
import { AIAnalyticsBriefing } from '@app-issue-track/shared';
import { Sparkles, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';

interface AIAnalyticsBriefingProps {
  briefing: AIAnalyticsBriefing | null;
  isLoading?: boolean;
}

export const AIAnalyticsBriefingComponent: React.FC<AIAnalyticsBriefingProps> = ({ briefing, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center space-y-2 animate-pulse">
        <Sparkles className="w-5 h-5 text-brand-600 mx-auto" />
        <p className="text-xs font-semibold text-slate-700">Generating AI Executive Forecast Briefing from calculated facts...</p>
      </div>
    );
  }

  if (!briefing) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center text-xs text-slate-500 italic">
        AI Executive Forecast Briefing is currently unavailable.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            AI Executive Forecast Briefing
          </h3>
        </div>
        <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
          Generated from calculated backend facts. Advisory only.
        </span>
      </div>

      <p className="text-xs text-slate-800 leading-relaxed font-medium bg-slate-50 p-3 rounded-lg border border-slate-200/80">
        {briefing.summary}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Forecast Highlights */}
        {briefing.forecastHighlights && briefing.forecastHighlights.length > 0 && (
          <div className="space-y-1.5 bg-brand-50/50 p-3 rounded-lg border border-brand-200/80">
            <div className="flex items-center space-x-1.5 font-bold text-brand-900 uppercase text-[10px]">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
              <span>Forecast Highlights</span>
            </div>
            <ul className="space-y-1 text-slate-700 pl-1">
              {briefing.forecastHighlights.map((h, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-brand-600">•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Key Identified Risks */}
        {briefing.keyRisks && briefing.keyRisks.length > 0 && (
          <div className="space-y-1.5 bg-rose-50/50 p-3 rounded-lg border border-rose-200/80">
            <div className="flex items-center space-x-1.5 font-bold text-rose-900 uppercase text-[10px]">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              <span>Key Project Delivery Risks</span>
            </div>
            <ul className="space-y-1 text-slate-700 pl-1">
              {briefing.keyRisks.map((r, idx) => (
                <li key={idx} className="flex items-start space-x-1.5">
                  <span className="text-rose-500">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Recommended Focus Areas */}
      {briefing.recommendedFocusAreas && briefing.recommendedFocusAreas.length > 0 && (
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80 space-y-1.5 text-xs">
          <div className="flex items-center space-x-1.5 font-bold text-slate-900 uppercase text-[10px]">
            <Lightbulb className="w-3.5 h-3.5 text-slate-600" />
            <span>Leadership Focus Areas</span>
          </div>
          <ul className="space-y-1 text-slate-700 pl-1">
            {briefing.recommendedFocusAreas.map((f, idx) => (
              <li key={idx}>• {f}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
