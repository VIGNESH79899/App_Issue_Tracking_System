import { describe, it, expect } from 'vitest';
import { slaForecastService } from '../../services/analytics/slaForecastService.js';
import { UserRole } from '@app-issue-track/shared';

describe('AITS Phase 8 — SLA Forecast Engine Tests', () => {
  it('1. should reject unauthorized project access with 403 Forbidden', async () => {
    const unassignedUser = {
      userId: 'unassigned-user-id',
      email: 'unassigned@test.com',
      role: UserRole.REPORTER,
    };

    await expect(
      slaForecastService.forecastSla(unassignedUser as any, 'non-accessible-project-id')
    ).rejects.toThrow();
  });
});
