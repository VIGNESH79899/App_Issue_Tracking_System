import React from 'react';
import { PostIncidentAnalysisDTO } from '@app-issue-track/shared';
import { Sparkles, CheckCircle2, AlertTriangle, Lightbulb, HelpCircle, ShieldCheck } from 'lucide-react';

interface PostIncidentAnalysisProps {
  analysis: PostIncidentAnalysisDTO | null;
  isLoading?: boolean;
}

export const PostIncidentAnalysis: React.FC<PostIncidentAnalysisProps> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center space-y-2 animate-pulse">
        <Sparkles className="w-5 h-5 text-brand-600 mx-auto" />
        <p className="text-xs font-semibold text-slate-700">Generating AI Post-Incident Analysis from verified timeline events...</p>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-center text-xs text-slate-500 italic">
        Post-incident analysis is currently unavailable.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 shadow-subtle">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-brand-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            AI-Assisted Post-Incident Analysis (Post-Mortem)
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-300">
            AI SUGGESTION · ADVISORY
          </span>
          <span className="text-[10px] text-slate-500 font-mono">
            Ground truth: timeline facts only
          </span>
        </div>
      </div>

      {/* Executive Summary & Root Cause */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 space-y-1.5">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider">Executive Summary</div>
          <p className="text-xs text-slate-700 leading-relaxed">{analysis.executiveSummary}</p>
        </div>

        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200/80 space-y-1.5">
          <div className="text-xs font-bold text-rose-900 uppercase tracking-wider flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Root Cause Analysis</span>
          </div>
          <p className="text-xs text-rose-950 leading-relaxed font-medium">{analysis.rootCause}</p>
        </div>
      </div>

      {/* Impact Assessment */}
      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/80 space-y-1 text-xs">
        <div className="font-bold text-amber-900 uppercase text-[11px]">Impact Assessment</div>
        <p className="text-amber-950 font-medium">{analysis.impactAssessment}</p>
      </div>

      {/* What Went Well vs What Went Wrong */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/80 space-y-2">
          <div className="font-bold text-emerald-900 uppercase text-[11px] flex items-center space-x-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>What Went Well</span>
          </div>
          <ul className="space-y-1 text-slate-700 pl-1">
            {analysis.whatWentWell.map((w, idx) => (
              <li key={idx} className="flex items-start space-x-1.5">
                <span className="text-emerald-500">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-rose-50/50 p-4 rounded-xl border border-rose-200/80 space-y-2">
          <div className="font-bold text-rose-900 uppercase text-[11px] flex items-center space-x-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>What Went Wrong</span>
          </div>
          <ul className="space-y-1 text-slate-700 pl-1">
            {analysis.whatWentWrong.map((w, idx) => (
              <li key={idx} className="flex items-start space-x-1.5">
                <span className="text-rose-500">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Preventive Actions & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-brand-50/50 p-4 rounded-xl border border-brand-200/80 space-y-2">
          <div className="font-bold text-brand-900 uppercase text-[11px] flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Preventive Actions</span>
          </div>
          <ul className="space-y-1 text-slate-700 pl-1">
            {analysis.preventiveActions.map((p, idx) => (
              <li key={idx}>• {p}</li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="font-bold text-slate-900 uppercase text-[11px] flex items-center space-x-1.5">
            <Lightbulb className="w-4 h-4 text-slate-600" />
            <span>Testing Improvements</span>
          </div>
          <ul className="space-y-1 text-slate-700 pl-1">
            {analysis.testingRecommendations.map((t, idx) => (
              <li key={idx}>• {t}</li>
            ))}
          </ul>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="font-bold text-slate-900 uppercase text-[11px] flex items-center space-x-1.5">
            <HelpCircle className="w-4 h-4 text-slate-600" />
            <span>Monitoring Recommendations</span>
          </div>
          <ul className="space-y-1 text-slate-700 pl-1">
            {analysis.monitoringRecommendations.map((m, idx) => (
              <li key={idx}>• {m}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
