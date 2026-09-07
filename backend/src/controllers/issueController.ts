import { Request, Response, NextFunction } from 'express';
import { ApiResponse, PaginatedResponse } from '@app-issue-track/shared';
import { issueService } from '../services/issueService.js';

export const getIssues = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await issueService.getIssues(req.user!, req.query as any);
    const response: PaginatedResponse<any> = {
      success: true,
      data: result.data,
      pagination: result.pagination,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getIssueById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const issue = await issueService.getIssueById(req.user!, id);
    const response: ApiResponse<typeof issue> = {
      success: true,
      data: issue,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const createIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const issue = await issueService.createIssue(req.user!, req.body);
    const response: ApiResponse<typeof issue> = {
      success: true,
      message: 'Issue created successfully',
      data: issue,
      timestamp: new Date().toISOString(),
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const issue = await issueService.updateIssue(id, req.user!.userId, req.body);
    const response: ApiResponse<typeof issue> = {
      success: true,
      message: 'Issue updated successfully',
      data: issue,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const changeStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, resolution } = req.body;
    const issue = await issueService.changeStatus(
      id,
      req.user!.userId,
      status,
      resolution
    );
    const response: ApiResponse<typeof issue> = {
      success: true,
      message: `Issue status changed to ${status}`,
      data: issue,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const assignIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { assigneeId } = req.body;
    const issue = await issueService.assignIssue(id, req.user!.userId, assigneeId);
    const response: ApiResponse<typeof issue> = {
      success: true,
      message: assigneeId ? 'Issue assigned successfully' : 'Issue unassigned successfully',
      data: issue,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteIssue = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await issueService.deleteIssue(id);
    const response: ApiResponse = {
      success: true,
      message: 'Issue deleted successfully',
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
