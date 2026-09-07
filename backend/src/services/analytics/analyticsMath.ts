import { ForecastConfidence, ForecastDirection, IssueStatus } from '@app-issue-track/shared';

export const DAY_MS = 24 * 60 * 60 * 1000;

export const ACTIVE_ISSUE_STATUSES: IssueStatus[] = [
  IssueStatus.OPEN,
  IssueStatus.ASSIGNED,
  IssueStatus.IN_PROGRESS,
  IssueStatus.VERIFIED,
  IssueStatus.REOPENED,
];

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function roundToOneDecimal(value: number): number {
  return Math.round(value * 10) / 10;
}

export function startOfUtcDay(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * DAY_MS);
}

export function toDateKey(date: Date): string {
  return startOfUtcDay(date).toISOString().split('T')[0];
}

export function createDailySeries(days: number, now: Date): { key: string; date: Date }[] {
  const start = addDays(startOfUtcDay(now), -(days - 1));
  return Array.from({ length: days }, (_, index) => {
    const date = addDays(start, index);
    return { key: toDateKey(date), date };
  });
}

export function countSeriesByDate(
  timestamps: Array<Date | string | null | undefined>,
  days: number,
  now: Date
): number[] {
  const series = createDailySeries(days, now);
  const indexByKey = new Map(series.map((item, index) => [item.key, index]));
  const counts = Array.from({ length: days }, () => 0);

  for (const timestamp of timestamps) {
    if (!timestamp) continue;
    const key = toDateKey(new Date(timestamp));
    const index = indexByKey.get(key);
    if (index !== undefined) {
      counts[index] += 1;
    }
  }

  return counts;
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

export function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return sum(values) / values.length;
}

export function activityDays(...series: number[][]): number {
  const length = Math.max(...series.map((item) => item.length), 0);
  let activeDays = 0;

  for (let index = 0; index < length; index += 1) {
    if (series.some((item) => (item[index] || 0) > 0)) {
      activeDays += 1;
    }
  }

  return activeDays;
}

export function deriveConfidence(
  sampleSize: number,
  activePeriods: number,
  minimumSampleSize = 5,
  lowThreshold = 10,
  mediumThreshold = 20
): ForecastConfidence {
  if (sampleSize < minimumSampleSize || activePeriods < 5) {
    return ForecastConfidence.INSUFFICIENT_DATA;
  }

  if (sampleSize < lowThreshold || activePeriods < 8) {
    return ForecastConfidence.LOW;
  }

  if (sampleSize < mediumThreshold || activePeriods < 12) {
    return ForecastConfidence.MEDIUM;
  }

  return ForecastConfidence.HIGH;
}

export function deriveDirection(delta: number, tolerance = 0.15): ForecastDirection {
  if (delta > tolerance) {
    return ForecastDirection.DETERIORATING;
  }

  if (delta < -tolerance) {
    return ForecastDirection.IMPROVING;
  }

  return ForecastDirection.STABLE;
}

export function forecastCount(currentValue: number, netPerDay: number, days: number): number {
  return Math.max(0, Math.round(currentValue + netPerDay * days));
}

export function mapRiskLevelFromScore(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 75) {
    return 'CRITICAL';
  }

  if (score >= 55) {
    return 'HIGH';
  }

  if (score >= 30) {
    return 'MEDIUM';
  }

  return 'LOW';
}
