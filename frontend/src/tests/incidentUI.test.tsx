import { describe, it, expect } from 'vitest';
import { IncidentDTO, IncidentStatus, IncidentSeverity } from '@app-issue-track/shared';

describe('AITS Phase 6 — Incident UI Contract Tests', () => {
  it('1. should construct IncidentDTO structure accurately', () => {
    const inc: IncidentDTO = {
      id: 'inc-1',
      incidentKey: 'INC-PORT-001',
      title: 'Payment Gateway Outage',
      description: 'API returning 500 error on checkout',
      projectId: 'proj-1',
      applicationId: 'app-1',
      severity: IncidentSeverity.SEV1,
      status: IncidentStatus.DETECTED,
      detectedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    expect(inc.incidentKey).toBe('INC-PORT-001');
    expect(inc.severity).toBe('SEV1');
    expect(inc.status).toBe('DETECTED');
  });

  it('2. should verify allowed status transitions logic', () => {
    const isAllowedTransition = (current: IncidentStatus, next: IncidentStatus) => {
      if (current === IncidentStatus.DETECTED) return next === IncidentStatus.ACKNOWLEDGED;
      if (current === IncidentStatus.ACKNOWLEDGED) return next === IncidentStatus.INVESTIGATING;
      if (current === IncidentStatus.INVESTIGATING) return next === IncidentStatus.MITIGATING;
      if (current === IncidentStatus.MITIGATING) return next === IncidentStatus.RESOLVED;
      if (current === IncidentStatus.RESOLVED) return next === IncidentStatus.CLOSED;
      return false;
    };

    expect(isAllowedTransition(IncidentStatus.DETECTED, IncidentStatus.ACKNOWLEDGED)).toBe(true);
    expect(isAllowedTransition(IncidentStatus.DETECTED, IncidentStatus.RESOLVED)).toBe(false);
  });
});
