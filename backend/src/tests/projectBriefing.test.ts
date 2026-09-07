import { describe, it, expect } from 'vitest';
import { projectBriefingService } from '../ai/projectBriefingService.js';
import { UserRole } from '@app-issue-track/shared';

describe('AITS Phase 5 — AI Project Briefing Service Tests', () => {
  it('1. should reject unauthorized project briefing query with 403 Forbidden', async () => {
    const unassignedUser = {
      userId: 'unassigned-user-id',
      email: 'unassigned@test.com',
      role: UserRole.REPORTER,
    };

    await expect(
      projectBriefingService.generateBriefing(unassignedUser as any, 'non-accessible-project-id')
    ).rejects.toThrow();
  });
});
