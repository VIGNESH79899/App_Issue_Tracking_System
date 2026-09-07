import apiClient from './apiClient';
import {
  ApiResponse,
  IncidentDTO,
  IncidentTimelineDTO,
  IncidentEscalationDTO,
  IncidentMetricsDTO,
  IncidentRecurrenceDTO,
  IssueDTO,
  IncidentStatus,
  IncidentSeverity,
} from '@app-issue-track/shared';

export const incidentApi = {
  createIncident: async (data: {
    projectId: string;
    applicationId: string;
    title: string;
    description: string;
    moduleComponent?: string;
    severity?: IncidentSeverity;
    sourceIssueId?: string;
    ownerId?: string;
    impactSummary?: string;
  }): Promise<IncidentDTO> => {
    const response = await apiClient.post<never, ApiResponse<IncidentDTO>>('/incidents', data);
    return response.data!;
  },

  getIncidents: async (query?: {
    projectId?: string;
    severity?: IncidentSeverity;
    status?: IncidentStatus;
  }): Promise<IncidentDTO[]> => {
    const response = await apiClient.get<never, ApiResponse<IncidentDTO[]>>('/incidents', {
      params: query,
    });
    return response.data || [];
  },

  getIncidentById: async (id: string): Promise<IncidentDTO> => {
    const response = await apiClient.get<never, ApiResponse<IncidentDTO>>(`/incidents/${id}`);
    return response.data!;
  },

  acknowledgeIncident: async (id: string): Promise<IncidentDTO> => {
    const response = await apiClient.post<never, ApiResponse<IncidentDTO>>(`/incidents/${id}/acknowledge`);
    return response.data!;
  },

  transitionStatus: async (id: string, status: IncidentStatus): Promise<IncidentDTO> => {
    const response = await apiClient.post<never, ApiResponse<IncidentDTO>>(`/incidents/${id}/status`, {
      status,
    });
    return response.data!;
  },

  assignOwner: async (id: string, ownerId: string): Promise<IncidentDTO> => {
    const response = await apiClient.post<never, ApiResponse<IncidentDTO>>(`/incidents/${id}/assign`, {
      ownerId,
    });
    return response.data!;
  },

  resolveIncident: async (id: string, impactSummary?: string): Promise<IncidentDTO> => {
    const response = await apiClient.post<never, ApiResponse<IncidentDTO>>(`/incidents/${id}/resolve`, {
      impactSummary,
    });
    return response.data!;
  },

  closeIncident: async (id: string): Promise<IncidentDTO> => {
    const response = await apiClient.post<never, ApiResponse<IncidentDTO>>(`/incidents/${id}/close`);
    return response.data!;
  },

  escalateIssue: async (
    issueId: string,
    severity: IncidentSeverity = IncidentSeverity.SEV2,
    impactSummary?: string
  ): Promise<IncidentDTO> => {
    const response = await apiClient.post<never, ApiResponse<IncidentDTO>>(`/issues/${issueId}/escalate`, {
      severity,
      impactSummary,
    });
    return response.data!;
  },

  getTimeline: async (id: string): Promise<IncidentTimelineDTO[]> => {
    const response = await apiClient.get<never, ApiResponse<IncidentTimelineDTO[]>>(`/incidents/${id}/timeline`);
    return response.data || [];
  },

  getRelatedIssues: async (id: string): Promise<IssueDTO[]> => {
    const response = await apiClient.get<never, ApiResponse<IssueDTO[]>>(`/incidents/${id}/related-issues`);
    return response.data || [];
  },

  getEscalations: async (id: string): Promise<IncidentEscalationDTO[]> => {
    const response = await apiClient.get<never, ApiResponse<IncidentEscalationDTO[]>>(`/incidents/${id}/escalations`);
    return response.data || [];
  },

  getMetrics: async (projectId?: string): Promise<IncidentMetricsDTO> => {
    const response = await apiClient.get<never, ApiResponse<IncidentMetricsDTO>>('/incidents/metrics', {
      params: { projectId },
    });
    return (
      response.data || {
        mttaHours: null,
        mttrHours: null,
        activeCount: 0,
        sev1Count: 0,
        sev2Count: 0,
        slaBreachedCount: 0,
        escalationCount: 0,
        recurrenceRate: 0,
      }
    );
  },

  getRecurrence: async (id: string): Promise<IncidentRecurrenceDTO> => {
    const response = await apiClient.get<never, ApiResponse<IncidentRecurrenceDTO>>(`/incidents/${id}/recurrence`);
    return response.data!;
  },
};
