import { describe, it, expect } from 'vitest';
import { ProjectHealthScore, DeveloperCapacitySummary, ComponentRiskSummary, EngineeringBottleneck } from '@app-issue-track/shared';

describe('AITS Phase 5 — Command Center UI Contract Tests', () => {
  it('1. should construct ProjectHealthScore object with explainability reasons', () => {
    const health: ProjectHealthScore = {
      score: 78,
      level: 'AT_RISK',
      breakdown: {
        slaPerformance: 79,
        resolutionVelocity: 80,
        criticalBacklog: 70,
        developerCapacity: 82,
        issueQuality: 85,
        issueAging: 75,
      },
      reasons: ['SLA compliance dropped to 79%', '3 critical issues remain unresolved'],
    };

    expect(health.score).toBe(78);
    expect(health.level).toBe('AT_RISK');
    expect(health.reasons.length).toBe(2);
  });

  it('2. should construct DeveloperCapacitySummary structure accurately', () => {
    const dev: DeveloperCapacitySummary = {
      developerId: 'dev-1',
      developerName: 'Jane Developer',
      activeIssues: 5,
      inProgressIssues: 2,
      criticalHighIssues: 2,
      overdueIssues: 1,
      averageResolutionHours: 14.2,
      resolvedIssues: 8,
      slaBreaches: 1,
      capacityScore: 75,
      capacityLevel: 'BUSY',
      reasons: ['High workload density: 5 active issues'],
    };

    expect(dev.capacityLevel).toBe('BUSY');
    expect(dev.activeIssues).toBe(5);
  });

  it('3. should construct ComponentRiskSummary structure accurately', () => {
    const comp: ComponentRiskSummary = {
      component: 'PaymentGateway',
      totalIssues: 10,
      activeIssues: 4,
      criticalIssues: 2,
      highIssues: 1,
      slaBreaches: 2,
      recurringIssues: 1,
      averageResolutionHours: 18.5,
      averageQualityScore: 82,
      recentGrowthPercentage: 45,
      riskScore: 75,
      riskLevel: 'CRITICAL',
      reasons: ['2 unresolved critical/blocker issue(s)', '2 SLA breach(es) recorded'],
    };

    expect(comp.riskLevel).toBe('CRITICAL');
    expect(comp.riskScore).toBe(75);
  });
});
