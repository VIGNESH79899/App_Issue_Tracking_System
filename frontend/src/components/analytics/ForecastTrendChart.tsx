import React from 'react';
import { BacklogForecastPoint } from '@app-issue-track/shared';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { LineChart as LineIcon } from 'lucide-react';

interface ForecastTrendChartProps {
  points: BacklogForecastPoint[];
  period: '7d' | '14d' | '30d';
}

export const ForecastTrendChart: React.FC<ForecastTrendChartProps> = ({ points, period }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <LineIcon className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            {period.toUpperCase()} Predictive Backlog Trajectory
          </h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500">Deterministic Model Projection</span>
      </div>

      <div className="h-56 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
            />
            <Line type="monotone" dataKey="projectedOpenIssues" name="Projected Open Backlog" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="projectedNewIssues" name="Cumulative Intake" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
            <Line type="monotone" dataKey="projectedResolvedIssues" name="Cumulative Resolved" stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
