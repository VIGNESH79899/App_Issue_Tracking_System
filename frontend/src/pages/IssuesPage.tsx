import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { issuesApi } from '../services/issuesApi';
import { applicationsApi } from '../services/applicationsApi';
import { projectsApi } from '../services/projectsApi';
import { IssueDTO, ApplicationDTO, ProjectDTO, IssueStatus, IssuePriority, IssueSeverity } from '@app-issue-track/shared';
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
import { Plus, Bug } from 'lucide-react';

export const IssuesPage: React.FC = () => {
  const navigate = useNavigate();
  const [issues, setIssues] = useState<IssueDTO[]>([]);
  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    severity: '',
    applicationId: '',
    projectId: '',
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
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
      // Non-critical metadata failure handled gracefully
    }
  };

  const loadIssues = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await issuesApi.getIssues({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        status: (filters.status as IssueStatus) || undefined,
        priority: (filters.priority as IssuePriority) || undefined,
        severity: (filters.severity as IssueSeverity) || undefined,
        applicationId: filters.applicationId || undefined,
        projectId: filters.projectId || undefined,
      });

      setIssues(result.data);
      setPagination((prev) => ({
        ...prev,
        totalItems: result.pagination?.totalItems || 0,
        totalPages: result.pagination?.totalPages || 1,
      }));
    } catch (err: any) {
      setError(err.message || err.response?.data?.error?.message || 'Failed to fetch issues');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, filters]);

  useEffect(() => {
    loadMetadata();
  }, []);

  useEffect(() => {
    loadIssues();
  }, [loadIssues]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ status: '', priority: '', severity: '', applicationId: '', projectId: '' });
    setSearch('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Issue Tracking Workspace</h1>
          <p className="text-xs text-slate-500 mt-1">Search, filter, and track reported software issues across projects</p>
        </div>

        <Button size="sm" onClick={() => navigate('/issues/new')} leftIcon={<Plus className="w-4 h-4" />}>
          Report New Issue
        </Button>
      </div>

      {/* Filter Bar & Search */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search issues by title or key (e.g. PAY-101)..." />
        </div>

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
      </div>

      {/* Main Table Content */}
      {isLoading ? (
        <SkeletonLoader rows={6} height="h-12" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadIssues} />
      ) : issues.length === 0 ? (
        projects.length === 0 && applications.length === 0 ? (
          <AccessLockedCard featureName="Issues List" />
        ) : (
          <EmptyState
            title="No issues found"
            description="There are no reported issues matching your current search or filter criteria."
            actionLabel="Report New Issue"
            onAction={() => navigate('/issues/new')}
            icon={<Bug className="w-8 h-8" />}
          />
        )
      ) : (
        <div className="space-y-0">
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
