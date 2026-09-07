import React from 'react';
import { Database } from 'lucide-react';
import type { SystemDependencies } from '../../services/operationsApi';

interface Props {
  db: SystemDependencies['database'];
  databaseFailures: number;
}

export const DatabaseStatusCard: React.FC<Props> = ({ db, databaseFailures }) => {
  const color = db.status === 'HEALTHY'
    ? 'text-green-600 bg-green-50 border-green-200'
    : 'text-red-600 bg-red-50 border-red-200';

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Database className="w-4 h-4 text-blue-500" />
        <h3 className="text-sm font-semibold text-gray-900">Database</h3>
        <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full border ${color}`}>
          {db.status}
        </span>
      </div>
      <div className="space-y-3">
        <Row label="Status" value={db.status} />
        <Row label="Health Check Latency" value={`${db.latencyMs}ms`} highlight={db.latencyMs > 200} />
        <Row label="Connection Failures (lifetime)" value={databaseFailures.toLocaleString()} highlight={databaseFailures > 0} />
        <Row label="Type" value="PostgreSQL (Prisma ORM)" />
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
