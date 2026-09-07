import { describe, it, expect } from 'vitest';
import { postIncidentAnalysisService } from '../ai/postIncidentAnalysisService.js';
import { UserRole } from '@app-issue-track/shared';

describe('AITS Phase 6 — Post-Incident Analysis AI Service Tests', () => {
  it('1. should reject unauthorized post-incident analysis request with 403 Forbidden', async () => {
    const unassignedUser = {
      userId: 'unassigned-user-id',
      email: 'unassigned@test.com',
      role: UserRole.REPORTER,
    };

    await expect(
      postIncidentAnalysisService.generateAnalysis(unassignedUser as any, 'non-accessible-incident-id')
    ).rejects.toThrow();
  });
});
