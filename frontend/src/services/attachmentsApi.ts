import apiClient from './apiClient';
import { AttachmentDTO, ApiResponse } from '@app-issue-track/shared';

export const attachmentsApi = {
  getAttachmentsByIssue: async (issueId: string): Promise<AttachmentDTO[]> => {
    const response = await apiClient.get<never, ApiResponse<AttachmentDTO[]>>(`/issues/${issueId}/attachments`);
    return response.data || [];
  },

  uploadAttachment: async (issueId: string, file: File): Promise<AttachmentDTO> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<never, ApiResponse<AttachmentDTO>>(`/issues/${issueId}/attachments`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data!;
  },

  deleteAttachment: async (attachmentId: string): Promise<void> => {
    await apiClient.delete(`/attachments/${attachmentId}`);
  },
};
