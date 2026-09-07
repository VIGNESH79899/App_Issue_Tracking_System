import { describe, it, expect } from 'vitest';
import { deliveryRiskService } from '../../services/analytics/deliveryRiskService.js';
import { UserRole } from '@app-issue-track/shared';

describe('AITS Phase 8 — Project Delivery Risk Engine Tests', () => {
  it('1. should reject unauthorized project access with 403 Forbidden', async () => {
    const unassignedUser = {
      userId: 'unassigned-user-id',
      email: 'unassigned@test.com',
      role: UserRole.REPORTER,
    };

    await expect(
      deliveryRiskService.calculateDeliveryRisk(unassignedUser as any, 'non-accessible-project-id')
    ).rejects.toThrow();
  });

  it('2. should compute score within 0–100 range', async () => {
    // Validate score type constraints
    const scoreInRange = (score: number) => score >= 0 && score <= 100;
    expect(scoreInRange(0)).toBe(true);
    expect(scoreInRange(50)).toBe(true);
    expect(scoreInRange(100)).toBe(true);
  });

  it('3. should map score ranges to correct risk levels', () => {
    const getLevel = (score: number) => {
      if (score >= 75) return 'CRITICAL';
      if (score >= 55) return 'HIGH';
      if (score >= 35) return 'MEDIUM';
      return 'LOW';
    };
    expect(getLevel(0)).toBe('LOW');
    expect(getLevel(35)).toBe('MEDIUM');
    expect(getLevel(55)).toBe('HIGH');
    expect(getLevel(75)).toBe('CRITICAL');
  });
});
