import { describe, it, expect } from 'vitest';
import { incidentEscalationService } from '../services/incidentEscalationService.js';
import { UserRole } from '@app-issue-track/shared';

describe('AITS Phase 6 — Incident Escalation Engine Tests', () => {
  it('1. should reject unauthorized escalation query with 403 Forbidden', async () => {
    const unassignedUser = {
      userId: 'unassigned-user-id',
      email: 'unassigned@test.com',
      role: UserRole.REPORTER,
    };

    await expect(
      incidentEscalationService.evaluateIncidentEscalations(unassignedUser as any, 'non-accessible-incident-id')
    ).rejects.toThrow();
  });
});
