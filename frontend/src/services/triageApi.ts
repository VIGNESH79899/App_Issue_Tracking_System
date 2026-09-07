import apiClient from './apiClient';
import { ApiResponse, IssueTriageAnalysis, DuplicateCandidateItem, AnalyzeIssueInput } from '@app-issue-track/shared';

export const triageApi = {
  analyzeDraftIssue: async (input: AnalyzeIssueInput): Promise<IssueTriageAnalysis> => {
    const response = await apiClient.post<never, ApiResponse<IssueTriageAnalysis>>(
      '/issues/analyze',
      input
    );
    return response.data!;
  },

  getDuplicateCandidates: async (issueId: string): Promise<DuplicateCandidateItem[]> => {
    const response = await apiClient.get<never, ApiResponse<DuplicateCandidateItem[]>>(
      `/issues/${issueId}/duplicate-candidates`
    );
    return response.data || [];
  },

  triageIssue: async (issueId: string): Promise<IssueTriageAnalysis> => {
    const response = await apiClient.post<never, ApiResponse<IssueTriageAnalysis>>(
      `/issues/${issueId}/triage`
    );
    return response.data!;
  },
};
