import React from 'react';
import type { SecurityEvent } from '../../services/operationsApi';

interface Props {
  events: SecurityEvent[];
}

const typeColors: Record<string, string> = {
  AUTH_FAILURE: 'bg-red-100 text-red-700',
  FORBIDDEN_ACCESS: 'bg-orange-100 text-orange-700',
  RATE_LIMIT: 'bg-yellow-100 text-yellow-700',
  SUSPICIOUS_REQUEST: 'bg-gray-100 text-gray-700',
  AI_FAILURE: 'bg-purple-100 text-purple-700',
  DATABASE_FAILURE: 'bg-red-100 text-red-700',
};

export const OperationsTimeline: React.FC<Props> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Security Event Timeline</h3>
        <p className="text-sm text-gray-500">No security events recorded in this process session.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Security Event Timeline (Recent 20)</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {events.slice(0, 20).map((ev, i) => (
          <div key={i} className="flex items-start gap-3 py-1.5 border-b border-gray-50 last:border-0">
            <span className={`flex-shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded ${typeColors[ev.type] ?? 'bg-gray-100 text-gray-600'}`}>
              {ev.type.replace(/_/g, ' ')}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-800 truncate">{ev.message}</p>
              <p className="text-xs text-gray-400">{ev.route ?? ''} · {new Date(ev.timestamp).toLocaleTimeString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
