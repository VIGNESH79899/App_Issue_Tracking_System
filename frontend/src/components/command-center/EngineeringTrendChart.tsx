import React from 'react';
import { TrendPoint } from '@app-issue-track/shared';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { TrendingUp } from 'lucide-react';

interface EngineeringTrendChartProps {
  period: '7d' | '14d' | '30d';
  points: TrendPoint[];
  onPeriodChange: (p: '7d' | '14d' | '30d') => void;
}

export const EngineeringTrendChart: React.FC<EngineeringTrendChartProps> = ({
  period,
  points,
  onPeriodChange,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Engineering Volume & SLA Trends</h3>
        </div>

        <div className="flex items-center space-x-1 font-mono text-[10px] font-bold">
          {(['7d', '14d', '30d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => onPeriodChange(p)}
              className={`px-2.5 py-1 rounded border transition-colors ${
                period === p
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="resolvedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
            />
            <Area type="monotone" dataKey="created" name="Created" stroke="#3b82f6" fillOpacity={1} fill="url(#createdGrad)" />
            <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" fillOpacity={1} fill="url(#resolvedGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
