import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  dashboardApi,
  SummaryMetrics,
  DistributionMetric,
  DeveloperWorkloadMetric,
  ResolutionMetric,
} from '../services/dashboardApi';
import { projectsApi } from '../services/projectsApi';
import { issuesApi } from '../services/issuesApi';
import { incidentApi } from '../services/incidentApi';
import {
  ProjectDTO,
  ProjectHealth,
  IssueDTO,
  IncidentDTO,
  IssuePriority,
  UserRole,
} from '@app-issue-track/shared';
import { useAuth } from '../context/AuthContext';
import { StatusDistributionChart } from '../components/dashboard/StatusDistributionChart';
import { PriorityDistributionChart } from '../components/dashboard/PriorityDistributionChart';
import { SeverityDistributionChart } from '../components/dashboard/SeverityDistributionChart';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { ErrorState } from '../components/common/ErrorState';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { typography } from '../components/common/designSystem';
import {
  Bug,
  Clock,
  ShieldAlert,
  FolderGit2,
  Lock,
  ShieldCheck,
  RefreshCw,
  Plus,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Users,
  Activity,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const [summary, setSummary] = useState<SummaryMetrics | null>(null);
  const [statusData, setStatusData] = useState<DistributionMetric[]>([]);
  const [priorityData, setPriorityData] = useState<DistributionMetric[]>([]);
  const [severityData, setSeverityData] = useState<DistributionMetric[]>([]);
  const [workloads, setWorkloads] = useState<DeveloperWorkloadMetric[]>([]);
  const [resolution, setResolution] = useState<ResolutionMetric | null>(null);
  const [criticalIssues, setCriticalIssues] = useState<IssueDTO[]>([]);
  const [activeIncidents, setActiveIncidents] = useState<IncidentDTO[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load accessible projects
  useEffect(() => {
    projectsApi
      .getProjects()
      .then((projs) => setProjects(projs))
      .catch(() => {});
  }, []);

  const loadDashboardData = useCallback(
    async (projId?: string) => {
      setError(null);
      try {
        const [
          sumRes,
          statRes,
          prioRes,
          sevRes,
          workRes,
          resRes,
          critRes,
          incRes,
        ] = await Promise.all([
          dashboardApi.getSummaryMetrics(projId),
          dashboardApi.getIssuesByStatus(projId),
          dashboardApi.getIssuesByPriority(projId),
          dashboardApi.getIssuesBySeverity(projId),
          dashboardApi.getDeveloperWorkloads(projId),
          dashboardApi
            .getAverageResolutionTime(projId)
            .catch(() => ({ averageResolutionHours: 0, resolvedCount: 0 })),
          issuesApi
            .getIssues({
              projectId: projId || undefined,
              priority: IssuePriority.CRITICAL,
              limit: 5,
            })
            .then((r) => r.data)
            .catch(() => []),
          incidentApi
            .getIncidents({ projectId: projId || undefined })
            .catch(() => []),
        ]);

        setSummary(sumRes);
        setStatusData(statRes);
        setPriorityData(prioRes);
        setSeverityData(sevRes);
        setWorkloads(workRes);
        setResolution(resRes);
        setCriticalIssues(critRes);
        setActiveIncidents(incRes);
      } catch (err: any) {
        setError(
          err.message ||
            err.response?.data?.error?.message ||
            'Failed to load operational dashboard metrics'
        );
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    setIsLoading(true);
    loadDashboardData(selectedProjectId || undefined);
  }, [selectedProjectId, loadDashboardData]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadDashboardData(selectedProjectId || undefined);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader rows={2} height="h-20" />
        <SkeletonLoader rows={3} height="h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={() => loadDashboardData(selectedProjectId || undefined)}
      />
    );
  }

  // Zero-Project Onboarding State for Unassigned Accounts
  if (summary?.isUnassigned) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-10">
        <div className="bg-white border border-amber-200 rounded-xl p-8 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mx-auto border border-amber-200">
            <Lock className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-lg font-bold text-slate-900">
              Account Pending Project Assignment
            </h2>
            <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
              Your account is active. To access issue tracking workspaces and operational cockpits, an administrator or project lead will need to grant you project membership.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeIssuesCount =
    (summary?.openIssues || 0) + (summary?.inProgressIssues || 0);
  const openIncidents = activeIncidents.filter(
    (inc) => inc.status !== 'CLOSED' && inc.status !== 'RESOLVED'
  );
  const overloadedDevs = workloads.filter(
    (w) => (w.activeIssuesCount ?? w.totalCount ?? 0) >= 5
  );
  const assignedActiveTotal = workloads.reduce(
    (acc, w) => acc + (w.activeIssuesCount ?? w.totalCount ?? 0),
    0
  );
  const unassignedWork = Math.max(activeIssuesCount - assignedActiveTotal, 0);

  return (
    <div className="space-y-6 pb-8">
      {/* Top Workspace Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className={typography.pageTitle}>Engineering Workspace</h1>
          <p className={typography.pageSubtitle}>
            Live operational status across accessible applications and software projects
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {projects.length > 0 && (
            <div className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 shadow-2xs">
              <FolderGit2 className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="text-xs font-semibold bg-transparent text-slate-700 outline-none cursor-pointer pr-1"
                aria-label="Filter dashboard by project"
              >
                <option value="">All Accessible Projects ({projects.length})</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.key})
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            isLoading={isRefreshing}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={() => navigate('/issues/new')}
            leftIcon={<Plus className="w-3.5 h-3.5" />}
          >
            New Issue
          </Button>
        </div>
      </div>

      {/* KPI Overview Metrics Row (6 Primary Facts) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:shadow-subtle hover:border-slate-300 transition-all duration-200 space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Issues
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400 group-hover:scale-125 transition-transform" />
          </div>
          <span className="text-2xl font-mono font-extrabold text-slate-900 block tracking-tight">
            {summary?.totalIssues || 0}
          </span>
          <span className="text-[11px] text-slate-500 truncate block font-medium">
            {summary?.resolvedIssues || 0} resolved
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:shadow-subtle hover:border-blue-200 transition-all duration-200 space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Backlog
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
          </div>
          <span className="text-2xl font-mono font-extrabold text-blue-700 block tracking-tight">
            {activeIssuesCount}
          </span>
          <span className="text-[11px] text-slate-500 truncate block font-medium">
            {summary?.inProgressIssues || 0} in progress
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:shadow-subtle hover:border-rose-200 transition-all duration-200 space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Critical Backlog
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${criticalIssues.length > 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`} />
          </div>
          <span
            className={`text-2xl font-mono font-extrabold block tracking-tight ${
              criticalIssues.length > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            {criticalIssues.length}
          </span>
          <span className="text-[11px] text-slate-500 truncate block font-medium">
            Highest urgency
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:shadow-subtle hover:border-emerald-200 transition-all duration-200 space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              SLA Compliance
            </span>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 group-hover:scale-125 transition-transform" />
          </div>
          <span className="text-2xl font-mono font-extrabold text-emerald-700 block tracking-tight">
            {summary?.slaSummary?.compliancePercentage ?? 100}%
          </span>
          <span className="text-[11px] text-slate-500 truncate block font-medium">
            Target &gt; 95%
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:shadow-subtle hover:border-amber-200 transition-all duration-200 space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              SLA Breaches
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${(summary?.slaSummary?.breachedCount || 0) > 0 ? 'bg-rose-500' : 'bg-slate-300'}`} />
          </div>
          <span
            className={`text-2xl font-mono font-extrabold block tracking-tight ${
              (summary?.slaSummary?.breachedCount || 0) > 0
                ? 'text-rose-600'
                : 'text-slate-900'
            }`}
          >
            {summary?.slaSummary?.breachedCount || 0}
          </span>
          <span className="text-[11px] text-slate-500 truncate block font-medium">
            {summary?.slaSummary?.atRiskCount || 0} at risk
          </span>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-xs hover:shadow-subtle hover:border-slate-300 transition-all duration-200 space-y-1.5 group">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Incidents
            </span>
            <div className={`w-1.5 h-1.5 rounded-full ${openIncidents.length > 0 ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'}`} />
          </div>
          <span
            className={`text-2xl font-mono font-extrabold block tracking-tight ${
              openIncidents.length > 0 ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            {openIncidents.length}
          </span>
          <span className="text-[11px] text-slate-500 truncate block font-medium">
            {activeIncidents.length} total logged
          </span>
        </div>
      </div>

      {/* Engineering Health & SLA Intelligence Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Project Health Card */}
        <Card
          title="Engineering Health"
          subtitle="Real-time composite health telemetry"
          headerAction={
            summary?.slaSummary && (
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${
                  summary.slaSummary.health === ProjectHealth.HEALTHY
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : summary.slaSummary.health === ProjectHealth.AT_RISK
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                {summary.slaSummary.health}
              </span>
            )
          }
        >
          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">SLA Compliance Rating</span>
                <span className={`font-mono font-bold text-sm ${
                  (summary?.slaSummary?.compliancePercentage ?? 100) >= 90
                    ? 'text-emerald-700'
                    : (summary?.slaSummary?.compliancePercentage ?? 100) >= 75
                    ? 'text-amber-700'
                    : 'text-rose-700'
                }`}>
                  {summary?.slaSummary?.compliancePercentage ?? 100}%
                </span>
              </div>
              <ProgressBar
                value={summary?.slaSummary?.compliancePercentage ?? 100}
                size="md"
                colorVariant={
                  (summary?.slaSummary?.compliancePercentage ?? 100) >= 90
                    ? 'emerald'
                    : (summary?.slaSummary?.compliancePercentage ?? 100) >= 75
                      ? 'amber'
                      : 'rose'
                }
              />
              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                <span>Critical Threshold: 75%</span>
                <span>Operational Target: 95%</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase block">Avg Response</span>
                <span className="font-mono font-bold text-slate-800">
                  {summary?.slaSummary?.avgResponseHours !== null
                    ? `${summary?.slaSummary?.avgResponseHours}h`
                    : 'N/A'}
                </span>
              </div>
              <div className="p-2 bg-slate-50 rounded border border-slate-100">
                <span className="text-[10px] text-slate-500 uppercase block">Resolution Avg</span>
                <span className="font-mono font-bold text-brand-700">
                  {(resolution?.averageResolutionHours ?? 0).toFixed(1)}h
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Workload & Developer Capacity */}
        <Card
          title="Team Workload Telemetry"
          subtitle={`${workloads.length} engineers actively assigned`}
          headerAction={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/team')}
              leftIcon={<Users className="w-3.5 h-3.5 text-slate-500" />}
            >
              Team
            </Button>
          }
        >
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between text-slate-600">
              <span>Overloaded Engineers (&gt;5 issues)</span>
              <span
                className={`font-mono font-bold ${
                  overloadedDevs.length > 0 ? 'text-rose-600' : 'text-slate-800'
                }`}
              >
                {overloadedDevs.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Unassigned Issues</span>
              <span className="font-mono font-bold text-amber-700">
                {unassignedWork}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Accessible Workspaces</span>
              <span className="font-mono font-bold text-slate-800">
                {summary?.totalApplications || 0} apps · {summary?.totalProjects || 0} projects
              </span>
            </div>

            <div className="pt-2 border-t border-slate-100">
              {(user?.role === UserRole.ADMIN || user?.role === UserRole.PROJECT_MANAGER) && (
                <button
                  onClick={() => navigate('/command-center')}
                  className="w-full text-center text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center justify-center gap-1 mt-1 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Open Engineering Command Center →</span>
                </button>
              )}
            </div>
          </div>
        </Card>

        {/* Operational Incident Status */}
        <Card
          title="Operational Incidents"
          subtitle="Real-time production issue escalations"
          headerAction={
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/incidents')}
              leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-rose-500" />}
            >
              All
            </Button>
          }
        >
          {openIncidents.length === 0 ? (
            <div className="py-6 text-center space-y-1 text-slate-500 text-xs">
              <ShieldCheck className="w-6 h-6 text-emerald-500 mx-auto" />
              <p className="font-semibold text-slate-800">Zero Unresolved Incidents</p>
              <p className="text-[11px] text-slate-400">All systems operating within acceptable parameters.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {openIncidents.slice(0, 3).map((inc) => (
                <div
                  key={inc.id}
                  onClick={() => navigate(`/incidents/${inc.id}`)}
                  className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg border border-slate-200/80 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div className="min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-rose-600">
                        {inc.incidentKey}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded">
                        {inc.severity}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 truncate mt-0.5">
                      {inc.title}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-600 uppercase bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                    {inc.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Critical Backlog / High Urgency Action Items */}
      <Card
        title="Critical Backlog Items"
        subtitle="Issues requiring immediate engineering triage or resolution"
        headerAction={
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/issues')}
            leftIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            All Issues
          </Button>
        }
      >
        {criticalIssues.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500">
            No critical priority issues in this project scope.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {criticalIssues.map((iss) => (
              <div
                key={iss.id}
                onClick={() => navigate(`/issues/${iss.id}`)}
                className="py-2.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-md cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-1.5 py-0.5 rounded border border-brand-200 shrink-0">
                    {iss.issueKey}
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {iss.title}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span>{iss.applicationName || 'App'}</span>
                      <span>·</span>
                      <span>{iss.projectName || 'Project'}</span>
                      {iss.moduleComponent && (
                        <>
                          <span>·</span>
                          <span className="font-mono">{iss.moduleComponent}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <PriorityBadge priority={iss.priority} />
                  <SeverityBadge severity={iss.severity} />
                  <StatusBadge status={iss.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Issue Distribution Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Distribution by Status" subtitle="Workflow progression across issues">
          <StatusDistributionChart data={statusData} />
        </Card>

        <Card title="Distribution by Priority & Severity" subtitle="Defect categorization breakdown">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Priority
              </h4>
              <PriorityDistributionChart data={priorityData} />
            </div>
            <div>
              <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Severity
              </h4>
              <SeverityDistributionChart data={severityData} />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
