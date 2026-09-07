import { z } from 'zod';

export const rootCauseHypothesisSchema = z.object({
  hypothesis: z.string().min(1, 'Hypothesis cannot be empty').max(500),
  confidence: z.number().min(0).max(100),
  evidence: z.array(z.string().max(300)).default([]),
});

export const recommendedActionSchema = z.object({
  action: z.string().min(1).max(500),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  reason: z.string().max(500),
});

export const riskAssessmentSchema = z.object({
  level: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  reasons: z.array(z.string().max(300)).default([]),
});

export const issueInsightSchema = z.object({
  summary: z.string().min(1, 'Summary cannot be empty').max(2000),
  rootCauseHypotheses: z.array(rootCauseHypothesisSchema).max(10).default([]),
  recommendedActions: z.array(recommendedActionSchema).max(10).default([]),
  riskAssessment: riskAssessmentSchema,
  testingRecommendations: z.array(z.string().max(500)).max(10).default([]),
  missingInformation: z.array(z.string().max(500)).max(10).default([]),
});

export type IssueInsightSchemaType = z.infer<typeof issueInsightSchema>;
