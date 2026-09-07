import { AIAnalyticsBriefing } from '@app-issue-track/shared';
import { analyticsAggregationService } from '../services/analytics/analyticsAggregationService.js';
import { analyticsBriefingSchema } from './schemas/analyticsBriefingSchema.js';
import { projectAccessService } from '../services/projectAccessService.js';
import { GeminiProvider } from './providers/GeminiProvider.js';
import { env } from '../config/env.js';
import { JwtPayload } from '../middlewares/auth.js';
import { ApiError } from '../middlewares/errorHandler.js';

export class AnalyticsBriefingService {
  private provider = new GeminiProvider();

  async generateBriefing(currentUser: JwtPayload, projectId: string): Promise<AIAnalyticsBriefing> {
    const canAccess = await projectAccessService.canAccessProject(currentUser, projectId);
    if (!canAccess) throw ApiError.forbidden('You do not have access to this project');

    const overview = await analyticsAggregationService.getAnalyticsOverview(currentUser, projectId);
    if (!overview) throw ApiError.notFound('Analytics overview not found');

    if (!env.AI_ENABLED || !env.GEMINI_API_KEY) {
      return this.getFallbackBriefing(overview);
    }

    const promptContext = `CALCULATED VERIFIED BACKEND ANALYTICS FACTS:
Project Name: ${overview.projectName} (${overview.projectKey})
Delivery Risk Level: ${overview.deliveryRisk.level} (${overview.deliveryRisk.score}/100)
Delivery Risk Reasons: ${overview.deliveryRisk.reasons.join('; ')}

Backlog Forecast:
- Current Backlog: ${overview.backlogForecast.currentBacklog}
- Forecast 14 Days: ${overview.backlogForecast.forecast14Days}
- Forecast 30 Days: ${overview.backlogForecast.forecast30Days}
- Trend Direction: ${overview.backlogForecast.direction}
- Confidence: ${overview.backlogForecast.confidence}

SLA Compliance Forecast:
- Current Compliance: ${overview.slaForecast.currentCompliancePercentage}%
- Forecast 14 Days: ${overview.slaForecast.forecast14Days}%
- At-Risk Issues: ${overview.slaForecast.expectedAtRiskIssues}
- Breached Issues: ${overview.slaForecast.expectedBreachedIssues}

Developer Workload Overload Risks:
${overview.developerCapacityForecasts.map((d) => `- ${d.developerName}: Current ${d.currentCapacity}, Projected 14d ${d.projectedCapacity}`).join('\n')}

High Risk Components:
${overview.componentForecasts.map((c) => `- ${c.component}: Risk ${c.currentRisk} -> Projected ${c.projectedRisk}, Growth: +${c.growthPercentage}%`).join('\n')}

Incident Trend:
- Active Incidents: ${overview.incidentForecast.currentIncidentCount}
- 14-day Projected Incidents: ${overview.incidentForecast.projectedIncidents14Days}
- Recurrence Risk: ${overview.incidentForecast.recurrenceRisk}`.trim();

    const systemPrompt = `You are an expert Principal Engineering Operations Advisor.
Analyze the provided calculated predictive engineering analytics facts and return an executive briefing JSON.

SECURITY & SAFETY CONSTRAINTS:
- Base all findings ONLY on the provided calculated backend facts. Do NOT invent statistics or external facts.
- You must not query databases, request tools, or imply any live data access.
- Output MUST be valid JSON adhering strictly to this schema:
{
  "summary": string,
  "keyRisks": [string],
  "forecastHighlights": [string],
  "recommendedFocusAreas": [string]
}`;

    try {
      if (!this.provider.generateStructuredJson) {
        return this.getFallbackBriefing(overview);
      }

      const validated = await this.provider.generateStructuredJson(
        promptContext,
        systemPrompt,
        analyticsBriefingSchema
      );
      return {
        ...validated,
        generatedAt: new Date().toISOString(),
      };
    } catch {
      return this.getFallbackBriefing(overview);
    }
  }

  private getFallbackBriefing(overview: any): AIAnalyticsBriefing {
    return {
      summary: `Predictive engineering forecast for ${overview.projectName}: Delivery Risk rated ${overview.deliveryRisk.level} (${overview.deliveryRisk.score}/100).`,
      keyRisks: overview.deliveryRisk.reasons,
      forecastHighlights: [
        `14-day projected backlog: ${overview.backlogForecast.forecast14Days} issues (${overview.backlogForecast.direction}).`,
        `14-day projected SLA compliance: ${overview.slaForecast.forecast14Days}%.`,
      ],
      recommendedFocusAreas: [
        'Review developer workload distribution for at-risk team members.',
        'Address component growth spikes before release milestone.',
      ],
      generatedAt: new Date().toISOString(),
    };
  }
}

export const analyticsBriefingService = new AnalyticsBriefingService();
