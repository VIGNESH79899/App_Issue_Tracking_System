import apiClient from './apiClient';
import {
  IssueDTO,
  IssueHistoryDTO,
  CreateIssueInput,
  UpdateIssueInput,
  IssueQueryInput,
  IssueStatus,
  PaginatedResponse,
  ApiResponse,
} from '@app-issue-track/shared';

export const issuesApi = {
  getIssues: async (query: Partial<IssueQueryInput> = {}): Promise<{ data: IssueDTO[]; pagination: PaginatedResponse<IssueDTO>['pagination'] }> => {
    const response = await apiClient.get<never, PaginatedResponse<IssueDTO>>('/issues', { params: query });
    return {
      data: response.data || [],
      pagination: response.pagination!,
    };
  },

  getIssueById: async (idOrKey: string): Promise<IssueDTO> => {
    const response = await apiClient.get<never, ApiResponse<IssueDTO>>(`/issues/${idOrKey}`);
    return response.data!;
  },

  createIssue: async (input: CreateIssueInput): Promise<IssueDTO> => {
    const response = await apiClient.post<never, ApiResponse<IssueDTO>>('/issues', input);
    return response.data!;
  },

  updateIssue: async (id: string, input: UpdateIssueInput): Promise<IssueDTO> => {
    const response = await apiClient.put<never, ApiResponse<IssueDTO>>(`/issues/${id}`, input);
    return response.data!;
  },

  changeStatus: async (id: string, status: IssueStatus, resolution?: string): Promise<IssueDTO> => {
    const response = await apiClient.patch<never, ApiResponse<IssueDTO>>(`/issues/${id}/status`, {
      status,
      resolution,
    });
    return response.data!;
  },

  assignIssue: async (id: string, assigneeId: string | null): Promise<IssueDTO> => {
    const response = await apiClient.patch<never, ApiResponse<IssueDTO>>(`/issues/${id}/assign`, { assigneeId });
    return response.data!;
  },

  deleteIssue: async (id: string): Promise<void> => {
    await apiClient.delete(`/issues/${id}`);
  },

  getIssueHistory: async (id: string): Promise<IssueHistoryDTO[]> => {
    const response = await apiClient.get<never, ApiResponse<IssueHistoryDTO[]>>(`/issues/${id}/history`);
    return response.data || [];
  },
};
