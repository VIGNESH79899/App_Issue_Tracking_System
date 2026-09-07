import { Request, Response, NextFunction } from 'express';
import { ApiResponse, CommandCenterOverview, CriticalIssueSummary } from '@app-issue-track/shared';
import { projectAccessService } from '../services/projectAccessService.js';
import { projectHealthService } from '../services/projectHealthService.js';
import { predictiveRiskService } from '../services/predictiveRiskService.js';
import { developerCapacityService } from '../services/developerCapacityService.js';
import { componentRiskService } from '../services/componentRiskService.js';
import { bottleneckService } from '../services/bottleneckService.js';
import { trendService } from '../services/trendService.js';
import { projectBriefingService } from '../ai/projectBriefingService.js';
import { slaService } from '../services/slaService.js';
import { prisma } from '../config/database.js';
import { ApiError } from '../middlewares/errorHandler.js';

async function resolveTargetProjectId(req: Request): Promise<string | null> {
  const queryProjectId = req.query.projectId as string;
  if (queryProjectId) {
    const canAccess = await projectAccessService.canAccessProject(req.user!, queryProjectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have access to this project');
    }
    return queryProjectId;
  }

  const accessibleProjectIds = await projectAccessService.getAccessibleProjectIds(req.user!);
  if (accessibleProjectIds === null) {
    const firstProject = await prisma.project.findFirst({ select: { id: true } });
    return firstProject ? firstProject.id : null;
  }

  if (accessibleProjectIds.length === 0) {
    return null;
  }

  return accessibleProjectIds[0];
}

export const getOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = await resolveTargetProjectId(req);
    if (!projectId) {
      const emptyOverview: ApiResponse<CommandCenterOverview | null> = {
        success: true,
        message: 'No project assigned',
        data: null,
        timestamp: new Date().toISOString(),
      };
      res.status(200).json(emptyOverview);
      return;
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, key: true },
    });

    if (!project) {
      throw ApiError.notFound(`Project with ID '${projectId}' not found`);
    }

    const health = await projectHealthService.calculateProjectHealth(req.user!, projectId);

    const issues = await prisma.issue.findMany({
      where: { projectId },
      select: {
        id: true,
        status: true,
        priority: true,
        createdAt: true,
        resolvedAt: true,
        closedAt: true,
        dueDate: true,
      },
    });

    const activeIssueCount = issues.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
    const criticalIssueCount = issues.filter(
      (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED' && i.priority === 'CRITICAL'
    ).length;
    const highPriorityCount = issues.filter(
      (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED' && i.priority === 'HIGH'
    ).length;

    let slaBreachedCount = 0;
    let slaAtRiskCount = 0;
    for (const i of issues) {
      const sla = slaService.calculateSlaForIssue(i as any);
      if (sla.responseStatus === 'BREACHED' || sla.resolutionStatus === 'BREACHED') {
        slaBreachedCount++;
      } else if (sla.responseStatus === 'AT_RISK' || sla.resolutionStatus === 'AT_RISK') {
        slaAtRiskCount++;
      }
    }

    const totalIssues = Math.max(1, issues.length);
    const slaCompliancePercentage = Math.round(((totalIssues - slaBreachedCount) / totalIssues) * 100);

    const overview: CommandCenterOverview = {
      projectId: project.id,
      projectName: project.name,
      projectKey: project.key,
      health,
      activeIssueCount,
      criticalIssueCount,
      highPriorityCount,
      slaCompliancePercentage,
      slaBreachedCount,
      slaAtRiskCount,
      averageResolutionHours: 24.5,
      averageResponseHours: 1.8,
    };

    const response: ApiResponse<CommandCenterOverview> = {
      success: true,
      data: overview,
      timestamp: new Date().toISOString(),
    };
    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

export const getHealth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = await resolveTargetProjectId(req);
    if (!projectId) {
      res.status(200).json({ success: true, data: null, timestamp: new Date().toISOString() });
      return;
    }
    const health = await projectHealthService.calculateProjectHealth(req.user!, projectId);
    res.status(200).json({ success: true, data: health, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getTrends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = await resolveTargetProjectId(req);
    if (!projectId) {
      res.status(200).json({ success: true, data: { period: '7d', points: [] }, timestamp: new Date().toISOString() });
      return;
    }
    const period = (req.query.period as '7d' | '14d' | '30d') || '7d';
    const trends = await trendService.getEngineeringTrends(req.user!, projectId, period);
    res.status(200).json({ success: true, data: trends, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getDevelopers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = await resolveTargetProjectId(req);
    if (!projectId) {
      res.status(200).json({ success: true, data: [], timestamp: new Date().toISOString() });
      return;
    }
    const capacity = await developerCapacityService.getDeveloperCapacity(req.user!, projectId);
    res.status(200).json({ success: true, data: capacity, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getComponents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = await resolveTargetProjectId(req);
    if (!projectId) {
      res.status(200).json({ success: true, data: [], timestamp: new Date().toISOString() });
      return;
    }
    const components = await componentRiskService.getComponentRiskSummaries(req.user!, projectId);
    res.status(200).json({ success: true, data: components, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getBottlenecks = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = await resolveTargetProjectId(req);
    if (!projectId) {
      res.status(200).json({ success: true, data: [], timestamp: new Date().toISOString() });
      return;
    }
    const bottlenecks = await bottleneckService.detectBottlenecks(req.user!, projectId);
    res.status(200).json({ success: true, data: bottlenecks, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getCriticalIssues = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = await resolveTargetProjectId(req);
    if (!projectId) {
      res.status(200).json({ success: true, data: [], timestamp: new Date().toISOString() });
      return;
    }

    const issues = await prisma.issue.findMany({
      where: {
        projectId,
        status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'REOPENED'] },
      },
      include: {
        project: { select: { name: true } },
        assignee: { select: { firstName: true, lastName: true } },
      },
      take: 10,
      orderBy: [{ priority: 'desc' }, { createdAt: 'asc' }],
    });

    const criticalList: CriticalIssueSummary[] = [];

    for (const issue of issues) {
      const pred = await predictiveRiskService.predictSlaRisk(req.user!, issue.id);
      const sla = slaService.calculateSlaForIssue(issue as any);

      criticalList.push({
        issueId: issue.id,
        issueKey: issue.issueKey,
        title: issue.title,
        projectName: issue.project.name,
        component: issue.moduleComponent || 'General',
        priority: issue.priority as any,
        severity: issue.severity as any,
        status: issue.status as any,
        slaStatus: sla.resolutionStatus,
        riskLevel: pred.riskLevel,
        assigneeName: issue.assignee ? `${issue.assignee.firstName} ${issue.assignee.lastName}` : null,
        createdAt: issue.createdAt.toISOString(),
      });
    }

    res.status(200).json({ success: true, data: criticalList, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};

export const getBriefing = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const projectId = await resolveTargetProjectId(req);
    if (!projectId) {
      res.status(200).json({
        success: true,
        data: {
          executiveSummary: 'No accessible project assigned.',
          keyRisks: [],
          positiveSignals: [],
          recommendedActions: [],
          areasToMonitor: [],
          generatedAt: new Date().toISOString(),
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }
    const briefing = await projectBriefingService.generateBriefing(req.user!, projectId);
    res.status(200).json({ success: true, data: briefing, timestamp: new Date().toISOString() });
  } catch (error) {
    next(error);
  }
};
