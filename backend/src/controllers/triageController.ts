import { Request, Response, NextFunction } from 'express';
import { ApiResponse, IssueTriageAnalysis, DuplicateCandidateItem, IssuePriority, IssueSeverity } from '@app-issue-track/shared';
import { issueTriageService } from '../ai/triage/issueTriageService.js';
import { duplicateDetectionService } from '../ai/triage/duplicateDetectionService.js';
import { prisma } from '../config/database.js';
import { projectAccessService } from '../services/projectAccessService.js';
import { ApiError } from '../middlewares/errorHandler.js';

export const analyzeDraftIssue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const analysis = await issueTriageService.analyzeDraftIssue(req.user!, req.body);
    const response: ApiResponse<IssueTriageAnalysis> = {
      success: true,
      message: 'Draft issue triage analysis generated successfully',
      data: analysis,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getDuplicateCandidates = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const issueId = req.params.id as string;
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: {
        id: true,
        projectId: true,
        applicationId: true,
        title: true,
        description: true,
        moduleComponent: true,
      },
    });

    if (!issue) {
      throw ApiError.notFound(`Issue with ID '${issueId}' not found`);
    }

    const canAccess = await projectAccessService.canAccessProject(req.user!, issue.projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have access to search duplicate candidates for this issue');
    }

    const duplicates = await duplicateDetectionService.getDuplicateCandidates(
      req.user!,
      {
        projectId: issue.projectId,
        applicationId: issue.applicationId,
        title: issue.title,
        description: issue.description,
        moduleComponent: issue.moduleComponent,
      },
      issue.id
    );

    const response: ApiResponse<DuplicateCandidateItem[]> = {
      success: true,
      data: duplicates,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const triageIssue = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const issueId = req.params.id as string;
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      throw ApiError.notFound(`Issue with ID '${issueId}' not found`);
    }

    const canAccess = await projectAccessService.canAccessProject(req.user!, issue.projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have access to run triage for this issue');
    }

    const analysis = await issueTriageService.analyzeDraftIssue(
      req.user!,
      {
        applicationId: issue.applicationId,
        projectId: issue.projectId,
        title: issue.title,
        description: issue.description,
        moduleComponent: issue.moduleComponent,
        environment: issue.environment,
        stepsToReproduce: issue.stepsToReproduce,
        expectedResult: issue.expectedResult,
        actualResult: issue.actualResult,
        priority: issue.priority as IssuePriority,
        severity: issue.severity as IssueSeverity,
      },
      issue.id
    );

    const response: ApiResponse<IssueTriageAnalysis> = {
      success: true,
      message: 'Issue re-triage analysis generated successfully',
      data: analysis,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};
