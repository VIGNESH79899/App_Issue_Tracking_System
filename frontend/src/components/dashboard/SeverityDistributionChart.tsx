import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { DistributionMetric } from '../../services/dashboardApi';

const SEVERITY_COLORS: Record<string, string> = {
  BLOCKER: '#9f1239',
  CRITICAL: '#e11d48',
  MAJOR: '#f59e0b',
  MODERATE: '#3b82f6',
  MINOR: '#10b981',
  COSMETIC: '#64748b',
};

export const SeverityDistributionChart: React.FC<{ data: DistributionMetric[] }> = ({ data }) => {
  if (data.length === 0) {
    return <div className="p-8 text-center text-xs text-slate-400">No severity data available</div>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={45} paddingAngle={3}>
            {data.map((entry, index) => (
              <Cell key={`pie-cell-${index}`} fill={SEVERITY_COLORS[entry.name] || '#64748b'} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
