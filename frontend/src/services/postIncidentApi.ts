import apiClient from './apiClient';
import { ApiResponse, PostIncidentAnalysisDTO } from '@app-issue-track/shared';

export const postIncidentApi = {
  getAnalysis: async (incidentId: string): Promise<PostIncidentAnalysisDTO> => {
    const response = await apiClient.get<never, ApiResponse<PostIncidentAnalysisDTO>>(
      `/incidents/${incidentId}/post-incident-analysis`
    );
    return response.data!;
  },
};
