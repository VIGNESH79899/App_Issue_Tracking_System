import React from 'react';
import { Shield, Lock, Gauge, AlertOctagon } from 'lucide-react';
import type { SecurityCounts } from '../../services/operationsApi';

interface Props {
  counts: SecurityCounts;
}

export const SecurityEventsCard: React.FC<Props> = ({ counts }) => {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  const items = [
    { label: 'Auth Failures', value: counts.AUTH_FAILURE, icon: Lock, color: 'text-red-600 bg-red-50' },
    { label: 'Forbidden Access', value: counts.FORBIDDEN_ACCESS, icon: Shield, color: 'text-orange-600 bg-orange-50' },
    { label: 'Rate Limited', value: counts.RATE_LIMIT, icon: Gauge, color: 'text-yellow-600 bg-yellow-50' },
    { label: 'AI Failures', value: counts.AI_FAILURE, icon: AlertOctagon, color: 'text-purple-600 bg-purple-50' },
    { label: 'DB Failures', value: counts.DATABASE_FAILURE, icon: AlertOctagon, color: 'text-red-600 bg-red-50' },
    { label: 'Suspicious Reqs', value: counts.SUSPICIOUS_REQUEST, icon: AlertOctagon, color: 'text-gray-600 bg-gray-50' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">Security Events</h3>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${total > 0 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {total} total
        </span>
      </div>
      <div className="space-y-2">
        {items.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1 rounded ${color}`}>
                <Icon className="w-3 h-3" />
              </div>
              <span className="text-xs text-gray-700">{label}</span>
            </div>
            <span className={`text-xs font-semibold ${value > 0 ? 'text-red-600' : 'text-gray-400'}`}>
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
