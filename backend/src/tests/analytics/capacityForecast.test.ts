import { describe, it, expect } from 'vitest';
import { capacityForecastService } from '../../services/analytics/capacityForecastService.js';
import { UserRole } from '@app-issue-track/shared';

describe('AITS Phase 8 — Developer Capacity Forecast Engine Tests', () => {
  it('1. should reject unauthorized project access with 403 Forbidden', async () => {
    const unassignedUser = {
      userId: 'unassigned-user-id',
      email: 'unassigned@test.com',
      role: UserRole.REPORTER,
    };

    await expect(
      capacityForecastService.forecastDeveloperCapacity(unassignedUser as any, 'non-accessible-project-id')
    ).rejects.toThrow();
  });
});
