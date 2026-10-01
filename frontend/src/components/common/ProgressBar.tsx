import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercent?: boolean;
  colorVariant?: 'brand' | 'emerald' | 'amber' | 'rose';
  size?: 'sm' | 'md';
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercent = false,
  colorVariant = 'brand',
  size = 'sm',
}) => {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  const colorMap = {
    brand: 'bg-gradient-to-r from-brand-600 to-indigo-500 shadow-xs shadow-brand-500/20',
    emerald: 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-xs shadow-emerald-500/20',
    amber: 'bg-gradient-to-r from-amber-500 to-orange-400 shadow-xs shadow-amber-500/20',
    rose: 'bg-gradient-to-r from-rose-500 to-pink-500 shadow-xs shadow-rose-500/20',
  };

  const heightClass = size === 'sm' ? 'h-2' : 'h-3';

  return (
    <div className="w-full space-y-1.5">
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
          {label && <span>{label}</span>}
          {showPercent && <span className="font-mono font-bold text-slate-800">{percentage}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={`w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/70 p-0.5 ${heightClass} flex items-center`}
      >
        <div
          className={`${colorMap[colorVariant]} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
