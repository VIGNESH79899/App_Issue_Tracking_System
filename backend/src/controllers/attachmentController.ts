import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@app-issue-track/shared';
import { attachmentService } from '../services/attachmentService.js';
import { ApiError } from '../middlewares/errorHandler.js';

export const getAttachmentsByIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const attachments = await attachmentService.getAttachmentsByIssue(req.user!, id);
    const response: ApiResponse<typeof attachments> = {
      success: true,
      data: attachments,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const uploadAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (!req.file) {
      throw ApiError.badRequest('No file uploaded or file rejected by MIME filter');
    }

    const attachment = await attachmentService.uploadAttachment(
      req.user!,
      id,
      req.file
    );

    const response: ApiResponse<typeof attachment> = {
      success: true,
      message: 'Attachment uploaded successfully',
      data: attachment,
      timestamp: new Date().toISOString(),
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteAttachment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await attachmentService.deleteAttachment(req.user!, id);
    const response: ApiResponse = {
      success: true,
      message: 'Attachment deleted successfully',
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
