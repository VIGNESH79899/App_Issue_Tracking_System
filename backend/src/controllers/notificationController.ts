import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@app-issue-track/shared';
import { notificationService } from '../services/notificationService.js';

export const getUserNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const notifications = await notificationService.getUserNotifications(req.user!.userId);
    const response: ApiResponse<typeof notifications> = {
      success: true,
      data: notifications,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const notification = await notificationService.markAsRead(id, req.user!.userId);
    const response: ApiResponse<typeof notification> = {
      success: true,
      message: 'Notification marked as read',
      data: notification,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    await notificationService.markAllAsRead(req.user!.userId);
    const response: ApiResponse = {
      success: true,
      message: 'All notifications marked as read',
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
