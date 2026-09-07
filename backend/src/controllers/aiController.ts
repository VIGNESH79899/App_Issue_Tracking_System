import { Request, Response, NextFunction } from 'express';
import { ApiResponse, AIInsightResponseData } from '@app-issue-track/shared';
import { aiService } from '../ai/AIService.js';

export const getAiInsights = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const insightsData = await aiService.generateIssueInsights(req.user!, id);
    const response: ApiResponse<AIInsightResponseData> = {
      success: true,
      data: insightsData,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const regenerateAiInsights = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const insightsData = await aiService.generateIssueInsights(req.user!, id);
    const response: ApiResponse<AIInsightResponseData> = {
      success: true,
      message: 'Fresh AI analysis generated successfully',
      data: insightsData,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
