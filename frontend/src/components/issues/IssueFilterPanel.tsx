import React from 'react';
import { IssueStatus, IssuePriority, IssueSeverity, ApplicationDTO, ProjectDTO } from '@app-issue-track/shared';
import { Select } from '../common/Select';
import { Filter, RotateCcw } from 'lucide-react';

export interface IssueFilterPanelProps {
  status?: string;
  priority?: string;
  severity?: string;
  applicationId?: string;
  projectId?: string;
  applications: ApplicationDTO[];
  projects: ProjectDTO[];
  onFilterChange: (key: string, value: string) => void;
  onResetFilters: () => void;
}

export const IssueFilterPanel: React.FC<IssueFilterPanelProps> = ({
  status = '',
  priority = '',
  severity = '',
  applicationId = '',
  projectId = '',
  applications,
  projects,
  onFilterChange,
  onResetFilters,
}) => {
  const statusOptions = [
    { value: '', label: 'All Statuses' },
    ...Object.values(IssueStatus).map((s) => ({ value: s, label: s.replace('_', ' ') })),
  ];

  const priorityOptions = [
    { value: '', label: 'All Priorities' },
    ...Object.values(IssuePriority).map((p) => ({ value: p, label: p })),
  ];

  const severityOptions = [
    { value: '', label: 'All Severities' },
    ...Object.values(IssueSeverity).map((sev) => ({ value: sev, label: sev })),
  ];

  const appOptions = [
    { value: '', label: 'All Applications' },
    ...applications.map((app) => ({ value: app.id, label: app.name })),
  ];

  const projectOptions = [
    { value: '', label: 'All Projects' },
    ...projects.map((p) => ({ value: p.id, label: `${p.name} (${p.key})` })),
  ];

  const hasActiveFilters = Boolean(status || priority || severity || applicationId || projectId);

  return (
    <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Filter Issues</span>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="text-xs text-slate-500 hover:text-rose-600 font-medium flex items-center space-x-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <Select
          value={status}
          onChange={(e) => onFilterChange('status', e.target.value)}
          options={statusOptions}
        />
        <Select
          value={priority}
          onChange={(e) => onFilterChange('priority', e.target.value)}
          options={priorityOptions}
        />
        <Select
          value={severity}
          onChange={(e) => onFilterChange('severity', e.target.value)}
          options={severityOptions}
        />
        <Select
          value={applicationId}
          onChange={(e) => onFilterChange('applicationId', e.target.value)}
          options={appOptions}
        />
        <Select
          value={projectId}
          onChange={(e) => onFilterChange('projectId', e.target.value)}
          options={projectOptions}
        />
      </div>
    </div>
  );
};
