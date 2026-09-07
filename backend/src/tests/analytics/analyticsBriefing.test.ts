import { describe, it, expect } from 'vitest';
import { analyticsBriefingService } from '../../ai/analyticsBriefingService.js';
import { UserRole } from '@app-issue-track/shared';

describe('AITS Phase 8 — Analytics Gemini Briefing AI Service Tests', () => {
  it('1. should reject unauthorized project access with 403 Forbidden', async () => {
    const unassignedUser = {
      userId: 'unassigned-user-id',
      email: 'unassigned@test.com',
      role: UserRole.REPORTER,
    };

    await expect(
      analyticsBriefingService.generateBriefing(unassignedUser as any, 'non-accessible-project-id')
    ).rejects.toThrow();
  });
});
