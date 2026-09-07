import React, { useEffect, useState, useCallback } from 'react';
import { dashboardApi, SummaryMetrics, DistributionMetric, DeveloperWorkloadMetric, ResolutionMetric } from '../services/dashboardApi';
import { projectsApi } from '../services/projectsApi';
import { ProjectDTO, ProjectHealth } from '@app-issue-track/shared';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/dashboard/MetricCard';
import { StatusDistributionChart } from '../components/dashboard/StatusDistributionChart';
import { PriorityDistributionChart } from '../components/dashboard/PriorityDistributionChart';
import { SeverityDistributionChart } from '../components/dashboard/SeverityDistributionChart';
import { DeveloperWorkloadTable } from '../components/dashboard/DeveloperWorkloadTable';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { ErrorState } from '../components/common/ErrorState';
import { Bug, Clock, CheckCircle2, Layers, ShieldAlert, FolderGit2, Lock, ShieldCheck } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  const [summary, setSummary] = useState<SummaryMetrics | null>(null);
  const [statusData, setStatusData] = useState<DistributionMetric[]>([]);
  const [priorityData, setPriorityData] = useState<DistributionMetric[]>([]);
  const [severityData, setSeverityData] = useState<DistributionMetric[]>([]);
  const [workloads, setWorkloads] = useState<DeveloperWorkloadMetric[]>([]);
  const [resolution, setResolution] = useState<ResolutionMetric | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load project dropdown options
  useEffect(() => {
    projectsApi.getProjects().then((projs) => setProjects(projs)).catch(() => {});
  }, []);

  const loadDashboardData = useCallback(async (projId?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [sumRes, statRes, prioRes, sevRes, workRes, resRes] = await Promise.all([
        dashboardApi.getSummaryMetrics(projId),
        dashboardApi.getIssuesByStatus(projId),
        dashboardApi.getIssuesByPriority(projId),
        dashboardApi.getIssuesBySeverity(projId),
        dashboardApi.getDeveloperWorkloads(projId),
        dashboardApi.getAverageResolutionTime(projId).catch(() => ({ averageResolutionHours: 0, resolvedCount: 0 })),
      ]);

      setSummary(sumRes);
      setStatusData(statRes);
      setPriorityData(prioRes);
      setSeverityData(sevRes);
      setWorkloads(workRes);
      setResolution(resRes);
    } catch (err: any) {
      setError(err.message || err.response?.data?.error?.message || 'Failed to load dashboard metrics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData(selectedProjectId || undefined);
  }, [selectedProjectId, loadDashboardData]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader rows={2} height="h-24" />
        <SkeletonLoader rows={2} height="h-64" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={() => loadDashboardData(selectedProjectId || undefined)} />;
  }

  // Zero-Project Onboarding State for Unassigned Accounts
  if (summary?.isUnassigned) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
            <p className="text-xs text-slate-500 mt-1">
              Welcome, <span className="font-semibold text-slate-700">{user?.firstName} {user?.lastName}</span> ({user?.role})
            </p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-300 rounded-xl p-8 text-center space-y-4 max-w-2xl mx-auto shadow-md my-8 relative overflow-hidden">
          <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto border border-amber-300">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-amber-900">Account Pending Project Assignment</h2>
            <p className="text-xs text-amber-800 max-w-lg mx-auto leading-relaxed">
              Please wait until an administrator or project lead assigns your account to a project. Once assigned, your issue tracking, project workspace, and team tools will be unlocked automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Engineering Command Center CTA Banner for Admins & PMs */}
      {(user?.role === 'ADMIN' || user?.role === 'PROJECT_MANAGER') && (
        <div className="bg-slate-900 text-white rounded-xl p-4 flex items-center justify-between shadow-subtle border border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">Engineering Command Center</h3>
              <p className="text-xs text-slate-400">View live project health, predictive SLA risk, capacity metrics, and AI briefings.</p>
            </div>
          </div>
          <a
            href="/command-center"
            className="text-xs font-bold bg-brand-600 hover:bg-brand-500 text-white px-3.5 py-2 rounded-lg transition-colors shrink-0"
          >
            Launch Command Center →
          </a>
        </div>
      )}

      {/* Header Welcome & Project Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome back, <span className="font-semibold text-slate-700">{user?.firstName} {user?.lastName}</span> ({user?.role})
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {projects.length > 0 && (
            <div className="flex items-center space-x-2">
              <FolderGit2 className="w-4 h-4 text-slate-400" />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-md px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-brand-500 shadow-sm"
              >
                <option value="">All My Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.key})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="text-xs font-mono bg-white px-3 py-1.5 rounded-md border border-slate-200 shadow-subtle text-slate-600">
            Resolution Avg: <span className="font-bold text-brand-600">{(resolution?.averageResolutionHours ?? 0).toFixed(1)} hrs</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Issues"
          value={summary?.totalIssues || 0}
          subtitle={`${summary?.openIssues || 0} currently open`}
          icon={<Bug className="w-5 h-5" />}
          colorVariant="brand"
        />
        <MetricCard
          title="In Progress"
          value={summary?.inProgressIssues || 0}
          subtitle="Actively worked on"
          icon={<Clock className="w-5 h-5" />}
          colorVariant="amber"
        />
        <MetricCard
          title="Resolved / Closed"
          value={(summary?.resolvedIssues || 0) + (summary?.closedIssues || 0)}
          subtitle="Fixed issues in workspace"
          icon={<CheckCircle2 className="w-5 h-5" />}
          colorVariant="emerald"
        />
        <MetricCard
          title="Applications & Projects"
          value={`${summary?.totalApplications || 0} / ${summary?.totalProjects || 0}`}
          subtitle="Accessible workspace bounds"
          icon={<Layers className="w-5 h-5" />}
          colorVariant="slate"
        />
      </div>

      {/* SLA Intelligence & Project Health Grid */}
      {summary?.slaSummary && (
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                SLA Intelligence & Project Health
              </h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">Project Health:</span>
              {summary.slaSummary.health === ProjectHealth.HEALTHY && (
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[10px] px-2.5 py-0.5 rounded uppercase">
                  HEALTHY
                </span>
              )}
              {summary.slaSummary.health === ProjectHealth.AT_RISK && (
                <span className="bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[10px] px-2.5 py-0.5 rounded uppercase">
                  AT RISK
                </span>
              )}
              {summary.slaSummary.health === ProjectHealth.CRITICAL && (
                <span className="bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[10px] px-2.5 py-0.5 rounded uppercase">
                  CRITICAL
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SLA Compliance</span>
              <span className="text-lg font-bold text-slate-900 font-mono mt-0.5 block">{summary.slaSummary.compliancePercentage}%</span>
            </div>
            <div className="p-3 bg-amber-50/60 rounded border border-amber-200">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">At Risk Issues</span>
              <span className="text-lg font-bold text-amber-900 font-mono mt-0.5 block">{summary.slaSummary.atRiskCount}</span>
            </div>
            <div className="p-3 bg-rose-50/60 rounded border border-rose-200">
              <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">Breached Issues</span>
              <span className="text-lg font-bold text-rose-900 font-mono mt-0.5 block">{summary.slaSummary.breachedCount}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Avg Response</span>
              <span className="text-lg font-bold text-slate-900 font-mono mt-0.5 block">
                {summary.slaSummary.avgResponseHours !== null ? `${summary.slaSummary.avgResponseHours}h` : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Distribution Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-subtle">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Issues by Status
          </h3>
          <StatusDistributionChart data={statusData} />
        </div>

        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-subtle">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
            Issues by Priority & Severity
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-semibold text-slate-500 mb-2">Priority</h4>
              <PriorityDistributionChart data={priorityData} />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-slate-500 mb-2">Severity</h4>
              <SeverityDistributionChart data={severityData} />
            </div>
          </div>
        </div>
      </div>

      {/* Developer Workloads Table */}
      <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-subtle">
        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
          Developer Active Workload
        </h3>
        <DeveloperWorkloadTable workload={workloads} />
      </div>
    </div>
  );
};
