import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@app-issue-track/shared';
import { applicationService } from '../services/applicationService.js';

export const getApplications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const apps = await applicationService.getApplications(req.user!);
    const response: ApiResponse<typeof apps> = {
      success: true,
      data: apps,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getApplicationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const app = await applicationService.getApplicationById(req.user!, id);
    const response: ApiResponse<typeof app> = {
      success: true,
      data: app,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const createApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const app = await applicationService.createApplication(req.body);
    const response: ApiResponse<typeof app> = {
      success: true,
      message: 'Application created successfully',
      data: app,
      timestamp: new Date().toISOString(),
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const app = await applicationService.updateApplication(id, req.body);
    const response: ApiResponse<typeof app> = {
      success: true,
      message: 'Application updated successfully',
      data: app,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteApplication = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await applicationService.deleteApplication(id);
    const response: ApiResponse = {
      success: true,
      message: 'Application deleted successfully',
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
