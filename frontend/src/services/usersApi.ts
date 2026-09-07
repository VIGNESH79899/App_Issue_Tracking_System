import apiClient from './apiClient';
import { UserDTO, UserRole, ApiResponse } from '@app-issue-track/shared';

export const usersApi = {
  getUsers: async (): Promise<UserDTO[]> => {
    const response = await apiClient.get<never, ApiResponse<UserDTO[]>>('/users');
    return response.data || [];
  },

  getUserById: async (id: string): Promise<UserDTO> => {
    const response = await apiClient.get<never, ApiResponse<UserDTO>>(`/users/${id}`);
    return response.data!;
  },

  updateUser: async (id: string, data: { firstName?: string; lastName?: string; email?: string }): Promise<UserDTO> => {
    const response = await apiClient.put<never, ApiResponse<UserDTO>>(`/users/${id}`, data);
    return response.data!;
  },

  toggleUserStatus: async (id: string, isActive: boolean): Promise<UserDTO> => {
    const response = await apiClient.patch<never, ApiResponse<UserDTO>>(`/users/${id}/status`, { isActive });
    return response.data!;
  },

  changeUserRole: async (id: string, role: UserRole): Promise<UserDTO> => {
    const response = await apiClient.patch<never, ApiResponse<UserDTO>>(`/users/${id}/role`, { role });
    return response.data!;
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`);
  },
};
