import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { DistributionMetric } from '../../services/dashboardApi';

const STATUS_COLORS: Record<string, string> = {
  OPEN: '#3b82f6',
  ASSIGNED: '#6366f1',
  IN_PROGRESS: '#f59e0b',
  RESOLVED: '#10b981',
  VERIFIED: '#14b8a6',
  CLOSED: '#64748b',
  REOPENED: '#f43f5e',
};

export const StatusDistributionChart: React.FC<{ data: DistributionMetric[] }> = ({ data }) => {
  if (data.length === 0) {
    return <div className="p-8 text-center text-xs text-slate-400">No status data available</div>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
          <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#2563eb'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
