import React from 'react';
import { Brain } from 'lucide-react';
import type { SystemMetrics, SystemDependencies } from '../../services/operationsApi';

interface Props {
  ai: SystemDependencies['ai'];
  metrics: SystemMetrics;
}

export const AIProviderStatus: React.FC<Props> = ({ ai, metrics }) => {
  const failureRate = metrics.aiRequests > 0
    ? Math.round((metrics.aiFailures / metrics.aiRequests) * 100)
    : 0;

  const statusColor = ai.status === 'CONFIGURED'
    ? 'text-green-600 bg-green-50 border-green-200'
    : 'text-gray-500 bg-gray-50 border-gray-200';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-4 h-4 text-purple-500" />
        <h3 className="text-sm font-semibold text-gray-900">AI Provider</h3>
        <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full border ${statusColor}`}>
          {ai.status}
        </span>
      </div>
      <div className="space-y-3">
        <Row label="Provider" value={ai.provider} />
        <Row label="Model" value={ai.model} />
        <Row label="Enabled" value={ai.enabled ? 'Yes' : 'No'} />
        <Row label="Total AI Requests" value={metrics.aiRequests.toLocaleString()} />
        <Row label="AI Failures" value={metrics.aiFailures.toLocaleString()} highlight={metrics.aiFailures > 0} />
        <Row label="Failure Rate" value={`${failureRate}%`} highlight={failureRate >= 10} />
      </div>
    </div>
  );
};

const Row: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between">
    <span className="text-xs text-gray-500">{label}</span>
    <span className={`text-xs font-semibold ${highlight ? 'text-red-600' : 'text-gray-900'}`}>{value}</span>
  </div>
);
