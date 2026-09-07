import { Request, Response, NextFunction } from 'express';
import { ApiResponse, SmartAssigneeRecommendation } from '@app-issue-track/shared';
import { routingService } from '../services/routingService.js';

export const getSmartAssigneeRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const recommendations = await routingService.getSmartAssigneeRecommendations(req.user!, id);
    const response: ApiResponse<SmartAssigneeRecommendation[]> = {
      success: true,
      data: recommendations,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
