import apiClient from './apiClient';
import { ApiResponse, AIInsightResponseData } from '@app-issue-track/shared';

export const aiApi = {
  getAiInsights: async (issueId: string): Promise<AIInsightResponseData> => {
    const response = await apiClient.get<never, ApiResponse<AIInsightResponseData>>(
      `/issues/${issueId}/ai-insights`
    );
    return response.data!;
  },

  regenerateAiInsights: async (issueId: string): Promise<AIInsightResponseData> => {
    const response = await apiClient.post<never, ApiResponse<AIInsightResponseData>>(
      `/issues/${issueId}/ai-insights/regenerate`
    );
    return response.data!;
  },
};
