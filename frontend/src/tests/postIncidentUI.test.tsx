import { describe, it, expect } from 'vitest';
import { PostIncidentAnalysisDTO } from '@app-issue-track/shared';

describe('AITS Phase 6 — Post-Incident UI Contract Tests', () => {
  it('1. should construct PostIncidentAnalysisDTO structure accurately', () => {
    const analysis: PostIncidentAnalysisDTO = {
      executiveSummary: 'Post-mortem review of SEV1 payment gateway outage.',
      rootCause: 'Database connection pool exhaustion caused by unindexed query lock.',
      contributingFactors: ['Connection pool limit set too low', 'Traffic spike at 10:00 AM'],
      impactAssessment: '15% of checkout requests failed between 10:00 AM and 10:25 AM.',
      whatWentWell: ['Detected via synthetic health check within 2 minutes.'],
      whatWentWrong: ['Acknowledgement took 18 minutes due to alert routing delay.'],
      preventiveActions: ['Increase pool size', 'Add index on transaction status'],
      testingRecommendations: ['Perform load testing with unindexed queries'],
      monitoringRecommendations: ['Set up connection pool utilization alert at 80%'],
      missingInformation: ['Detailed APM traces for 10:05-10:10 AM'],
      generatedAt: new Date().toISOString(),
    };

    expect(analysis.contributingFactors.length).toBe(2);
    expect(analysis.preventiveActions.length).toBe(2);
  });
});
