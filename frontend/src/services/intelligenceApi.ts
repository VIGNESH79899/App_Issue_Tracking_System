import apiClient from './apiClient';
import { ApiResponse, IssueIntelligence } from '@app-issue-track/shared';

export const intelligenceApi = {
  getIssueIntelligence: async (issueId: string): Promise<IssueIntelligence> => {
    const response = await apiClient.get<ApiResponse<IssueIntelligence>>(`/issues/${issueId}/intelligence`);
    return response.data.data!;
  },
};
