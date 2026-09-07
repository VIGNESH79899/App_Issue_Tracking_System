import { describe, it, expect } from 'vitest';
import { projectHealthService } from '../services/projectHealthService.js';
import { UserRole } from '@app-issue-track/shared';

describe('AITS Phase 5 — Project Health Engine Tests', () => {
  it('1. should reject unauthorized user project health calculation with 403 Forbidden', async () => {
    const unassignedUser = {
      userId: 'unassigned-user-id',
      email: 'unassigned@test.com',
      role: UserRole.REPORTER,
    };

    await expect(
      projectHealthService.calculateProjectHealth(unassignedUser as any, 'non-accessible-project-id')
    ).rejects.toThrow();
  });
});
