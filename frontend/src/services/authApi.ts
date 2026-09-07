import apiClient from './apiClient';
import { LoginInput, RegisterInput, ApiResponse, AuthResponseData, UserDTO } from '@app-issue-track/shared';

export const authApi = {
  login: async (input: LoginInput): Promise<AuthResponseData> => {
    const response = await apiClient.post<never, ApiResponse<{ user: UserDTO; accessToken: string; refreshToken: string }>>('/auth/login', input);
    if (response.data?.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return {
      user: response.data!.user,
      token: response.data!.accessToken,
    };
  },

  register: async (input: RegisterInput): Promise<AuthResponseData> => {
    const response = await apiClient.post<never, ApiResponse<{ user: UserDTO; accessToken: string; refreshToken: string }>>('/auth/register', input);
    if (response.data?.accessToken) {
      localStorage.setItem('token', response.data.accessToken);
      localStorage.setItem('refreshToken', response.data.refreshToken);
    }
    return {
      user: response.data!.user,
      token: response.data!.accessToken,
    };
  },

  getMe: async (): Promise<UserDTO> => {
    const response = await apiClient.get<never, ApiResponse<UserDTO>>('/auth/me');
    return response.data!;
  },

  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await apiClient.post('/auth/logout', { refreshToken });
      }
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    }
  },
};
