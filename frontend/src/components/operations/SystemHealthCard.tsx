import React from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { SystemMetrics } from '../../services/operationsApi';

interface Props {
  metrics: SystemMetrics;
  uptimeSeconds: number;
}

function formatUptime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export const SystemHealthCard: React.FC<Props> = ({ metrics, uptimeSeconds }) => {
  const errorRate = metrics.totalRequests > 0
    ? Math.round((metrics.serverErrors / metrics.totalRequests) * 100)
    : 0;

  const status = errorRate >= 10 ? 'DEGRADED' : metrics.totalRequests > 0 ? 'HEALTHY' : 'IDLE';

  const statusConfig = {
    HEALTHY: { label: 'Healthy', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
    DEGRADED: { label: 'Degraded', icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
    IDLE: { label: 'Idle', icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
  }[status];

  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-900">System Status</h3>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.color}`}>
          <StatusIcon className="w-3.5 h-3.5" />
          {statusConfig.label}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Stat label="Total Requests" value={metrics.totalRequests.toLocaleString()} />
        <Stat label="Successful" value={metrics.successfulRequests.toLocaleString()} color="text-green-600" />
        <Stat label="4xx Errors" value={metrics.clientErrors.toLocaleString()} color="text-yellow-600" />
        <Stat label="5xx Errors" value={metrics.serverErrors.toLocaleString()} color={metrics.serverErrors > 0 ? 'text-red-600' : undefined} />
        <Stat label="Avg Response" value={`${metrics.averageResponseMs}ms`} />
        <Stat label="Slow Requests" value={metrics.slowRequests.toLocaleString()} color={metrics.slowRequests > 0 ? 'text-yellow-600' : undefined} />
        <Stat label="Rate Limited" value={metrics.rateLimitedRequests.toLocaleString()} />
        <Stat label="Uptime" value={formatUptime(uptimeSeconds)} />
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`text-base font-semibold ${color ?? 'text-gray-900'}`}>{value}</p>
  </div>
);
