import apiClient from './apiClient';
import { ApiResponse, ProjectSlaSummary } from '@app-issue-track/shared';

export interface SummaryMetrics {
  isUnassigned?: boolean;
  totalIssues: number;
  openIssues: number;
  assignedIssues?: number;
  inProgressIssues: number;
  resolvedIssues: number;
  closedIssues: number;
  verifiedIssues?: number;
  reopenedIssues?: number;
  totalApplications: number;
  totalProjects: number;
  totalUsers: number;
  slaSummary?: ProjectSlaSummary;
}

export interface DistributionMetric {
  name: string;
  count: number;
}

export interface DeveloperWorkloadMetric {
  id: string;
  name: string;
  email: string;
  assignedCount?: number;
  inProgressCount?: number;
  totalCount?: number;
  activeIssuesCount?: number;
}

export interface ResolutionMetric {
  averageResolutionHours: number;
  resolvedCount: number;
}

export const dashboardApi = {
  getSummaryMetrics: async (projectId?: string): Promise<SummaryMetrics> => {
    const params = projectId ? { projectId } : {};
    const response = await apiClient.get<never, ApiResponse<SummaryMetrics>>('/dashboard/summary', { params });
    return response.data!;
  },

  getIssuesByStatus: async (projectId?: string): Promise<DistributionMetric[]> => {
    const params = projectId ? { projectId } : {};
    const response = await apiClient.get<never, ApiResponse<DistributionMetric[]>>('/dashboard/issues-by-status', { params });
    return response.data || [];
  },

  getIssuesByPriority: async (projectId?: string): Promise<DistributionMetric[]> => {
    const params = projectId ? { projectId } : {};
    const response = await apiClient.get<never, ApiResponse<DistributionMetric[]>>('/dashboard/issues-by-priority', { params });
    return response.data || [];
  },

  getIssuesBySeverity: async (projectId?: string): Promise<DistributionMetric[]> => {
    const params = projectId ? { projectId } : {};
    const response = await apiClient.get<never, ApiResponse<DistributionMetric[]>>('/dashboard/issues-by-severity', { params });
    return response.data || [];
  },

  getDeveloperWorkloads: async (projectId?: string): Promise<DeveloperWorkloadMetric[]> => {
    const params = projectId ? { projectId } : {};
    const response = await apiClient.get<never, ApiResponse<DeveloperWorkloadMetric[]>>('/dashboard/developer-workload', { params });
    return response.data || [];
  },

  getAverageResolutionTime: async (projectId?: string): Promise<ResolutionMetric> => {
    const params = projectId ? { projectId } : {};
    const response = await apiClient.get<never, ApiResponse<ResolutionMetric>>('/dashboard/resolution-metrics', { params });
    return response.data || { averageResolutionHours: 0, resolvedCount: 0 };
  },
};
