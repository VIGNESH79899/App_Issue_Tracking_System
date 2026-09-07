import apiClient from './apiClient';
import { ApiResponse, ProjectMemberDTO, UserRole } from '@app-issue-track/shared';

export interface TeamMemberDTO {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  joinedAt: string;
  activeIssuesCount: number;
  projects: Array<{
    id: string;
    name: string;
    key: string;
    roleInProject: UserRole;
  }>;
}

export const teamApi = {
  getTeamMembers: async (): Promise<TeamMemberDTO[]> => {
    const response = await apiClient.get<never, ApiResponse<TeamMemberDTO[]>>('/team');
    return response.data || [];
  },

  getProjectMembers: async (projectId: string): Promise<ProjectMemberDTO[]> => {
    const response = await apiClient.get<never, ApiResponse<ProjectMemberDTO[]>>(`/projects/${projectId}/members`);
    return response.data || [];
  },

  addProjectMember: async (
    projectId: string,
    userId: string,
    roleInProject: UserRole = UserRole.DEVELOPER
  ): Promise<ProjectMemberDTO> => {
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
