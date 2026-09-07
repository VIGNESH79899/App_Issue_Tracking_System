import { describe, it, expect } from 'vitest';
import { bottleneckService } from '../services/bottleneckService.js';
import { UserRole } from '@app-issue-track/shared';

describe('AITS Phase 5 — Bottleneck Detection Service Tests', () => {
  it('1. should reject unauthorized bottleneck query with 403 Forbidden', async () => {
    const unassignedUser = {
      userId: 'unassigned-user-id',
      email: 'unassigned@test.com',
      role: UserRole.REPORTER,
    };

    await expect(
      bottleneckService.detectBottlenecks(unassignedUser as any, 'non-accessible-project-id')
    ).rejects.toThrow();
  });
});
