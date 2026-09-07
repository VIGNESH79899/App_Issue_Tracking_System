import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ProjectDTO,
  CommandCenterOverview,
  DeveloperCapacitySummary,
  ComponentRiskSummary,
  EngineeringBottleneck,
  TrendPoint,
  CriticalIssueSummary,
  AIProjectBriefing,
} from '@app-issue-track/shared';
import { projectsApi } from '../services/projectsApi';
import { commandCenterApi } from '../services/commandCenterApi';
import { useToast } from '../context/ToastContext';
import { CommandCenterFilters } from '../components/command-center/CommandCenterFilters';
import { ProjectHealthCard } from '../components/command-center/ProjectHealthCard';
import { HealthBreakdown } from '../components/command-center/HealthBreakdown';
import { EngineeringTrendChart } from '../components/command-center/EngineeringTrendChart';
import { DeveloperCapacityTable } from '../components/command-center/DeveloperCapacityTable';
import { ComponentRiskTable } from '../components/command-center/ComponentRiskTable';
import { EngineeringBottlenecks } from '../components/command-center/EngineeringBottlenecks';
import { CriticalIssuesTable } from '../components/command-center/CriticalIssuesTable';
import { AIEngineeringBriefing } from '../components/command-center/AIEngineeringBriefing';
import { CommandCenterSkeleton } from '../components/command-center/CommandCenterSkeleton';
import { CommandCenterEmptyState } from '../components/command-center/CommandCenterEmptyState';
import { ShieldAlert, Activity, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

export const EngineeringCommandCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Data States
  const [overview, setOverview] = useState<CommandCenterOverview | null>(null);
  const [trends, setTrends] = useState<{ period: string; points: TrendPoint[] }>({ period: '7d', points: [] });
  const [period, setPeriod] = useState<'7d' | '14d' | '30d'>('7d');
  const [developers, setDevelopers] = useState<DeveloperCapacitySummary[]>([]);
  const [components, setComponents] = useState<ComponentRiskSummary[]>([]);
  const [bottlenecks, setBottlenecks] = useState<EngineeringBottleneck[]>([]);
  const [criticalIssues, setCriticalIssues] = useState<CriticalIssueSummary[]>([]);
  const [briefing, setBriefing] = useState<AIProjectBriefing | null>(null);
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);

  // Load project metadata
  useEffect(() => {
    async function loadProjects() {
      try {
        const projs = await projectsApi.getProjects();
        setProjects(projs);
        if (projs.length > 0) {
          setSelectedProjectId(projs[0].id);
        }
      } catch {
        toast.error('Failed to load project metadata');
      } finally {
        setIsLoadingMeta(false);
      }
    }
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch Command Center metrics for selected project
  const fetchMetrics = useCallback(async (projId: string, currentPeriod: '7d' | '14d' | '30d') => {
    if (!projId) return;
    setIsRefreshing(true);
    try {
      const [over, tr, devs, comps, bn, crit] = await Promise.all([
        commandCenterApi.getOverview(projId),
        commandCenterApi.getTrends(projId, currentPeriod),
        commandCenterApi.getDevelopers(projId),
        commandCenterApi.getComponents(projId),
        commandCenterApi.getBottlenecks(projId),
        commandCenterApi.getCriticalIssues(projId),
      ]);

      setOverview(over);
      setTrends(tr);
      setDevelopers(devs);
      setComponents(comps);
      setBottlenecks(bn);
      setCriticalIssues(crit);

      // Async briefing load
      setIsBriefingLoading(true);
      commandCenterApi
        .getBriefing(projId)
        .then(setBriefing)
        .catch(() => setBriefing(null))
        .finally(() => setIsBriefingLoading(false));
    } catch (err: any) {
      toast.error('Command Center Error', err.message || 'Failed to fetch command center metrics');
    } finally {
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchMetrics(selectedProjectId, period);
    }
  }, [selectedProjectId, period, fetchMetrics]);

  if (isLoadingMeta) {
    return <CommandCenterSkeleton />;
  }

  if (projects.length === 0 || !selectedProjectId) {
    return <CommandCenterEmptyState />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Filter Bar */}
      <CommandCenterFilters
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        onRefresh={() => fetchMetrics(selectedProjectId, period)}
        isRefreshing={isRefreshing}
      />

      {/* KPI Overview Cards */}
      {overview && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-subtle">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Health Score</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold font-mono text-slate-900">{overview.health.score}</span>
              <span className="text-[10px] font-bold font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">
                {overview.health.level}
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-subtle">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active Backlog</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold font-mono text-slate-900">{overview.activeIssueCount}</span>
              <Activity className="w-4 h-4 text-brand-600" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-subtle">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Critical Issues</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold font-mono text-rose-700">{overview.criticalIssueCount}</span>
              <ShieldAlert className="w-4 h-4 text-rose-600" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-subtle">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SLA Compliance</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold font-mono text-emerald-700">{overview.slaCompliancePercentage}%</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-subtle">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SLA Breached</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold font-mono text-rose-700">{overview.slaBreachedCount}</span>
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-subtle">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SLA At-Risk</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold font-mono text-amber-700">{overview.slaAtRiskCount}</span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
          </div>
        </div>
      )}

      {/* Middle Section 1: Health & Trends */}
      {overview && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ProjectHealthCard health={overview.health} />
          <HealthBreakdown breakdown={overview.health.breakdown} />
          <EngineeringTrendChart period={period} points={trends.points} onPeriodChange={setPeriod} />
        </div>
      )}

      {/* AI Executive Briefing */}
      <AIEngineeringBriefing briefing={briefing} isLoading={isBriefingLoading} />

      {/* Middle Section 2: Bottlenecks */}
      <EngineeringBottlenecks bottlenecks={bottlenecks} />

      {/* Lower Section: Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DeveloperCapacityTable developers={developers} />
        <ComponentRiskTable components={components} />
      </div>

      {/* Critical Issues Queue */}
      <CriticalIssuesTable
        issues={criticalIssues}
        onViewIssue={(id) => navigate(`/issues/${id}`)}
      />
    </div>
  );
};
