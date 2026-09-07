import React from 'react';
import { ProjectDTO } from '@app-issue-track/shared';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { RefreshCw, LayoutDashboard } from 'lucide-react';

interface CommandCenterFiltersProps {
  projects: ProjectDTO[];
  selectedProjectId: string;
  onSelectProject: (projectId: string) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const CommandCenterFilters: React.FC<CommandCenterFiltersProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-brand-50 text-brand-600 rounded-lg flex items-center justify-center border border-brand-100 shrink-0">
          <LayoutDashboard className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight">Engineering Command Center</h1>
          <p className="text-xs text-slate-500">Live operational engineering intelligence & predictive SLA risk</p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <div className="w-64">
          <Select
            label=""
            value={selectedProjectId}
            onChange={(e) => onSelectProject(e.target.value)}
            options={projects.map((p) => ({ label: `${p.name} (${p.key})`, value: p.id }))}
            disabled={projects.length === 0}
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
