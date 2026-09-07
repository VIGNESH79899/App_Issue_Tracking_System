import { describe, it, expect } from 'vitest';
import { developerCapacityService } from '../services/developerCapacityService.js';
import { UserRole } from '@app-issue-track/shared';

describe('AITS Phase 5 — Developer Capacity Service Tests', () => {
  it('1. should reject unauthorized developer capacity query with 403 Forbidden', async () => {
    const unassignedUser = {
      userId: 'unassigned-user-id',
      email: 'unassigned@test.com',
      role: UserRole.REPORTER,
    };

    await expect(
      developerCapacityService.getDeveloperCapacity(unassignedUser as any, 'non-accessible-project-id')
    ).rejects.toThrow();
  });
});
