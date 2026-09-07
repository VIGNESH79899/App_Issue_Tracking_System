import { describe, it, expect } from 'vitest';
import { trendService } from '../services/trendService.js';
import { UserRole } from '@app-issue-track/shared';

describe('AITS Phase 5 — Engineering Trend Service Tests', () => {
  it('1. should reject unauthorized trend query with 403 Forbidden', async () => {
    const unassignedUser = {
      userId: 'unassigned-user-id',
      email: 'unassigned@test.com',
      role: UserRole.REPORTER,
    };

    await expect(
      trendService.getEngineeringTrends(unassignedUser as any, 'non-accessible-project-id', '7d')
    ).rejects.toThrow();
  });
});
