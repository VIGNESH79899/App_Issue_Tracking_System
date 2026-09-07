import { z } from 'zod';

export const postIncidentAnalysisSchema = z.object({
  executiveSummary: z.string(),
  rootCause: z.string(),
  contributingFactors: z.array(z.string()),
  impactAssessment: z.string(),
  whatWentWell: z.array(z.string()),
  whatWentWrong: z.array(z.string()),
  preventiveActions: z.array(z.string()),
  testingRecommendations: z.array(z.string()),
  monitoringRecommendations: z.array(z.string()),
  missingInformation: z.array(z.string()),
});

export type PostIncidentAnalysisSchema = z.infer<typeof postIncidentAnalysisSchema>;
