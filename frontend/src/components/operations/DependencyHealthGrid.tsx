import React from 'react';
import { Database, Server, HardDrive, Brain } from 'lucide-react';
import type { SystemDependencies } from '../../services/operationsApi';

interface Props {
  dependencies: SystemDependencies;
}

function statusColor(status: string): string {
  if (status === 'HEALTHY' || status === 'CONFIGURED') return 'text-green-600 bg-green-50 border-green-200';
  if (status === 'DEGRADED' || status === 'DISABLED') return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  return 'text-red-600 bg-red-50 border-red-200';
}

function statusDot(status: string): string {
  if (status === 'HEALTHY' || status === 'CONFIGURED') return 'bg-green-500';
  if (status === 'DEGRADED' || status === 'DISABLED') return 'bg-yellow-500';
  return 'bg-red-500';
}

export const DependencyHealthGrid: React.FC<Props> = ({ dependencies }) => {
  const items = [
    {
      label: 'Database',
      icon: Database,
      status: dependencies.database.status,
      detail: `${dependencies.database.latencyMs}ms latency`,
    },
    {
      label: 'Storage',
      icon: HardDrive,
      status: dependencies.storage.status,
      detail: 'Local filesystem',
    },
    {
      label: 'AI Provider',
      icon: Brain,
      status: dependencies.ai.status,
      detail: `${dependencies.ai.provider} / ${dependencies.ai.model}`,
    },
    {
      label: 'API Server',
      icon: Server,
      status: 'HEALTHY',
      detail: 'Process running',
    },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Dependency Health</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map(({ label, icon: Icon, status, detail }) => (
          <div key={label} className={`flex items-start gap-3 p-3 rounded-lg border ${statusColor(status)}`}>
            <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${statusDot(status)}`} />
                <p className="text-xs font-semibold">{label}</p>
              </div>
              <p className="text-xs opacity-75 mt-0.5 truncate">{status}</p>
              <p className="text-xs opacity-60 mt-0.5 truncate">{detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
