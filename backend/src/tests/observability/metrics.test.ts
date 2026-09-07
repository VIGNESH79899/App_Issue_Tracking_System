import { describe, it, expect, beforeEach } from 'vitest';
import { metricsService } from '../../observability/metricsService.js';

describe('AITS Phase 9 — In-Memory Metrics Service', () => {
  it('1. getSummary returns expected shape', () => {
    const summary = metricsService.getSummary();
    expect(summary).toHaveProperty('totalRequests');
    expect(summary).toHaveProperty('successfulRequests');
    expect(summary).toHaveProperty('clientErrors');
    expect(summary).toHaveProperty('serverErrors');
    expect(summary).toHaveProperty('averageResponseMs');
    expect(summary).toHaveProperty('slowRequests');
    expect(summary).toHaveProperty('endpointStats');
    expect(Array.isArray(summary.endpointStats)).toBe(true);
  });

  it('2. recordRequest increments totalRequests', () => {
    const before = metricsService.getSummary().totalRequests;
    metricsService.recordRequest({ method: 'GET', originalUrl: '/api/v1/test', statusCode: 200, durationMs: 50 });
    const after = metricsService.getSummary().totalRequests;
    expect(after).toBe(before + 1);
  });

  it('3. recordRequest with 4xx increments clientErrors', () => {
    const before = metricsService.getSummary().clientErrors;
    metricsService.recordRequest({ method: 'GET', originalUrl: '/api/v1/nope', statusCode: 404, durationMs: 10 });
    const after = metricsService.getSummary().clientErrors;
    expect(after).toBe(before + 1);
  });

  it('4. recordRequest with 5xx increments serverErrors', () => {
    const before = metricsService.getSummary().serverErrors;
    metricsService.recordRequest({ method: 'GET', originalUrl: '/api/v1/crash', statusCode: 500, durationMs: 100 });
    const after = metricsService.getSummary().serverErrors;
    expect(after).toBe(before + 1);
  });

  it('5. incrementAiRequest and incrementAiFailure are tracked', () => {
    const before = metricsService.getSummary();
    metricsService.incrementAiRequest();
    metricsService.incrementAiFailure();
    const after = metricsService.getSummary();
    expect(after.aiRequests).toBe(before.aiRequests + 1);
    expect(after.aiFailures).toBe(before.aiFailures + 1);
  });

  it('6. averageResponseMs is a non-negative number', () => {
    const summary = metricsService.getSummary();
    expect(summary.averageResponseMs).toBeGreaterThanOrEqual(0);
  });

  it('7. endpointStats contains route-level breakdown', () => {
    metricsService.recordRequest({ method: 'GET', originalUrl: '/api/v1/metrics-test', statusCode: 200, durationMs: 70 });
    const stats = metricsService.getSummary().endpointStats;
    expect(stats.length).toBeGreaterThan(0);
    expect(stats[0]).toHaveProperty('route');
    expect(stats[0]).toHaveProperty('requests');
    expect(stats[0]).toHaveProperty('averageMs');
    expect(stats[0]).toHaveProperty('p95Ms');
  });
});
