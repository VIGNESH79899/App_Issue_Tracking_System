import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { DistributionMetric } from '../../services/dashboardApi';

const PRIORITY_COLORS: Record<string, string> = {
  CRITICAL: '#e11d48',
  HIGH: '#f59e0b',
  MEDIUM: '#3b82f6',
  LOW: '#64748b',
};

export const PriorityDistributionChart: React.FC<{ data: DistributionMetric[] }> = ({ data }) => {
  if (data.length === 0) {
    return <div className="p-8 text-center text-xs text-slate-400">No priority data available</div>;
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={45} paddingAngle={3}>
            {data.map((entry, index) => (
              <Cell key={`pie-cell-${index}`} fill={PRIORITY_COLORS[entry.name] || '#64748b'} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
