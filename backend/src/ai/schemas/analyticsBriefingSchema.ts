import { z } from 'zod';

export const analyticsBriefingSchema = z.object({
  summary: z.string(),
  keyRisks: z.array(z.string()),
  forecastHighlights: z.array(z.string()),
  recommendedFocusAreas: z.array(z.string()),
});

export type AnalyticsBriefingSchema = z.infer<typeof analyticsBriefingSchema>;
