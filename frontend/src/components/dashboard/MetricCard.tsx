import React from 'react';

export interface MetricCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  icon: React.ReactNode;
  colorVariant?: 'brand' | 'amber' | 'emerald' | 'rose' | 'slate';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  colorVariant = 'brand',
}) => {
  const iconColors = {
    brand: 'bg-brand-50 text-brand-600 border-brand-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
    rose: 'bg-rose-50 text-rose-600 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-subtle flex items-center justify-between">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-bold text-slate-900 tracking-tight font-mono mt-1">{value}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl border ${iconColors[colorVariant]} shadow-subtle`}>
        {icon}
      </div>
    </div>
  );
};
