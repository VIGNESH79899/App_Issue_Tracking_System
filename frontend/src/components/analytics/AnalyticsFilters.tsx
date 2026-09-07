import React from 'react';
import { ProjectDTO } from '@app-issue-track/shared';
import { Select } from '../common/Select';
import { Button } from '../common/Button';
import { RefreshCw } from 'lucide-react';

interface AnalyticsFiltersProps {
  projects: ProjectDTO[];
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  period: '7d' | '14d' | '30d';
  onSelectPeriod: (p: '7d' | '14d' | '30d') => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({
  projects,
  selectedProjectId,
  onSelectProject,
  period,
  onSelectPeriod,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-subtle">
      <div className="flex items-center space-x-3">
        <div className="w-60">
          <Select
            label=""
            value={selectedProjectId}
            onChange={(e) => onSelectProject(e.target.value)}
            options={projects.map((p) => ({ label: `${p.name} (${p.key})`, value: p.id }))}
            disabled={projects.length === 0}
          />
        </div>

        <div className="flex items-center space-x-1 font-mono text-[10px] font-bold">
          {(['7d', '14d', '30d'] as const).map((p) => (
            <button
              type="button"
              key={p}
              onClick={() => onSelectPeriod(p)}
              className={`px-2.5 py-1 rounded border transition-colors ${
                period === p
                  ? 'bg-brand-600 text-white border-brand-600'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {p}
            </button>
          ))}
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
