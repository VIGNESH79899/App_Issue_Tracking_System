import apiClient from './apiClient';
import { CommentDTO, CreateCommentInput, ApiResponse } from '@app-issue-track/shared';

export const commentsApi = {
  getCommentsByIssue: async (issueId: string): Promise<CommentDTO[]> => {
    const response = await apiClient.get<never, ApiResponse<CommentDTO[]>>(`/issues/${issueId}/comments`);
    return response.data || [];
  },

  createComment: async (issueId: string, input: CreateCommentInput): Promise<CommentDTO> => {
    const response = await apiClient.post<never, ApiResponse<CommentDTO>>(`/issues/${issueId}/comments`, input);
    return response.data!;
  },

  updateComment: async (commentId: string, content: string): Promise<CommentDTO> => {
    const response = await apiClient.put<never, ApiResponse<CommentDTO>>(`/comments/${commentId}`, { content });
    return response.data!;
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/comments/${commentId}`);
  },
};
