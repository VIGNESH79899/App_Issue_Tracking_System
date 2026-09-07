import React from 'react';

interface AnalyticsHeaderProps {
  generatedAt?: string;
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({ generatedAt }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl px-5 py-4 shadow-subtle">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">
            Predictive Engineering Analytics
          </h1>
          <p className="text-xs text-slate-500">
            Current facts, deterministic calculations, and project-scoped forecasts only.
          </p>
        </div>
        <div className="text-[11px] text-slate-600 font-medium">
          <span className="font-semibold text-slate-700">AI boundary:</span> Gemini receives
          calculated backend facts only.
          {generatedAt ? (
            <span className="block font-mono text-[10px] text-slate-500 mt-1">
              Generated {new Date(generatedAt).toLocaleString()}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};
