import apiClient from './apiClient';
import { ApplicationDTO, CreateApplicationInput, ApiResponse } from '@app-issue-track/shared';

export const applicationsApi = {
  getApplications: async (): Promise<ApplicationDTO[]> => {
    const response = await apiClient.get<never, ApiResponse<ApplicationDTO[]>>('/applications');
    return response.data || [];
  },

  getApplicationById: async (id: string): Promise<ApplicationDTO> => {
    const response = await apiClient.get<never, ApiResponse<ApplicationDTO>>(`/applications/${id}`);
    return response.data!;
  },

  createApplication: async (input: CreateApplicationInput): Promise<ApplicationDTO> => {
    const response = await apiClient.post<never, ApiResponse<ApplicationDTO>>('/applications', input);
    return response.data!;
  },

  updateApplication: async (id: string, input: Partial<CreateApplicationInput>): Promise<ApplicationDTO> => {
    const response = await apiClient.put<never, ApiResponse<ApplicationDTO>>(`/applications/${id}`, input);
    return response.data!;
  },

  deleteApplication: async (id: string): Promise<void> => {
    await apiClient.delete(`/applications/${id}`);
  },
};
