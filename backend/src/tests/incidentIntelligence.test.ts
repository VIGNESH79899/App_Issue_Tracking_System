import { describe, it, expect } from 'vitest';
import { incidentIntelligenceService } from '../services/incidentIntelligenceService.js';
import { UserRole } from '@app-issue-track/shared';

describe('AITS Phase 6 — Incident Intelligence Service Tests', () => {
  it('1. should return empty zero metrics for unassigned user', async () => {
    const unassignedUser = {
      userId: 'unassigned-user-id',
      email: 'unassigned@test.com',
      role: UserRole.REPORTER,
    };

    const metrics = await incidentIntelligenceService.getProjectIncidentMetrics(unassignedUser as any);
    expect(metrics.activeCount).toBe(0);
    expect(metrics.sev1Count).toBe(0);
    expect(metrics.mttaHours).toBeNull();
    expect(metrics.mttrHours).toBeNull();
  });
});
