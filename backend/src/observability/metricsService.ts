interface EndpointStats {
  requests: number;
  errors: number;
  totalMs: number;
  p95Samples: number[];
}

interface Metrics {
  totalRequests: number;
  successfulRequests: number;
  clientErrors: number;
  serverErrors: number;
  totalMs: number;
  slowRequests: number;
  rateLimitedRequests: number;
  authenticationFailures: number;
  authorizationFailures: number;
  aiRequests: number;
  aiFailures: number;
  databaseFailures: number;
  endpoints: Record<string, EndpointStats>;
  startedAt: string;
}

const SLOW_THRESHOLD_MS = parseInt(process.env.SLOW_REQUEST_THRESHOLD_MS || '1000', 10);
const MAX_P95_SAMPLES = 200;

const metrics: Metrics = {
  totalRequests: 0,
  successfulRequests: 0,
  clientErrors: 0,
  serverErrors: 0,
  totalMs: 0,
  slowRequests: 0,
  rateLimitedRequests: 0,
  authenticationFailures: 0,
  authorizationFailures: 0,
  aiRequests: 0,
  aiFailures: 0,
  databaseFailures: 0,
  endpoints: {},
  startedAt: new Date().toISOString(),
};

function normalizeRoute(originalUrl: string): string {
  // Strip query strings and normalize UUID-like IDs to :id
  const withoutQuery = originalUrl.split('?')[0];
  return withoutQuery.replace(/\/[0-9a-f-]{36}/gi, '/:id').replace(/\/\d+/g, '/:n');
}

export const metricsService = {
  recordRequest(opts: {
    method: string;
    originalUrl: string;
    statusCode: number;
    durationMs: number;
  }): void {
    const { method, originalUrl, statusCode, durationMs } = opts;
    const routeKey = `${method} ${normalizeRoute(originalUrl)}`;

    metrics.totalRequests++;
    metrics.totalMs += durationMs;

    if (statusCode < 400) metrics.successfulRequests++;
    else if (statusCode < 500) {
      metrics.clientErrors++;
      if (statusCode === 429) metrics.rateLimitedRequests++;
      if (statusCode === 401) metrics.authenticationFailures++;
      if (statusCode === 403) metrics.authorizationFailures++;
    } else {
      metrics.serverErrors++;
    }

    if (durationMs >= SLOW_THRESHOLD_MS) metrics.slowRequests++;

    // Per-endpoint stats
    if (!metrics.endpoints[routeKey]) {
      metrics.endpoints[routeKey] = { requests: 0, errors: 0, totalMs: 0, p95Samples: [] };
    }
    const ep = metrics.endpoints[routeKey];
    ep.requests++;
    ep.totalMs += durationMs;
    if (statusCode >= 400) ep.errors++;
    if (ep.p95Samples.length >= MAX_P95_SAMPLES) ep.p95Samples.shift();
    ep.p95Samples.push(durationMs);
  },

  incrementAiRequest() { metrics.aiRequests++; },
  incrementAiFailure() { metrics.aiFailures++; },
  incrementDatabaseFailure() { metrics.databaseFailures++; },

  getSummary() {
    const avgResponseMs = metrics.totalRequests > 0
      ? Math.round(metrics.totalMs / metrics.totalRequests)
      : 0;

    const endpointStats = Object.entries(metrics.endpoints).map(([route, ep]) => {
      const samples = [...ep.p95Samples].sort((a, b) => a - b);
      const p95 = samples.length > 0 ? samples[Math.floor(samples.length * 0.95)] ?? samples[samples.length - 1] : 0;
      return {
        route,
        requests: ep.requests,
        errors: ep.errors,
        averageMs: ep.requests > 0 ? Math.round(ep.totalMs / ep.requests) : 0,
        p95Ms: p95,
      };
    });

    return {
      totalRequests: metrics.totalRequests,
      successfulRequests: metrics.successfulRequests,
      clientErrors: metrics.clientErrors,
      serverErrors: metrics.serverErrors,
      averageResponseMs: avgResponseMs,
      slowRequests: metrics.slowRequests,
      rateLimitedRequests: metrics.rateLimitedRequests,
      authenticationFailures: metrics.authenticationFailures,
      authorizationFailures: metrics.authorizationFailures,
      aiRequests: metrics.aiRequests,
      aiFailures: metrics.aiFailures,
      databaseFailures: metrics.databaseFailures,
      uptimeSeconds: Math.round(process.uptime()),
      startedAt: metrics.startedAt,
      endpointStats,
    };
  },
};
