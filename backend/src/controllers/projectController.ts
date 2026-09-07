import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '@app-issue-track/shared';
import { projectService } from '../services/projectService.js';

export const getProjects = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const applicationId = req.query.applicationId as string | undefined;
    const projects = await projectService.getProjects(req.user!, applicationId);
    const response: ApiResponse<typeof projects> = {
      success: true,
      data: projects,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getProjectById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const project = await projectService.getProjectById(req.user!, id);
    const response: ApiResponse<typeof project> = {
      success: true,
      data: project,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const createProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const project = await projectService.createProject(req.body);
    const response: ApiResponse<typeof project> = {
      success: true,
      message: 'Project created successfully',
      data: project,
      timestamp: new Date().toISOString(),
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const updateProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const project = await projectService.updateProject(id, req.body);
    const response: ApiResponse<typeof project> = {
      success: true,
      message: 'Project updated successfully',
      data: project,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const deleteProject = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    await projectService.deleteProject(id);
    const response: ApiResponse = {
      success: true,
      message: 'Project deleted successfully',
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getProjectMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const members = await projectService.getProjectMembers(req.user!, id);
    const response: ApiResponse<typeof members> = {
      success: true,
      data: members,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const addProjectMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { userId, roleInProject } = req.body;
    const member = await projectService.addProjectMember(req.user!, id, userId, roleInProject);
    const response: ApiResponse<typeof member> = {
      success: true,
      message: 'User added to project members',
      data: member,
      timestamp: new Date().toISOString(),
    };
    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
};

export const removeProjectMember = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const id = req.params.id as string;
    const userId = req.params.userId as string;
    await projectService.removeProjectMember(req.user!, id, userId);
    const response: ApiResponse = {
      success: true,
      message: 'User removed from project members',
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getTeamMembers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const members = await projectService.getTeamMembers(req.user!);
    const response: ApiResponse<typeof members> = {
      success: true,
      data: members,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
