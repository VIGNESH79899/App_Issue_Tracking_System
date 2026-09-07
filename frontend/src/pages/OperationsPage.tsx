import React, { useEffect, useState, useCallback } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { operationsApi, OperationsOverview, SecurityEvent } from '../services/operationsApi';
import { SystemHealthCard } from '../components/operations/SystemHealthCard';
import { DependencyHealthGrid } from '../components/operations/DependencyHealthGrid';
import { ApiPerformanceTable } from '../components/operations/ApiPerformanceTable';
import { SecurityEventsCard } from '../components/operations/SecurityEventsCard';
import { AIProviderStatus } from '../components/operations/AIProviderStatus';
import { DatabaseStatusCard } from '../components/operations/DatabaseStatusCard';
import { OperationsTimeline } from '../components/operations/OperationsTimeline';
import { OperationsSkeleton, OperationsEmptyState } from '../components/operations/OperationsSkeleton';

const OperationsPage: React.FC = () => {
  const [overview, setOverview] = useState<OperationsOverview | null>(null);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [ov, events] = await Promise.all([
        operationsApi.getOverview(),
        operationsApi.getSecurityEvents(30),
      ]);
      setOverview(ov);
      setSecurityEvents(events);
      setLastRefreshed(new Date());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load operations data';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className="p-6"><OperationsSkeleton /></div>;
  if (error) return <div className="p-6"><OperationsEmptyState /></div>;
  if (!overview) return <div className="p-6"><OperationsEmptyState /></div>;

  return (
    <div className="p-6 max-w-screen-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">System Operations</h1>
            <p className="text-sm text-gray-500">
              {overview.system.environment.toUpperCase()} · Node {overview.system.nodeVersion} · {overview.system.memoryMb}MB heap
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {lastRefreshed && (
            <span className="text-xs text-gray-400">
              Refreshed {lastRefreshed.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={load}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* Top row: Health + Dependencies + Database */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SystemHealthCard
          metrics={overview.metrics}
          uptimeSeconds={overview.system.uptimeSeconds}
        />
        <DependencyHealthGrid dependencies={overview.dependencies} />
        <DatabaseStatusCard
          db={overview.dependencies.database}
          databaseFailures={overview.metrics.databaseFailures}
        />
      </div>

      {/* Middle row: Security + AI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SecurityEventsCard counts={overview.security} />
        <AIProviderStatus ai={overview.dependencies.ai} metrics={overview.metrics} />
      </div>

      {/* API Performance table */}
      <ApiPerformanceTable stats={overview.endpointStats} />

      {/* Security Event Timeline */}
      <OperationsTimeline events={securityEvents} />
    </div>
  );
};

export default OperationsPage;
