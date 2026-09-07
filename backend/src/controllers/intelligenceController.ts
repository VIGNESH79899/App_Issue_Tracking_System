import { Request, Response, NextFunction } from 'express';
import { ApiResponse, IssueIntelligence } from '@app-issue-track/shared';
import { intelligenceService } from '../services/intelligenceService.js';

export const getIssueIntelligence = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const intelligence = await intelligenceService.getIssueIntelligence(req.user!, id);
    const response: ApiResponse<IssueIntelligence> = {
      success: true,
      data: intelligence,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
