import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';
import { env } from '../config/env.js';
import { projectAccessService } from '../services/projectAccessService.js';
import { projectHealthService } from '../services/projectHealthService.js';
import { developerCapacityService } from '../services/developerCapacityService.js';
import { componentRiskService } from '../services/componentRiskService.js';
import { bottleneckService } from '../services/bottleneckService.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { JwtPayload } from '../middlewares/auth.js';
import { AIProjectBriefing } from '@app-issue-track/shared';

const aiBriefingSchema = z.object({
  executiveSummary: z.string().min(1).max(1000),
  keyRisks: z.array(z.string()).default([]),
  positiveSignals: z.array(z.string()).default([]),
  recommendedActions: z.array(z.string()).default([]),
  areasToMonitor: z.array(z.string()).default([]),
});

export class ProjectBriefingService {
  async generateBriefing(currentUser: JwtPayload, projectId: string): Promise<AIProjectBriefing> {
    const canAccess = await projectAccessService.canAccessProject(currentUser, projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to generate AI briefing for this project');
    }

    // 1. Fetch calculated backend facts
    const health = await projectHealthService.calculateProjectHealth(currentUser, projectId);
    const capacity = await developerCapacityService.getDeveloperCapacity(currentUser, projectId);
    const components = await componentRiskService.getComponentRiskSummaries(currentUser, projectId);
    const bottlenecks = await bottleneckService.detectBottlenecks(currentUser, projectId);

    const fallbackBriefing: AIProjectBriefing = {
      executiveSummary: `Project Health is evaluated at ${health.score}/100 (${health.level}). Current SLA performance is ${health.breakdown.slaPerformance}%.`,
      keyRisks: health.reasons.filter((r) => !r.startsWith('✓') && !r.startsWith('Strong')),
      positiveSignals: health.reasons.filter((r) => r.startsWith('✓') || r.startsWith('Strong')),
      recommendedActions: bottlenecks.map((b) => b.recommendedAction),
      areasToMonitor: components.filter((c) => c.riskLevel === 'HIGH' || c.riskLevel === 'CRITICAL').map((c) => `Component ${c.component} (${c.activeIssues} active issues)`),
      generatedAt: new Date().toISOString(),
    };

    if (!env.AI_ENABLED || !env.GEMINI_API_KEY) {
      return fallbackBriefing;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      const modelName = env.AI_MODEL || 'gemini-3.6-flash';

      const promptContext = `
CALCULATED VERIFIED BACKEND PROJECT FACTS:
Project Health Score: ${health.score}/100 (${health.level})
Health Breakdown:
- SLA Performance: ${health.breakdown.slaPerformance}%
- Resolution Velocity: ${health.breakdown.resolutionVelocity}%
- Critical Backlog Score: ${health.breakdown.criticalBacklog}%
- Developer Capacity Score: ${health.breakdown.developerCapacity}%
- Report Quality Score: ${health.breakdown.issueQuality}%
- Issue Aging Score: ${health.breakdown.issueAging}%

Health Reasons:
${health.reasons.map((r) => `- ${r}`).join('\n')}

Developer Capacity:
${capacity.map((d) => `- ${d.developerName}: ${d.activeIssues} active, ${d.criticalHighIssues} critical/high, Status: ${d.capacityLevel}`).join('\n')}

High-Risk Components:
${components.map((c) => `- ${c.component}: Risk Level ${c.riskLevel} (${c.riskScore}/100), Active: ${c.activeIssues}, SLA Breaches: ${c.slaBreaches}`).join('\n')}

Detected Bottlenecks:
${bottlenecks.map((b) => `- [${b.severity}] ${b.title}: ${b.description}`).join('\n')}
`.trim();

      const systemPrompt = `You are an expert enterprise software engineering executive AI advisor for the Applications Issue Tracking System (AITS).
Analyze the provided verified backend project facts and return a concise, high-impact executive briefing.

SYSTEM CONSTRAINTS & INSTRUCTIONS:
1. Base all findings ONLY on the provided calculated project facts. Do NOT invent statistics or external facts.
2. Output MUST be valid JSON adhering strictly to the required schema:
{
  "executiveSummary": string,
  "keyRisks": [string],
  "positiveSignals": [string],
  "recommendedActions": [string],
  "areasToMonitor": [string]
}`;

      const apiCallPromise = ai.models.generateContent({
        model: modelName,
        contents: promptContext,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Google Gemini API briefing request timed out after 30s')), 30000);
      });

      const response = await Promise.race([apiCallPromise, timeoutPromise]);
      const content = response.text;

      if (content) {
        const parsedJson = JSON.parse(content);
        const validated = aiBriefingSchema.parse(parsedJson);
        return {
          ...validated,
          generatedAt: new Date().toISOString(),
        };
      }
    } catch (err: any) {
      console.error('AI Project Briefing Warning (falling back to deterministic summary):', err.message || err);
    }

    return fallbackBriefing;
  }
}

export const projectBriefingService = new ProjectBriefingService();
