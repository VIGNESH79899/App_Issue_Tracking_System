import React from 'react';
import { ProjectDTO, IncidentSeverity, IncidentStatus } from '@app-issue-track/shared';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { RefreshCw, ShieldAlert } from 'lucide-react';

interface IncidentFiltersProps {
  projects: ProjectDTO[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  selectedSeverity?: IncidentSeverity;
  onSelectSeverity: (s?: IncidentSeverity) => void;
  selectedStatus?: IncidentStatus;
  onSelectStatus: (st?: IncidentStatus) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const IncidentFilters: React.FC<IncidentFiltersProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  selectedSeverity,
  onSelectSeverity,
  selectedStatus,
  onSelectStatus,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center border border-rose-100 shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Incident Command Center</h1>
          <p className="text-xs text-slate-500">Live operational incident management & automated escalation</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="w-48">
          <Select
            label=""
            value={selectedProjectId}
            onChange={(e) => onSelectProject(e.target.value)}
            options={projects.map((p) => ({ label: `${p.name} (${p.key})`, value: p.id }))}
            disabled={projects.length === 0}
          />
        </div>

        <div className="w-32">
          <Select
            label=""
            value={selectedSeverity || ''}
            onChange={(e) => onSelectSeverity((e.target.value as IncidentSeverity) || undefined)}
            options={[
              { label: 'All Severities', value: '' },
              { label: 'SEV1', value: 'SEV1' },
              { label: 'SEV2', value: 'SEV2' },
              { label: 'SEV3', value: 'SEV3' },
              { label: 'SEV4', value: 'SEV4' },
            ]}
          />
        </div>

        <div className="w-36">
          <Select
            label=""
            value={selectedStatus || ''}
            onChange={(e) => onSelectStatus((e.target.value as IncidentStatus) || undefined)}
            options={[
              { label: 'All Statuses', value: '' },
              { label: 'DETECTED', value: 'DETECTED' },
              { label: 'ACKNOWLEDGED', value: 'ACKNOWLEDGED' },
              { label: 'INVESTIGATING', value: 'INVESTIGATING' },
              { label: 'MITIGATING', value: 'MITIGATING' },
              { label: 'RESOLVED', value: 'RESOLVED' },
              { label: 'CLOSED', value: 'CLOSED' },
            ]}
          />
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          isLoading={isRefreshing}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
};
