import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { issuesApi } from '../services/issuesApi';
import { applicationsApi } from '../services/applicationsApi';
import { projectsApi } from '../services/projectsApi';
import {
  IssueDTO,
  ApplicationDTO,
  ProjectDTO,
  IssueStatus,
  IssuePriority,
  IssueSeverity,
} from '@app-issue-track/shared';
import { useAuth } from '../context/AuthContext';
import { IssueTable } from '../components/issues/IssueTable';
import { IssueFilterPanel } from '../components/issues/IssueFilterPanel';
import { SearchBar } from '../components/common/SearchBar';
import { Button } from '../components/common/Button';
import { Pagination } from '../components/common/Pagination';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { AccessLockedCard } from '../components/common/AccessLockedCard';
import { useDebounce } from '../hooks/useDebounce';
import { typography } from '../components/common/designSystem';
import { Plus, Bug, Filter, SlidersHorizontal } from 'lucide-react';

type QuickFilter = 'all' | 'open' | 'in_progress' | 'critical' | 'assigned_to_me';

export const IssuesPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const [issues, setIssues] = useState<IssueDTO[]>([]);
  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quick Filter State
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Search & Detailed Filters
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 250);

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    severity: '',
    applicationId: '',
    projectId: '',
  });
  const assigneeIdFromUrl = searchParams.get('assigneeId') || undefined;

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    totalItems: 0,
    totalPages: 1,
  });

  const loadMetadata = async () => {
    try {
      const [apps, projs] = await Promise.all([
        applicationsApi.getApplications(),
        projectsApi.getProjects(),
      ]);
      setApplications(apps);
      setProjects(projs);
    } catch {
      // Handled gracefully
    }
  };

  const loadIssues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Determine effective filters based on quick filter
      let effectiveStatus = (filters.status as IssueStatus) || undefined;
      let effectivePriority = (filters.priority as IssuePriority) || undefined;
      let effectiveAssigneeId: string | undefined = assigneeIdFromUrl;

      if (quickFilter === 'open') {
        effectiveStatus = IssueStatus.OPEN;
      } else if (quickFilter === 'in_progress') {
        effectiveStatus = IssueStatus.IN_PROGRESS;
      } else if (quickFilter === 'critical') {
        effectivePriority = IssuePriority.CRITICAL;
      } else if (quickFilter === 'assigned_to_me' && user) {
        effectiveAssigneeId = user.id;
      }

      const result = await issuesApi.getIssues({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        status: effectiveStatus,
        priority: effectivePriority,
        severity: (filters.severity as IssueSeverity) || undefined,
        applicationId: filters.applicationId || undefined,
        projectId: filters.projectId || undefined,
        assigneeId: effectiveAssigneeId,
      });

      setIssues(result.data);
      setPagination((prev) => ({
        ...prev,
        totalItems: result.pagination?.totalItems || 0,
        totalPages: result.pagination?.totalPages || 1,
      }));
    } catch (err: any) {
      setError(
        err.message ||
          err.response?.data?.error?.message ||
          'Failed to load issues from workspace'
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    debouncedSearch,
    filters,
    quickFilter,
    user,
    assigneeIdFromUrl,
  ]);

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const handleQuickFilter = (qf: QuickFilter) => {
    setQuickFilter(qf);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setQuickFilter('all');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({
      status: '',
      priority: '',
      severity: '',
      applicationId: '',
      projectId: '',
    });
    setSearch('');
    setQuickFilter('all');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasAdvancedFilters = Boolean(
    filters.status ||
      filters.priority ||
      filters.severity ||
      filters.applicationId ||
      filters.projectId
  );

  return (
    <div className="space-y-4 pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className={typography.pageTitle}>Issues Workspace</h1>
          <p className={typography.pageSubtitle}>
            Triage, track, and resolve software engineering issues across applications
          </p>
        </div>

        <Button
          size="sm"
          onClick={() => navigate('/issues/new')}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Report Issue
        </Button>
      </div>

      {/* Quick Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 select-none">
          <button
            onClick={() => handleQuickFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              quickFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100/70'
            }`}
          >
            All Issues
          </button>
          <button
            onClick={() => handleQuickFilter('open')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              quickFilter === 'open'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100/70'
            }`}
          >
            Open
          </button>
          <button
            onClick={() => handleQuickFilter('in_progress')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              quickFilter === 'in_progress'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100/70'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => handleQuickFilter('critical')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              quickFilter === 'critical'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100/70'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => handleQuickFilter('assigned_to_me')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
              quickFilter === 'assigned_to_me'
                ? 'bg-brand-600 text-white shadow-2xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100/70'
            }`}
          >
            Assigned to Me
          </button>
        </div>

        {/* Search & Filter Trigger */}
        <div className="flex items-center gap-2">
          <div className="w-full md:w-72">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search title, description, or key..."
            />
          </div>
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className={`p-2 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
              showFilters || hasAdvancedFilters
                ? 'bg-brand-50 border-brand-300 text-brand-700'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
            title="Toggle advanced filters"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasAdvancedFilters && (
              <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {/* Expandable Advanced Filter Panel */}
      {showFilters && (
        <IssueFilterPanel
          status={filters.status}
          priority={filters.priority}
          severity={filters.severity}
          applicationId={filters.applicationId}
          projectId={filters.projectId}
          applications={applications}
          projects={projects}
          onFilterChange={handleFilterChange}
          onResetFilters={handleResetFilters}
        />
      )}

      {/* Result Meta Bar */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-0.5">
        <span>
          Showing <strong className="text-slate-800">{issues.length}</strong> of{' '}
          <strong className="text-slate-800">{pagination.totalItems}</strong> matching issues
        </span>
        {(search || hasAdvancedFilters || quickFilter !== 'all') && (
          <button
            onClick={handleResetFilters}
            className="text-brand-600 hover:underline text-[11px] font-medium"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Main Table Content */}
      {isLoading ? (
        <SkeletonLoader rows={8} height="h-10" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadIssues} />
      ) : issues.length === 0 ? (
        projects.length === 0 && applications.length === 0 ? (
          <AccessLockedCard featureName="Issues List" />
        ) : (
          <EmptyState
            title="No matching issues"
            description="There are no reported issues matching your current search or filter criteria."
            why="Check if different filter combinations (status, priority, or project) reveal active issues."
            actionLabel="Report New Issue"
            onAction={() => navigate('/issues/new')}
            secondaryActionLabel="Reset Filters"
            onSecondaryAction={handleResetFilters}
            icon={<Bug className="w-7 h-7 text-slate-400" />}
          />
        )
      ) : (
        <div className="space-y-3">
          <IssueTable issues={issues} />
          <Pagination
            page={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.totalItems}
            limit={pagination.limit}
            onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
          />
        </div>
      )}
    </div>
  );
};

export default IssuesPage;
