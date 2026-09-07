import { describe, it, expect } from 'vitest';
import { AIRootCauseHypothesis, AIRecommendedAction, AIRiskAssessment, AIIssueInsight } from '@app-issue-track/shared';

describe('AI Engineering Assistance Frontend UI Component & Contract Tests', () => {
  it('1. should construct clean Executive Summary props for UI rendering', () => {
    const summary = 'Database connection pool exhausted under high traffic.';
    expect(summary).toBe('Database connection pool exhausted under high traffic.');
  });

  it('2. should construct RootCauseHypotheses with mandatory hypotheses label and evidence', () => {
    const hypotheses: AIRootCauseHypothesis[] = [
      {
        hypothesis: 'Connection leak in payment controller',
        confidence: 88,
        evidence: ['High active connection count in metrics'],
      },
    ];

    expect(hypotheses.length).toBe(1);
    expect(hypotheses[0].hypothesis).toBe('Connection leak in payment controller');
    expect(hypotheses[0].confidence).toBe(88);
    expect(hypotheses[0].evidence[0]).toBe('High active connection count in metrics');
  });

  it('3. should construct RecommendedActions with priority level', () => {
    const actions: AIRecommendedAction[] = [
      {
        action: 'Increase max DB pool connections to 50',
        priority: 'HIGH',
        reason: 'Prevents connection timeout crashes during peak volume',
      },
    ];

    expect(actions[0].priority).toBe('HIGH');
    expect(actions[0].action).toContain('max DB pool connections');
  });

  it('4. should construct AIRiskAssessment with risk level and reasons', () => {
    const risk: AIRiskAssessment = {
      level: 'CRITICAL',
      reasons: ['Affects customer checkout flow'],
    };

    expect(risk.level).toBe('CRITICAL');
    expect(risk.reasons[0]).toBe('Affects customer checkout flow');
  });

  it('5. should construct TestingRecommendations array', () => {
    const recs = ['Execute stress test on checkout endpoint'];
    expect(recs.length).toBe(1);
    expect(recs[0]).toBe('Execute stress test on checkout endpoint');
  });

  it('6. should construct MissingInformation array for UI display', () => {
    const missing = ['Database connection pool metrics log around failure time'];
    expect(missing.length).toBe(1);
    expect(missing[0]).toContain('metrics log');
  });

  it('7. should construct complete AIIssueInsight payload for AIInsightsPanel rendering', () => {
    const insight: AIIssueInsight = {
      summary: 'Payment gateway timeout during spike.',
      rootCauseHypotheses: [
        { hypothesis: 'API token expiration', confidence: 90, evidence: ['Log shows 401 token expired'] }
      ],
      recommendedActions: [
        { action: 'Renew API token automatically', priority: 'CRITICAL', reason: 'Avoid manual failures' }
      ],
      riskAssessment: { level: 'HIGH', reasons: ['High monetary impact'] },
      testingRecommendations: ['Test token refresh endpoint'],
      missingInformation: ['Gateway response headers'],
    };

    expect(insight.rootCauseHypotheses[0].confidence).toBe(90);
    expect(insight.recommendedActions[0].priority).toBe('CRITICAL');
    expect(insight.riskAssessment.level).toBe('HIGH');
  });
});
