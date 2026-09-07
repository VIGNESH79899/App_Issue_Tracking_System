import apiClient from './apiClient';
import {
  ApiResponse,
  AnalyticsOverview,
  BacklogForecast,
  SlaForecast,
  DeveloperCapacityForecast,
  ComponentForecast,
  IncidentForecast,
  ProjectDeliveryRisk,
  AIAnalyticsBriefing,
} from '@app-issue-track/shared';

export const analyticsApi = {
  getOverview: async (projectId?: string): Promise<AnalyticsOverview | null> => {
    const response = await apiClient.get<never, ApiResponse<AnalyticsOverview | null>>('/analytics/overview', {
      params: { projectId },
    });
    return response.data || null;
  },

  getBacklogForecast: async (projectId?: string): Promise<BacklogForecast | null> => {
    const response = await apiClient.get<never, ApiResponse<BacklogForecast | null>>('/analytics/backlog', {
      params: { projectId },
    });
    return response.data || null;
  },

  getSlaForecast: async (projectId?: string): Promise<SlaForecast | null> => {
    const response = await apiClient.get<never, ApiResponse<SlaForecast | null>>('/analytics/sla', {
      params: { projectId },
    });
    return response.data || null;
  },

  getCapacityForecast: async (projectId?: string): Promise<DeveloperCapacityForecast[]> => {
    const response = await apiClient.get<never, ApiResponse<DeveloperCapacityForecast[]>>('/analytics/capacity', {
      params: { projectId },
    });
    return response.data || [];
  },

  getComponentForecast: async (projectId?: string): Promise<ComponentForecast[]> => {
    const response = await apiClient.get<never, ApiResponse<ComponentForecast[]>>('/analytics/components', {
      params: { projectId },
    });
    return response.data || [];
  },

  getIncidentForecast: async (projectId?: string): Promise<IncidentForecast | null> => {
    const response = await apiClient.get<never, ApiResponse<IncidentForecast | null>>('/analytics/incidents', {
      params: { projectId },
    });
    return response.data || null;
  },

  getDeliveryRisk: async (projectId?: string): Promise<ProjectDeliveryRisk | null> => {
    const response = await apiClient.get<never, ApiResponse<ProjectDeliveryRisk | null>>('/analytics/delivery-risk', {
      params: { projectId },
    });
    return response.data || null;
  },

  getBriefing: async (projectId?: string): Promise<AIAnalyticsBriefing | null> => {
    const response = await apiClient.get<never, ApiResponse<AIAnalyticsBriefing | null>>('/analytics/briefing', {
      params: { projectId },
    });
    return response.data || null;
  },
};
