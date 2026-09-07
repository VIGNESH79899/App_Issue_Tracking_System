import apiClient from './apiClient';
import {
  ApiResponse,
  CommandCenterOverview,
  ProjectHealthScore,
  DeveloperCapacitySummary,
  ComponentRiskSummary,
  EngineeringBottleneck,
  TrendPoint,
  CriticalIssueSummary,
  AIProjectBriefing,
} from '@app-issue-track/shared';

export const commandCenterApi = {
  getOverview: async (projectId?: string): Promise<CommandCenterOverview | null> => {
    const response = await apiClient.get<never, ApiResponse<CommandCenterOverview | null>>(
      '/command-center/overview',
      { params: { projectId } }
    );
    return response.data || null;
  },

  getHealth: async (projectId?: string): Promise<ProjectHealthScore | null> => {
    const response = await apiClient.get<never, ApiResponse<ProjectHealthScore | null>>(
      '/command-center/health',
      { params: { projectId } }
    );
    return response.data || null;
  },

  getTrends: async (
    projectId?: string,
    period: '7d' | '14d' | '30d' = '7d'
  ): Promise<{ period: string; points: TrendPoint[] }> => {
    const response = await apiClient.get<never, ApiResponse<{ period: string; points: TrendPoint[] }>>(
      '/command-center/trends',
      { params: { projectId, period } }
    );
    return response.data || { period: '7d', points: [] };
  },

  getDevelopers: async (projectId?: string): Promise<DeveloperCapacitySummary[]> => {
    const response = await apiClient.get<never, ApiResponse<DeveloperCapacitySummary[]>>(
      '/command-center/developers',
      { params: { projectId } }
    );
    return response.data || [];
  },

  getComponents: async (projectId?: string): Promise<ComponentRiskSummary[]> => {
    const response = await apiClient.get<never, ApiResponse<ComponentRiskSummary[]>>(
      '/command-center/components',
      { params: { projectId } }
    );
    return response.data || [];
  },

  getBottlenecks: async (projectId?: string): Promise<EngineeringBottleneck[]> => {
    const response = await apiClient.get<never, ApiResponse<EngineeringBottleneck[]>>(
      '/command-center/bottlenecks',
      { params: { projectId } }
    );
    return response.data || [];
  },

  getCriticalIssues: async (projectId?: string): Promise<CriticalIssueSummary[]> => {
    const response = await apiClient.get<never, ApiResponse<CriticalIssueSummary[]>>(
      '/command-center/critical-issues',
      { params: { projectId } }
    );
    return response.data || [];
  },

  getBriefing: async (projectId?: string): Promise<AIProjectBriefing | null> => {
    const response = await apiClient.get<never, ApiResponse<AIProjectBriefing | null>>(
      '/command-center/briefing',
      { params: { projectId } }
    );
    return response.data || null;
  },
};
