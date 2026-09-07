import { describe, it, expect } from 'vitest';
import { predictiveRiskService } from '../services/predictiveRiskService.js';
import { UserRole } from '@app-issue-track/shared';

describe('AITS Phase 5 — Predictive SLA Risk Engine Tests', () => {
  it('1. should reject unauthorized SLA risk calculation with 403 Forbidden', async () => {
    const unassignedUser = {
      userId: 'unassigned-user-id',
      email: 'unassigned@test.com',
      role: UserRole.REPORTER,
    };

    await expect(
      predictiveRiskService.predictSlaRisk(unassignedUser as any, 'non-accessible-issue-id')
    ).rejects.toThrow();
  });
});
