import { AnalyticsOverview } from '@app-issue-track/shared';
import { prisma } from '../../config/database.js';
import { backlogForecastService } from './backlogForecastService.js';
import { slaForecastService } from './slaForecastService.js';
import { capacityForecastService } from './capacityForecastService.js';
import { componentForecastService } from './componentForecastService.js';
import { incidentForecastService } from './incidentForecastService.js';
import { deliveryRiskService } from './deliveryRiskService.js';
import { projectAccessService } from '../projectAccessService.js';
import { JwtPayload } from '../../middlewares/auth.js';
import { ApiError } from '../../middlewares/errorHandler.js';

export class AnalyticsAggregationService {
  async getAnalyticsOverview(
    currentUser: JwtPayload,
    projectIdInput?: string
  ): Promise<AnalyticsOverview | null> {
    let projectId = projectIdInput;

    if (!projectId) {
      const accessibleProjectIds = await projectAccessService.getAccessibleProjectIds(currentUser);
      if (accessibleProjectIds === null) {
        const firstProject = await prisma.project.findFirst({ select: { id: true } });
        if (!firstProject) return null;
        projectId = firstProject.id;
      } else if (accessibleProjectIds.length === 0) {
        return null;
      } else {
        projectId = accessibleProjectIds[0];
      }
    }

    const canAccess = await projectAccessService.canAccessProject(currentUser, projectId);
    if (!canAccess) throw ApiError.forbidden('You do not have access to this project');

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, name: true, key: true },
    });

    if (!project) throw ApiError.notFound('Project not found');

    const [backlogForecast, slaForecast, developerCapacityForecasts, componentForecasts, incidentForecast, deliveryRisk] =
      await Promise.all([
        backlogForecastService.forecastBacklog(currentUser, projectId),
        slaForecastService.forecastSla(currentUser, projectId),
        capacityForecastService.forecastDeveloperCapacity(currentUser, projectId),
        componentForecastService.forecastComponents(currentUser, projectId),
        incidentForecastService.forecastIncidents(currentUser, projectId),
        deliveryRiskService.calculateDeliveryRisk(currentUser, projectId),
      ]);

    return {
      projectId: project.id,
      projectName: project.name,
      projectKey: project.key,
      generatedAt: new Date().toISOString(),
      backlogForecast,
      slaForecast,
      developerCapacityForecasts,
      componentForecasts,
      incidentForecast,
      deliveryRisk,
    };
  }
}

export const analyticsAggregationService = new AnalyticsAggregationService();
