import {
  IncidentForecast,
  ForecastConfidence,
  ForecastDirection,
} from '@app-issue-track/shared';
import { prisma } from '../../config/database.js';
import { incidentIntelligenceService } from '../incidentIntelligenceService.js';
import { projectAccessService } from '../projectAccessService.js';
import { JwtPayload } from '../../middlewares/auth.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import { deriveConfidence, deriveDirection } from './analyticsMath.js';

export class IncidentForecastService {
  async forecastIncidents(currentUser: JwtPayload, projectId: string): Promise<IncidentForecast> {
    const canAccess = await projectAccessService.canAccessProject(currentUser, projectId);
    if (!canAccess) throw ApiError.forbidden('You do not have access to this project');

    const metrics = await incidentIntelligenceService.getProjectIncidentMetrics(currentUser, projectId);

    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const twentyEightDaysAgo = new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const incidents = await prisma.incident.findMany({
      where: {
        projectId,
        detectedAt: { gte: thirtyDaysAgo },
      },
      select: {
        detectedAt: true,
        moduleComponent: true,
      },
    });
    const totalIncidents = await prisma.incident.count({ where: { projectId } });

    if (totalIncidents === 0) {
      return {
        currentIncidentCount: 0,
        incidentsLast7Days: 0,
        incidentsLast30Days: 0,
        projectedIncidents14Days: 0,
        recurrenceDirection: ForecastDirection.STABLE,
        recurrenceRisk: 'LOW',
        confidence: ForecastConfidence.INSUFFICIENT_DATA,
        explanation: ['Zero historical incidents logged for project.'],
      };
    }

    const incsLast7Days = incidents.filter((incident) => incident.detectedAt >= sevenDaysAgo).length;
    const incsLast14Days = incidents.filter((incident) => incident.detectedAt >= fourteenDaysAgo).length;
    const incsPrev14Days = incidents.filter(
      (incident) => incident.detectedAt >= twentyEightDaysAgo && incident.detectedAt < fourteenDaysAgo
    ).length;
    const incsLast30Days = incidents.length;
    const projected14Days = Math.max(0, Math.round(incsLast14Days + (incsLast14Days - incsPrev14Days)));
    const recurrenceDirection = deriveDirection((incsLast14Days - incsPrev14Days) / 14, 0.05);
    let recurrenceRisk = 'LOW';
    if (metrics.recurrenceRate >= 50 || metrics.sev1Count > 1) recurrenceRisk = 'CRITICAL';
    else if (metrics.recurrenceRate >= 25 || incsLast14Days > 1) recurrenceRisk = 'HIGH';
    else if (incsLast7Days > 0) recurrenceRisk = 'MEDIUM';
    const confidence = deriveConfidence(totalIncidents, incsLast14Days + incsPrev14Days);

    return {
      currentIncidentCount: metrics.activeCount,
      incidentsLast7Days: incsLast7Days,
      incidentsLast30Days: incsLast30Days,
      projectedIncidents14Days: projected14Days,
      recurrenceDirection,
      recurrenceRisk,
      confidence,
      explanation: [
        `CURRENT FACT: ${metrics.activeCount} active incidents, ${incsLast7Days} in the last 7 days, ${incsLast30Days} in the last 30 days.`,
        `DETERMINISTIC CALCULATION: next 14-day incident count = recent 14-day count ${incsLast14Days} + trend delta (${incsLast14Days} - ${incsPrev14Days}).`,
        `FORECAST: recurrence risk uses current recurrence rate ${metrics.recurrenceRate}% plus recent incident acceleration.`,
      ],
    };
  }
}

export const incidentForecastService = new IncidentForecastService();
