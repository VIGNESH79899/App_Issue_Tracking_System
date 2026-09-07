import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@app-issue-track/shared';
import { historyService } from '../services/historyService.js';

export const getIssueHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const history = await historyService.getIssueHistory(req.user!, id);
    const response: ApiResponse<typeof history> = {
      success: true,
      data: history,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
