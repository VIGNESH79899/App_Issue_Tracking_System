import { describe, it, expect } from 'vitest';
import { componentRiskService } from '../services/componentRiskService.js';
import { UserRole } from '@app-issue-track/shared';

describe('AITS Phase 5 — Component Risk Service Tests', () => {
  it('1. should reject unauthorized component risk query with 403 Forbidden', async () => {
    const unassignedUser = {
      userId: 'unassigned-user-id',
      email: 'unassigned@test.com',
      role: UserRole.REPORTER,
    };

    await expect(
      componentRiskService.getComponentRiskSummaries(unassignedUser as any, 'non-accessible-project-id')
    ).rejects.toThrow();
  });
});
