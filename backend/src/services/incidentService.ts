import {
  IncidentStatus,
  IncidentSeverity,
  IncidentDTO,
  IncidentTimelineDTO,
  IssueDTO,
  UserRole,
} from '@app-issue-track/shared';
import { prisma } from '../config/database.js';
import { projectAccessService } from './projectAccessService.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { JwtPayload } from '../middlewares/auth.js';

export const ALLOWED_INCIDENT_TRANSITIONS: Record<IncidentStatus, IncidentStatus[]> = {
  [IncidentStatus.DETECTED]: [IncidentStatus.ACKNOWLEDGED],
  [IncidentStatus.ACKNOWLEDGED]: [IncidentStatus.INVESTIGATING],
  [IncidentStatus.INVESTIGATING]: [IncidentStatus.MITIGATING],
  [IncidentStatus.MITIGATING]: [IncidentStatus.RESOLVED],
  [IncidentStatus.RESOLVED]: [IncidentStatus.CLOSED],
  [IncidentStatus.CLOSED]: [],
};

export class IncidentService {
  async createIncident(
    currentUser: JwtPayload,
    data: {
      projectId: string;
      applicationId: string;
      title: string;
      description: string;
      moduleComponent?: string;
      severity?: IncidentSeverity;
      sourceIssueId?: string;
      ownerId?: string;
      impactSummary?: string;
    }
  ): Promise<IncidentDTO> {
    const canAccess = await projectAccessService.canAccessProject(currentUser, data.projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have access to this project');
    }

    if (currentUser.role === UserRole.REPORTER) {
      throw ApiError.forbidden('Reporters cannot directly create incidents');
    }

    if (data.sourceIssueId) {
      const existingActive = await prisma.incident.findFirst({
        where: {
          sourceIssueId: data.sourceIssueId,
          status: { not: IncidentStatus.CLOSED },
        },
      });

      if (existingActive) {
        throw ApiError.badRequest(
          `An active incident (${existingActive.incidentKey}) already exists for this source issue`
        );
      }
    }

    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      select: { key: true, name: true, applicationId: true },
    });

    if (!project) {
      throw ApiError.notFound('Project not found');
    }

    const incCount = await prisma.incident.count({ where: { projectId: data.projectId } });
    const incidentKey = `INC-${project.key}-${(incCount + 1).toString().padStart(3, '0')}`;

    const incident = await prisma.incident.create({
      data: {
        incidentKey,
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        applicationId: data.applicationId || project.applicationId,
        moduleComponent: data.moduleComponent || null,
        severity: data.severity || IncidentSeverity.SEV3,
        status: IncidentStatus.DETECTED,
        ownerId: data.ownerId || null,
        sourceIssueId: data.sourceIssueId || null,
        impactSummary: data.impactSummary || null,
        detectedAt: new Date(),
      },
      include: {
        project: { select: { name: true } },
        application: { select: { name: true } },
        owner: { select: { firstName: true, lastName: true } },
        sourceIssue: { select: { issueKey: true } },
      },
    });

    await this.recordTimelineEvent({
      incidentId: incident.id,
      actorId: currentUser.userId,
      action: 'INCIDENT_DETECTED',
      newState: IncidentStatus.DETECTED,
      metadata: `Incident created with severity ${incident.severity}`,
    });

    // Notify project members
    const members = await prisma.projectMember.findMany({
      where: { projectId: data.projectId },
      select: { userId: true },
    });

    for (const m of members) {
      if (m.userId !== currentUser.userId) {
        await prisma.notification.create({
          data: {
            userId: m.userId,
            title: `Incident Created: ${incident.incidentKey}`,
            message: `New ${incident.severity} incident '${incident.title}' was created.`,
            link: `/incidents/${incident.id}`,
          },
        });
      }
    }

    return this.mapIncidentToDTO(incident);
  }

  async escalateIssueToIncident(
    currentUser: JwtPayload,
    issueId: string,
    severity: IncidentSeverity = IncidentSeverity.SEV2,
    impactSummary?: string
  ): Promise<IncidentDTO> {
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: {
        id: true,
        issueKey: true,
        title: true,
        description: true,
        projectId: true,
        applicationId: true,
        moduleComponent: true,
        assigneeId: true,
      },
    });

    if (!issue) {
      throw ApiError.notFound('Source issue not found');
    }

    const canAccess = await projectAccessService.canAccessProject(currentUser, issue.projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have access to this project');
    }

    // Check duplicate active incident
    const existingActive = await prisma.incident.findFirst({
      where: {
        sourceIssueId: issueId,
        status: { not: IncidentStatus.CLOSED },
      },
    });

    if (existingActive) {
      throw ApiError.badRequest(
        `Issue ${issue.issueKey} already has an active incident (${existingActive.incidentKey})`
      );
    }

    const incident = await this.createIncident(currentUser, {
      projectId: issue.projectId,
      applicationId: issue.applicationId,
      title: `[Escalated] ${issue.title}`,
      description: issue.description,
      moduleComponent: issue.moduleComponent || undefined,
      severity,
      sourceIssueId: issue.id,
      ownerId: issue.assigneeId || undefined,
      impactSummary: impactSummary || `Escalated from issue ${issue.issueKey}`,
    });

    // Record IssueHistory on source issue
    await prisma.issueHistory.create({
      data: {
        issueId: issue.id,
        changedById: currentUser.userId,
        actionType: 'STATUS_CHANGED',
        fieldChanged: 'incident',
        oldValue: 'NONE',
        newValue: incident.incidentKey,
      },
    });

    return incident;
  }

  async getIncidents(
    currentUser: JwtPayload,
    query?: { projectId?: string; severity?: IncidentSeverity; status?: IncidentStatus }
  ): Promise<IncidentDTO[]> {
    const accessibleProjectIds = await projectAccessService.getAccessibleProjectIds(currentUser);

    if (accessibleProjectIds !== null && accessibleProjectIds.length === 0) {
      return [];
    }

    const where: any = {};
    if (query?.projectId) {
      const canAccess = await projectAccessService.canAccessProject(currentUser, query.projectId);
      if (!canAccess) {
        throw ApiError.forbidden('You do not have access to this project');
      }
      where.projectId = query.projectId;
    } else if (accessibleProjectIds !== null) {
      where.projectId = { in: accessibleProjectIds };
    }

    if (query?.severity) where.severity = query.severity;
    if (query?.status) where.status = query.status;

    const incidents = await prisma.incident.findMany({
      where,
      include: {
        project: { select: { name: true } },
        application: { select: { name: true } },
        owner: { select: { firstName: true, lastName: true } },
        sourceIssue: { select: { issueKey: true } },
      },
      orderBy: [{ severity: 'asc' }, { detectedAt: 'desc' }],
    });

    return incidents.map(this.mapIncidentToDTO);
  }

  async getIncidentById(currentUser: JwtPayload, incidentId: string): Promise<IncidentDTO> {
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
      include: {
        project: { select: { name: true } },
        application: { select: { name: true } },
        owner: { select: { firstName: true, lastName: true } },
        sourceIssue: { select: { issueKey: true } },
      },
    });

    if (!incident) {
      throw ApiError.notFound('Incident not found');
    }

    const canAccess = await projectAccessService.canAccessProject(currentUser, incident.projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have access to this project');
    }

    return this.mapIncidentToDTO(incident);
  }

  async acknowledgeIncident(currentUser: JwtPayload, incidentId: string): Promise<IncidentDTO> {
    return this.transitionIncidentStatus(currentUser, incidentId, IncidentStatus.ACKNOWLEDGED);
  }

  async transitionIncidentStatus(
    currentUser: JwtPayload,
    incidentId: string,
    newStatus: IncidentStatus
  ): Promise<IncidentDTO> {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw ApiError.notFound('Incident not found');

    const canAccess = await projectAccessService.canAccessProject(currentUser, incident.projectId);
    if (!canAccess) throw ApiError.forbidden('You do not have access to this project');

    if (currentUser.role === UserRole.REPORTER) {
      throw ApiError.forbidden('Reporters cannot change incident status');
    }

    const allowed = ALLOWED_INCIDENT_TRANSITIONS[incident.status as IncidentStatus];
    if (!allowed.includes(newStatus)) {
      throw ApiError.badRequest(
        `Invalid status transition from ${incident.status} to ${newStatus}. Allowed transitions: ${allowed.join(', ') || 'None'}`
      );
    }

    const updateData: any = { status: newStatus };
    const now = new Date();

    if (newStatus === IncidentStatus.ACKNOWLEDGED) updateData.acknowledgedAt = now;
    if (newStatus === IncidentStatus.INVESTIGATING) updateData.investigatingAt = now;
    if (newStatus === IncidentStatus.MITIGATING) updateData.mitigatingAt = now;
    if (newStatus === IncidentStatus.RESOLVED) updateData.resolvedAt = now;
    if (newStatus === IncidentStatus.CLOSED) updateData.closedAt = now;

    const updated = await prisma.incident.update({
      where: { id: incidentId },
      data: updateData,
      include: {
        project: { select: { name: true } },
        application: { select: { name: true } },
        owner: { select: { firstName: true, lastName: true } },
        sourceIssue: { select: { issueKey: true } },
      },
    });

    await this.recordTimelineEvent({
      incidentId,
      actorId: currentUser.userId,
      action: `STATUS_CHANGED_${newStatus}`,
      oldState: incident.status,
      newState: newStatus,
    });

    return this.mapIncidentToDTO(updated);
  }

  async assignIncidentOwner(currentUser: JwtPayload, incidentId: string, ownerId: string): Promise<IncidentDTO> {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw ApiError.notFound('Incident not found');

    const canAccess = await projectAccessService.canAccessProject(currentUser, incident.projectId);
    if (!canAccess) throw ApiError.forbidden('You do not have access to this project');

    if (currentUser.role === UserRole.REPORTER) {
      throw ApiError.forbidden('Reporters cannot assign incident owners');
    }

    const targetUser = await prisma.user.findUnique({ where: { id: ownerId } });
    if (!targetUser) throw ApiError.notFound('Target owner user not found');

    const updated = await prisma.incident.update({
      where: { id: incidentId },
      data: { ownerId },
      include: {
        project: { select: { name: true } },
        application: { select: { name: true } },
        owner: { select: { firstName: true, lastName: true } },
        sourceIssue: { select: { issueKey: true } },
      },
    });

    await this.recordTimelineEvent({
      incidentId,
      actorId: currentUser.userId,
      action: 'OWNER_ASSIGNED',
      metadata: `Assigned to ${targetUser.firstName} ${targetUser.lastName}`,
    });

    return this.mapIncidentToDTO(updated);
  }

  async resolveIncident(currentUser: JwtPayload, incidentId: string, impactSummary?: string): Promise<IncidentDTO> {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw ApiError.notFound('Incident not found');

    if (impactSummary) {
      await prisma.incident.update({ where: { id: incidentId }, data: { impactSummary } });
    }

    return this.transitionIncidentStatus(currentUser, incidentId, IncidentStatus.RESOLVED);
  }

  async closeIncident(currentUser: JwtPayload, incidentId: string): Promise<IncidentDTO> {
    return this.transitionIncidentStatus(currentUser, incidentId, IncidentStatus.CLOSED);
  }

  async getIncidentTimeline(currentUser: JwtPayload, incidentId: string): Promise<IncidentTimelineDTO[]> {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw ApiError.notFound('Incident not found');

    const canAccess = await projectAccessService.canAccessProject(currentUser, incident.projectId);
    if (!canAccess) throw ApiError.forbidden('You do not have access to this project');

    const timeline = await prisma.incidentTimeline.findMany({
      where: { incidentId },
      include: { actor: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'asc' },
    });

    return timeline.map((t) => ({
      id: t.id,
      incidentId: t.incidentId,
      actorId: t.actorId,
      actorName: `${t.actor.firstName} ${t.actor.lastName}`,
      action: t.action,
      oldState: t.oldState,
      newState: t.newState,
      metadata: t.metadata,
      createdAt: t.createdAt.toISOString(),
    }));
  }

  async getRelatedIssues(currentUser: JwtPayload, incidentId: string): Promise<IssueDTO[]> {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw ApiError.notFound('Incident not found');

    const canAccess = await projectAccessService.canAccessProject(currentUser, incident.projectId);
    if (!canAccess) throw ApiError.forbidden('You do not have access to this project');

    const issues = await prisma.issue.findMany({
      where: {
        projectId: incident.projectId,
        OR: [
          { moduleComponent: incident.moduleComponent || undefined },
          { priority: 'CRITICAL' },
        ],
      },
      include: {
        project: { select: { name: true } },
        application: { select: { name: true } },
        reporter: { select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true, updatedAt: true } },
        assignee: { select: { id: true, email: true, firstName: true, lastName: true, role: true, isActive: true, createdAt: true, updatedAt: true } },
      },
      take: 5,
    });

    return issues.map((i) => ({
      id: i.id,
      issueKey: i.issueKey,
      title: i.title,
      description: i.description,
      applicationId: i.applicationId,
      applicationName: i.application.name,
      projectId: i.projectId,
      projectName: i.project.name,
      moduleComponent: i.moduleComponent,
      reporterId: i.reporterId,
      reporter: i.reporter as any,
      assigneeId: i.assigneeId,
      assignee: i.assignee as any,
      status: i.status as any,
      priority: i.priority as any,
      severity: i.severity as any,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    }));
  }

  private async recordTimelineEvent(data: {
    incidentId: string;
    actorId: string;
    action: string;
    oldState?: string;
    newState?: string;
    metadata?: string;
  }): Promise<void> {
    await prisma.incidentTimeline.create({
      data: {
        incidentId: data.incidentId,
        actorId: data.actorId,
        action: data.action,
        oldState: data.oldState || null,
        newState: data.newState || null,
        metadata: data.metadata || null,
      },
    });
  }

  private mapIncidentToDTO(inc: any): IncidentDTO {
    return {
      id: inc.id,
      incidentKey: inc.incidentKey,
      title: inc.title,
      description: inc.description,
      projectId: inc.projectId,
      projectName: inc.project?.name,
      applicationId: inc.applicationId,
      applicationName: inc.application?.name,
      moduleComponent: inc.moduleComponent,
      severity: inc.severity,
      status: inc.status,
      ownerId: inc.ownerId,
      ownerName: inc.owner ? `${inc.owner.firstName} ${inc.owner.lastName}` : null,
      sourceIssueId: inc.sourceIssueId,
      sourceIssueKey: inc.sourceIssue?.issueKey || null,
      detectedAt: inc.detectedAt ? new Date(inc.detectedAt).toISOString() : inc.createdAt.toISOString(),
      acknowledgedAt: inc.acknowledgedAt ? new Date(inc.acknowledgedAt).toISOString() : null,
      investigatingAt: inc.investigatingAt ? new Date(inc.investigatingAt).toISOString() : null,
      mitigatingAt: inc.mitigatingAt ? new Date(inc.mitigatingAt).toISOString() : null,
      resolvedAt: inc.resolvedAt ? new Date(inc.resolvedAt).toISOString() : null,
      closedAt: inc.closedAt ? new Date(inc.closedAt).toISOString() : null,
      impactSummary: inc.impactSummary,
      createdAt: inc.createdAt.toISOString(),
      updatedAt: inc.updatedAt.toISOString(),
    };
  }
}

export const incidentService = new IncidentService();
