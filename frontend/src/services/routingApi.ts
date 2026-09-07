import apiClient from './apiClient';
import { ApiResponse, SmartAssigneeRecommendation } from '@app-issue-track/shared';

export const routingApi = {
  getSmartAssigneeRecommendations: async (issueId: string): Promise<SmartAssigneeRecommendation[]> => {
    const response = await apiClient.get<never, ApiResponse<SmartAssigneeRecommendation[]>>(
      `/issues/${issueId}/routing-recommendations`
    );
    return response.data || [];
  },
};
