import apiClient from './apiClient';

export interface SystemDependencies {
  database: { status: string; latencyMs: number };
  storage: { status: string; path: string };
  ai: { status: string; provider: string; model: string; enabled: boolean };
}

export interface SystemMetrics {
  totalRequests: number;
  successfulRequests: number;
  clientErrors: number;
  serverErrors: number;
  averageResponseMs: number;
  slowRequests: number;
  rateLimitedRequests: number;
  aiRequests: number;
  aiFailures: number;
  databaseFailures: number;
}

export interface SecurityCounts {
  AUTH_FAILURE: number;
  FORBIDDEN_ACCESS: number;
  RATE_LIMIT: number;
  SUSPICIOUS_REQUEST: number;
  AI_FAILURE: number;
  DATABASE_FAILURE: number;
}

export interface EndpointStat {
  route: string;
  requests: number;
  errors: number;
  averageMs: number;
  p95Ms: number;
}

export interface OperationsOverview {
  system: {
    nodeVersion: string;
    uptimeSeconds: number;
    startedAt: string;
    timestamp: string;
    environment: string;
    memoryMb: number;
  };
  dependencies: SystemDependencies;
  metrics: SystemMetrics;
  security: SecurityCounts;
  endpointStats: EndpointStat[];
}

export interface SecurityEvent {
  type: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  route?: string;
  method?: string;
  message: string;
}

export const operationsApi = {
  async getOverview(): Promise<OperationsOverview> {
    const res = await apiClient.get('/operations/overview');
    return res.data.data;
  },

  async getMetrics(): Promise<ReturnType<typeof metricsShapeOf>> {
    const res = await apiClient.get('/operations/metrics');
    return res.data.data;
  },

  async getSecurityEvents(limit = 50): Promise<SecurityEvent[]> {
    const res = await apiClient.get(`/operations/security-events?limit=${limit}`);
    return res.data.data;
  },
};

// Type helper — not executed
function metricsShapeOf() {
  return {} as SystemMetrics & { endpointStats: EndpointStat[]; uptimeSeconds: number; startedAt: string };
}
