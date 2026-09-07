import { z } from 'zod';

export const triageRecommendationSchema = z.object({
  value: z.string().min(1),
  confidence: z.number().min(0).max(100),
  reason: z.string().max(500),
});

export const missingInfoItemSchema = z.object({
  field: z.string().min(1),
  importance: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  howToObtain: z.string().max(500),
  whyItMatters: z.string().max(500),
});

export const duplicateCandidateSchema = z.object({
  issueId: z.string().min(1),
  issueKey: z.string().min(1),
  title: z.string().min(1),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REOPENED', 'DUPLICATE']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'BLOCKER']),
  similarityScore: z.number().min(0).max(100),
  reasons: z.array(z.string()).default([]),
});

export const issueTriageSchema = z.object({
  suggestedPriority: triageRecommendationSchema,
  suggestedSeverity: triageRecommendationSchema,
  suggestedComponent: triageRecommendationSchema,
  missingInformation: z.array(missingInfoItemSchema).default([]),
  duplicateCandidates: z.array(duplicateCandidateSchema).max(5).default([]),
  reasoning: z.string().max(1000).default(''),
});

export type IssueTriageSchemaType = z.infer<typeof issueTriageSchema>;
