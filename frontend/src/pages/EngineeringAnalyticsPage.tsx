import React, { useEffect, useState, useCallback } from 'react';
import {
  ProjectDTO,
  AnalyticsOverview,
  AIAnalyticsBriefing,
} from '@app-issue-track/shared';
import { projectsApi } from '../services/projectsApi';
import { analyticsApi } from '../services/analyticsApi';
import { useToast } from '../context/ToastContext';
import { AnalyticsHeader } from '../components/analytics/AnalyticsHeader';
import { AnalyticsFilters } from '../components/analytics/AnalyticsFilters';
import { ProjectDeliveryRiskCard } from '../components/analytics/ProjectDeliveryRiskCard';
import { BacklogForecastCard } from '../components/analytics/BacklogForecastCard';
import { ForecastTrendChart } from '../components/analytics/ForecastTrendChart';
import { SlaForecastCard } from '../components/analytics/SlaForecastCard';
import { CapacityForecastTable } from '../components/analytics/CapacityForecastTable';
import { ComponentForecastTable } from '../components/analytics/ComponentForecastTable';
import { IncidentForecastCard } from '../components/analytics/IncidentForecastCard';
import { AIAnalyticsBriefingComponent } from '../components/analytics/AIAnalyticsBriefing';
import { AnalyticsSkeleton } from '../components/analytics/AnalyticsSkeleton';
import { AnalyticsEmptyState } from '../components/analytics/AnalyticsEmptyState';

export const EngineeringAnalyticsPage: React.FC = () => {
  const toast = useToast();

  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [period, setPeriod] = useState<'7d' | '14d' | '30d'>('14d');
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [briefing, setBriefing] = useState<AIAnalyticsBriefing | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

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

  const fetchAnalytics = useCallback(async (projId: string) => {
    if (!projId) return;
    setIsRefreshing(true);
    try {
      const data = await analyticsApi.getOverview(projId);
      setOverview(data);

      setIsAiLoading(true);
      analyticsApi
        .getBriefing(projId)
        .then(setBriefing)
        .catch(() => setBriefing(null))
        .finally(() => setIsAiLoading(false));
    } catch (err: any) {
      toast.error('Analytics Error', err.message || 'Failed to fetch predictive analytics');
    } finally {
      setIsRefreshing(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchAnalytics(selectedProjectId);
    }
  }, [selectedProjectId, fetchAnalytics]);

  if (isLoadingMeta) return <AnalyticsSkeleton />;
  if (projects.length === 0 || !selectedProjectId) return <AnalyticsEmptyState />;

  const visiblePoints = overview
    ? overview.backlogForecast.points.slice(0, period === '30d' ? 30 : period === '14d' ? 14 : 7)
    : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <AnalyticsHeader generatedAt={overview?.generatedAt} />

      {/* Top Filter Bar */}
      <AnalyticsFilters
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        period={period}
        onSelectPeriod={setPeriod}
        onRefresh={() => fetchAnalytics(selectedProjectId)}
        isRefreshing={isRefreshing}
      />

      {overview && (
        <>
          {/* ROW 1: Delivery Risk, Backlog Forecast, SLA Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ProjectDeliveryRiskCard risk={overview.deliveryRisk} />
            <BacklogForecastCard forecast={overview.backlogForecast} />
            <SlaForecastCard forecast={overview.slaForecast} />
          </div>

          {/* ROW 2: Backlog Predictive Trajectory Chart */}
          <ForecastTrendChart points={visiblePoints} period={period} />

          {/* ROW 3: Developer Capacity & Component Risk Forecasts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CapacityForecastTable forecasts={overview.developerCapacityForecasts} />
            <ComponentForecastTable forecasts={overview.componentForecasts} />
          </div>

          {/* ROW 4: Incident Frequency & AI Executive Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <IncidentForecastCard forecast={overview.incidentForecast} />
            <AIAnalyticsBriefingComponent briefing={briefing} isLoading={isAiLoading} />
          </div>
        </>
      )}
    </div>
  );
};
