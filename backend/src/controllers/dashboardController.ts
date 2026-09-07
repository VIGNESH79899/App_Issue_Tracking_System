import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@app-issue-track/shared';
import { dashboardService } from '../services/dashboardService.js';

export const getSummaryMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const metrics = await dashboardService.getSummaryMetrics(req.user!, projectId);
    const response: ApiResponse<typeof metrics> = {
      success: true,
      data: metrics,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getIssuesByStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const data = await dashboardService.getIssuesByStatus(req.user!, projectId);
    const response: ApiResponse<typeof data> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getIssuesByPriority = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const data = await dashboardService.getIssuesByPriority(req.user!, projectId);
    const response: ApiResponse<typeof data> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getIssuesBySeverity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const data = await dashboardService.getIssuesBySeverity(req.user!, projectId);
    const response: ApiResponse<typeof data> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getIssuesByApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const data = await dashboardService.getIssuesByApplication(req.user!, projectId);
    const response: ApiResponse<typeof data> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getResolutionMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const data = await dashboardService.getResolutionMetrics(req.user!, projectId);
    const response: ApiResponse<typeof data> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getDeveloperWorkloads = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = req.query.projectId as string | undefined;
    const data = await dashboardService.getDeveloperWorkloads(req.user!, projectId);
    const response: ApiResponse<typeof data> = {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
