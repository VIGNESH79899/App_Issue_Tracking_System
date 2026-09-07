import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@app-issue-track/shared';
import { userService } from '../services/userService.js';
import { ApiError } from '../middlewares/errorHandler.js';

export const getUsers = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const users = await userService.getUsers();
    const response: ApiResponse<typeof users> = {
      success: true,
      data: users,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const user = await userService.getUserById(id);
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

export const updateUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    if (req.user!.role !== 'ADMIN' && req.user!.userId !== id) {
      throw ApiError.forbidden('You can only update your own user profile');
    }

    const updatedUser = await userService.updateUser(id, req.body);
    const response: ApiResponse<typeof updatedUser> = {
      success: true,
      message: 'User profile updated successfully',
      data: updatedUser,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { isActive } = req.body;
    const updatedUser = await userService.toggleUserStatus(id, Boolean(isActive));
    const response: ApiResponse<typeof updatedUser> = {
      success: true,
      message: `User status updated to ${isActive ? 'active' : 'inactive'}`,
      data: updatedUser,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const changeUserRole = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { role } = req.body;
    const updatedUser = await userService.changeUserRole(id, role);
    const response: ApiResponse<typeof updatedUser> = {
      success: true,
      message: `User role changed to ${role}`,
      data: updatedUser,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await userService.deleteUser(req.user!.userId, id);
    const response: ApiResponse = {
      success: true,
      message: 'User deleted successfully',
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
