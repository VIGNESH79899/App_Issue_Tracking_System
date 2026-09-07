import {
  ProjectDeliveryRisk,
  ForecastConfidence,
} from '@app-issue-track/shared';
import { backlogForecastService } from './backlogForecastService.js';
import { slaForecastService } from './slaForecastService.js';
import { capacityForecastService } from './capacityForecastService.js';
import { incidentForecastService } from './incidentForecastService.js';
import { projectHealthService } from '../projectHealthService.js';
import { projectAccessService } from '../projectAccessService.js';
import { incidentIntelligenceService } from '../incidentIntelligenceService.js';
import { JwtPayload } from '../../middlewares/auth.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import { clamp } from './analyticsMath.js';

export class DeliveryRiskService {
  async calculateDeliveryRisk(currentUser: JwtPayload, projectId: string): Promise<ProjectDeliveryRisk> {
    const canAccess = await projectAccessService.canAccessProject(currentUser, projectId);
    if (!canAccess) throw ApiError.forbidden('You do not have access to this project');

    const [health, backlog, sla, capacity, incident, incidentMetrics] = await Promise.all([
      projectHealthService.calculateProjectHealth(currentUser, projectId),
      backlogForecastService.forecastBacklog(currentUser, projectId),
      slaForecastService.forecastSla(currentUser, projectId),
      capacityForecastService.forecastDeveloperCapacity(currentUser, projectId),
      incidentForecastService.forecastIncidents(currentUser, projectId),
      incidentIntelligenceService.getProjectIncidentMetrics(currentUser, projectId),
    ]);

    const projectedBacklogDelta = backlog.forecast14Days - backlog.currentBacklog;
    const backlogPressure = clamp(
      Math.round(
        Math.max(0, projectedBacklogDelta) * 4 +
          Math.max(0, projectedBacklogDelta / Math.max(1, backlog.currentBacklog)) * 35
      ),
      0,
      100
    );
    const slaPressure = clamp(
      Math.round((100 - sla.currentCompliancePercentage) * 0.45 + (100 - sla.forecast14Days) * 0.35 + sla.expectedBreachedIssues * 8),
      0,
      100
    );
    const overloadedCount = capacity.filter(
      (item) => item.currentCapacity === 'OVERLOADED' || item.projectedCapacity === 'OVERLOADED'
    ).length;
    const busyCount = capacity.filter(
      (item) => item.currentCapacity === 'BUSY' || item.projectedCapacity === 'BUSY'
    ).length;
    const capacityPressure = clamp(
      Math.round(
        (overloadedCount / Math.max(1, capacity.length)) * 70 +
          (busyCount / Math.max(1, capacity.length)) * 30 +
          capacity.filter((item) => item.riskLevel === 'HIGH' || item.riskLevel === 'CRITICAL').length * 5
      ),
      0,
      100
    );
    const incidentPressure = clamp(
      Math.round(
        incident.projectedIncidents14Days * 10 +
          incidentMetrics.recurrenceRate * 0.5 +
          incidentMetrics.sev1Count * 10 +
          incidentMetrics.slaBreachedCount * 8
      ),
      0,
      100
    );
    const resolutionPressure = clamp(Math.round(100 - health.breakdown.resolutionVelocity), 0, 100);

    const totalScore = Math.round(
      backlogPressure * 0.25 +
        slaPressure * 0.25 +
        capacityPressure * 0.20 +
        incidentPressure * 0.15 +
        resolutionPressure * 0.15
    );

    let level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (totalScore >= 75) level = 'CRITICAL';
    else if (totalScore >= 55) level = 'HIGH';
    else if (totalScore >= 35) level = 'MEDIUM';

    let confidence = ForecastConfidence.HIGH;
    if (
      backlog.confidence === ForecastConfidence.INSUFFICIENT_DATA ||
      sla.confidence === ForecastConfidence.INSUFFICIENT_DATA ||
      incident.confidence === ForecastConfidence.INSUFFICIENT_DATA
    ) {
      confidence = ForecastConfidence.INSUFFICIENT_DATA;
    } else if (
      backlog.confidence === ForecastConfidence.LOW ||
      sla.confidence === ForecastConfidence.LOW ||
      incident.confidence === ForecastConfidence.LOW
    ) {
      confidence = ForecastConfidence.LOW;
    } else if (
      backlog.confidence === ForecastConfidence.MEDIUM ||
      sla.confidence === ForecastConfidence.MEDIUM ||
      incident.confidence === ForecastConfidence.MEDIUM
    ) {
      confidence = ForecastConfidence.MEDIUM;
    }

    const reasons: string[] = [];
    reasons.push(
      `DETERMINISTIC CALCULATION: delivery risk = backlog*0.25 + SLA*0.25 + capacity*0.20 + incident*0.15 + resolution*0.15.`
    );
    if (projectedBacklogDelta > 0) {
      reasons.push(`FORECAST: backlog is projected to grow by ${projectedBacklogDelta} issues over 14 days.`);
    }
    if (sla.currentCompliancePercentage < 90) {
      reasons.push(`CURRENT FACT: SLA compliance is ${sla.currentCompliancePercentage}% with ${sla.expectedBreachedIssues} projected breaches in 14 days.`);
    }
    if (overloadedCount > 0) {
      reasons.push(`CURRENT FACT + FORECAST: ${overloadedCount} developer(s) are overloaded or projected to overload; ${busyCount} are busy.`);
    }
    if (incident.currentIncidentCount > 0 || incident.incidentsLast7Days > 0) {
      reasons.push(`CURRENT FACT: ${incident.currentIncidentCount} active incidents and ${incident.incidentsLast7Days} incidents in the last 7 days.`);
    }
    if (reasons.length === 1) {
      reasons.push('Project delivery operational indicators are functioning within normal capacity parameters.');
    }

    return {
      score: totalScore,
      level,
      currentHealthScore: health.score,
      backlogPressure,
      slaPressure,
      capacityPressure,
      incidentPressure,
      resolutionPressure,
      confidence,
      reasons,
    };
  }
}

export const deliveryRiskService = new DeliveryRiskService();
