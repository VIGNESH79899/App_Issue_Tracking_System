import apiClient from './apiClient';
import { NotificationDTO, ApiResponse } from '@app-issue-track/shared';

export const notificationsApi = {
  getUserNotifications: async (): Promise<NotificationDTO[]> => {
    const response = await apiClient.get<never, ApiResponse<NotificationDTO[]>>('/notifications');
    return response.data || [];
  },

  markAsRead: async (notificationId: string): Promise<NotificationDTO> => {
    const response = await apiClient.put<never, ApiResponse<NotificationDTO>>(`/notifications/${notificationId}/read`);
    return response.data!;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/notifications/read-all');
  },
};
