import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@app-issue-track/shared';
import { commentService } from '../services/commentService.js';

export const getCommentsByIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const isReporterOnly = req.user!.role === 'REPORTER';
    const comments = await commentService.getCommentsByIssue(req.user!, id, !isReporterOnly);
    const response: ApiResponse<typeof comments> = {
      success: true,
      data: comments,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const createComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const comment = await commentService.createComment(req.user!, id, req.body);
    const response: ApiResponse<typeof comment> = {
      success: true,
      message: 'Comment posted successfully',
      data: comment,
      timestamp: new Date().toISOString(),
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { content } = req.body;
    const comment = await commentService.updateComment(req.user!, id, content);
    const response: ApiResponse<typeof comment> = {
      success: true,
      message: 'Comment updated successfully',
      data: comment,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await commentService.deleteComment(req.user!, id);
    const response: ApiResponse = {
      success: true,
      message: 'Comment deleted successfully',
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
