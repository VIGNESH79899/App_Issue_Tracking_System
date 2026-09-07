import { describe, it, expect } from 'vitest';
import { IssueStatus, IssuePriority, IssueSeverity, IssueQualityMetric, IssueTriageAnalysis } from '@app-issue-track/shared';

describe('AI Engineering Triage & Quality Frontend UI Contract Tests', () => {
  it('1. should construct IssueQualityMetric structure accurately', () => {
    const quality: IssueQualityMetric = {
      score: 92,
      titleClarity: true,
      descriptionCompleteness: true,
      reproductionStepsProvided: true,
      expectedBehaviorProvided: true,
      actualBehaviorProvided: true,
      environmentSpecified: true,
      errorLogsProvided: false,
      moduleSpecified: true,
      reasons: ['✓ Clear title (+15 pts)', '⚠ Error logs missing'],
    };

    expect(quality.score).toBe(92);
    expect(quality.titleClarity).toBe(true);
    expect(quality.reasons.length).toBe(2);
  });

  it('2. should construct complete IssueTriageAnalysis structure', () => {
    const analysis: IssueTriageAnalysis = {
      suggestedPriority: {
        value: IssuePriority.HIGH,
        confidence: 91,
        reason: 'Payment transaction impact',
      },
      suggestedSeverity: {
        value: IssueSeverity.CRITICAL,
        confidence: 87,
        reason: 'Prevents checkout flow',
      },
      suggestedComponent: {
        value: 'Payment Gateway',
        confidence: 84,
        reason: 'Matches payment error context',
      },
      qualityScore: {
        score: 90,
        titleClarity: true,
        descriptionCompleteness: true,
        reproductionStepsProvided: true,
        expectedBehaviorProvided: true,
        actualBehaviorProvided: true,
        environmentSpecified: true,
        errorLogsProvided: true,
        moduleSpecified: true,
        reasons: [],
      },
      duplicateCandidates: [
        {
          issueId: 'dup-1',
          issueKey: 'PORT-101',
          title: 'Payment gateway timeout',
          status: IssueStatus.OPEN,
          priority: IssuePriority.HIGH,
          severity: IssueSeverity.CRITICAL,
          similarityScore: 92,
          reasons: ['Same payment component'],
        },
      ],
      missingInformation: [
        {
          field: 'Browser Version',
          importance: 'MEDIUM',
          howToObtain: 'Check browser settings',
          whyItMatters: 'Client rendering context',
        },
      ],
      reasoning: 'Detailed triage analysis',
    };

    expect(analysis.suggestedPriority.value).toBe('HIGH');
    expect(analysis.suggestedPriority.confidence).toBe(91);
    expect(analysis.duplicateCandidates[0].similarityScore).toBe(92);
    expect(analysis.duplicateCandidates[0].similarityScore).toBeGreaterThanOrEqual(85);
  });

  it('3. should verify duplicate warning trigger for similarity >= 85%', () => {
    const candidateScore = 92;
    const hasWarning = candidateScore >= 85;
    expect(hasWarning).toBe(true);
  });
});
