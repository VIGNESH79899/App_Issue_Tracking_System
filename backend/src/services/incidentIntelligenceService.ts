import {
  IncidentMetricsDTO,
  IncidentRecurrenceDTO,
  IncidentSeverity,
} from '@app-issue-track/shared';
import { prisma } from '../config/database.js';
import { projectAccessService } from './projectAccessService.js';
import { JwtPayload } from '../middlewares/auth.js';
import { ApiError } from '../middlewares/errorHandler.js';

export class IncidentIntelligenceService {
  async getProjectIncidentMetrics(
    currentUser: JwtPayload,
    projectId?: string
  ): Promise<IncidentMetricsDTO> {
    const accessibleProjectIds = await projectAccessService.getAccessibleProjectIds(currentUser);
    if (accessibleProjectIds !== null && accessibleProjectIds.length === 0) {
      return {
        mttaHours: null,
        mttrHours: null,
        activeCount: 0,
        sev1Count: 0,
        sev2Count: 0,
        slaBreachedCount: 0,
        escalationCount: 0,
        recurrenceRate: 0,
      };
    }

    const where: any = {};
    if (projectId) {
      const canAccess = await projectAccessService.canAccessProject(currentUser, projectId);
      if (!canAccess) throw ApiError.forbidden('You do not have access to this project');
      where.projectId = projectId;
    } else if (accessibleProjectIds !== null) {
      where.projectId = { in: accessibleProjectIds };
    }

    const incidents = await prisma.incident.findMany({ where });

    const activeCount = incidents.filter((i) => i.status !== 'CLOSED').length;
    const sev1Count = incidents.filter((i) => i.severity === 'SEV1').length;
    const sev2Count = incidents.filter((i) => i.severity === 'SEV2').length;

    // Calculate MTTA (Mean Time to Acknowledge)
    const ackDurations: number[] = [];
    for (const inc of incidents) {
      if (inc.acknowledgedAt && inc.detectedAt) {
        const diffMs = new Date(inc.acknowledgedAt).getTime() - new Date(inc.detectedAt).getTime();
        if (diffMs >= 0) ackDurations.push(diffMs / (1000 * 60 * 60));
      }
    }
    const mttaHours =
      ackDurations.length > 0
        ? Math.round((ackDurations.reduce((a, b) => a + b, 0) / ackDurations.length) * 10) / 10
        : null;

    // Calculate MTTR (Mean Time to Resolve)
    const resDurations: number[] = [];
    for (const inc of incidents) {
      if (inc.resolvedAt && inc.detectedAt) {
        const diffMs = new Date(inc.resolvedAt).getTime() - new Date(inc.detectedAt).getTime();
        if (diffMs >= 0) resDurations.push(diffMs / (1000 * 60 * 60));
      }
    }
    const mttrHours =
      resDurations.length > 0
        ? Math.round((resDurations.reduce((a, b) => a + b, 0) / resDurations.length) * 10) / 10
        : null;

    // SLA Breached Count (Unacknowledged SEV1 > 15m or SEV2 > 30m)
    let slaBreachedCount = 0;
    const now = new Date().getTime();
    for (const inc of incidents) {
      const detectedTime = new Date(inc.detectedAt).getTime();
      const elapsedMinutes = (now - detectedTime) / (1000 * 60);
      if (
        (!inc.acknowledgedAt && inc.severity === 'SEV1' && elapsedMinutes > 15) ||
        (!inc.acknowledgedAt && inc.severity === 'SEV2' && elapsedMinutes > 30)
      ) {
        slaBreachedCount++;
      }
    }

    // Component recurrence count
    const compMap = new Map<string, number>();
    for (const inc of incidents) {
      if (inc.moduleComponent) {
        compMap.set(inc.moduleComponent, (compMap.get(inc.moduleComponent) || 0) + 1);
      }
    }
    let recurringComps = 0;
    compMap.forEach((count) => {
      if (count > 1) recurringComps++;
    });

    const recurrenceRate =
      incidents.length > 0 ? Math.round((recurringComps / Math.max(1, compMap.size)) * 100) : 0;

    return {
      mttaHours,
      mttrHours,
      activeCount,
      sev1Count,
      sev2Count,
      slaBreachedCount,
      escalationCount: slaBreachedCount + (sev1Count > 0 ? 1 : 0),
      recurrenceRate,
    };
  }

  async getIncidentRecurrence(
    currentUser: JwtPayload,
    incidentId: string
  ): Promise<IncidentRecurrenceDTO> {
    const incident = await prisma.incident.findUnique({ where: { id: incidentId } });
    if (!incident) throw ApiError.notFound('Incident not found');

    const canAccess = await projectAccessService.canAccessProject(currentUser, incident.projectId);
    if (!canAccess) throw ApiError.forbidden('You do not have access to this project');

    if (!incident.moduleComponent) {
      return {
        recurrenceCount: 0,
        previousIncidents: [],
        recurrenceRisk: 'LOW',
        explanation: 'No module/component specified for recurrence tracking.',
      };
    }

    const previous = await prisma.incident.findMany({
      where: {
        projectId: incident.projectId,
        moduleComponent: incident.moduleComponent,
        id: { not: incident.id },
      },
      select: { id: true, incidentKey: true, title: true, detectedAt: true },
      orderBy: { detectedAt: 'desc' },
      take: 5,
    });

    const recurrenceCount = previous.length;
    let recurrenceRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (recurrenceCount >= 3) recurrenceRisk = 'CRITICAL';
    else if (recurrenceCount === 2) recurrenceRisk = 'HIGH';
    else if (recurrenceCount === 1) recurrenceRisk = 'MEDIUM';

    return {
      recurrenceCount,
      previousIncidents: previous.map((p) => ({
        id: p.id,
        incidentKey: p.incidentKey,
        title: p.title,
        detectedAt: p.detectedAt.toISOString(),
      })),
      recurrenceRisk,
      explanation:
        recurrenceCount > 0
          ? `${recurrenceCount} prior incident(s) detected in component '${incident.moduleComponent}'.`
          : `Zero prior incidents detected in component '${incident.moduleComponent}'.`,
    };
  }
}

export const incidentIntelligenceService = new IncidentIntelligenceService();
