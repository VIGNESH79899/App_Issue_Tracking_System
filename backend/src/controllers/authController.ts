import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@app-issue-track/shared';
import { authService } from '../services/authService.js';

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.register(req.body);
    const response: ApiResponse<typeof result> = {
      success: true,
      message: 'User account registered successfully',
      data: result,
      timestamp: new Date().toISOString(),
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await authService.login(req.body);
    const response: ApiResponse<typeof result> = {
      success: true,
      message: 'Authentication successful',
      data: result,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const result = await authService.refresh(refreshToken);
    const response: ApiResponse<typeof result> = {
      success: true,
      message: 'Access token refreshed successfully',
      data: result,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    await authService.logout(refreshToken);
    const response: ApiResponse = {
      success: true,
      message: 'User logged out successfully and refresh token revoked',
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await authService.me(req.user!.userId);
    const response: ApiResponse<typeof user> = {
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
