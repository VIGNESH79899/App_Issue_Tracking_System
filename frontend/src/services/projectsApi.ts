import apiClient from './apiClient';
import { ProjectDTO, ProjectMemberDTO, CreateProjectInput, UserRole, ApiResponse } from '@app-issue-track/shared';

export const projectsApi = {
  getProjects: async (applicationId?: string): Promise<ProjectDTO[]> => {
    const response = await apiClient.get<never, ApiResponse<ProjectDTO[]>>('/projects', {
      params: { applicationId },
    });
    return response.data || [];
  },

  getProjectById: async (id: string): Promise<ProjectDTO> => {
    const response = await apiClient.get<never, ApiResponse<ProjectDTO>>(`/projects/${id}`);
    return response.data!;
  },

  createProject: async (input: CreateProjectInput): Promise<ProjectDTO> => {
    const response = await apiClient.post<never, ApiResponse<ProjectDTO>>('/projects', input);
    return response.data!;
  },

  updateProject: async (id: string, input: Partial<CreateProjectInput>): Promise<ProjectDTO> => {
    const response = await apiClient.put<never, ApiResponse<ProjectDTO>>(`/projects/${id}`, input);
    return response.data!;
  },

  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}`);
  },

  getProjectMembers: async (projectId: string): Promise<ProjectMemberDTO[]> => {
    const response = await apiClient.get<never, ApiResponse<ProjectMemberDTO[]>>(`/projects/${projectId}/members`);
    return response.data || [];
  },

  addProjectMember: async (projectId: string, userId: string, roleInProject?: UserRole): Promise<ProjectMemberDTO> => {
    const response = await apiClient.post<never, ApiResponse<ProjectMemberDTO>>(`/projects/${projectId}/members`, {
      userId,
      roleInProject,
    });
    return response.data!;
  },

  removeProjectMember: async (projectId: string, userId: string): Promise<void> => {
    await apiClient.delete(`/projects/${projectId}/members/${userId}`);
  },
};
