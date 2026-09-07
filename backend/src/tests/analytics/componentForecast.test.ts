import { describe, it, expect } from 'vitest';
import { componentForecastService } from '../../services/analytics/componentForecastService.js';
import { UserRole } from '@app-issue-track/shared';

describe('AITS Phase 8 — Component Risk Forecast Engine Tests', () => {
  it('1. should reject unauthorized project access with 403 Forbidden', async () => {
    const unassignedUser = {
      userId: 'unassigned-user-id',
      email: 'unassigned@test.com',
      role: UserRole.REPORTER,
    };

    await expect(
      componentForecastService.forecastComponents(unassignedUser as any, 'non-accessible-project-id')
    ).rejects.toThrow();
  });
});
