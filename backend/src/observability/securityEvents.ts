export type SecurityEventType =
  | 'AUTH_FAILURE'
  | 'FORBIDDEN_ACCESS'
  | 'RATE_LIMIT'
  | 'SUSPICIOUS_REQUEST'
  | 'AI_FAILURE'
  | 'DATABASE_FAILURE';

export interface SecurityEvent {
  type: SecurityEventType;
  timestamp: string;
  requestId?: string;
  userId?: string;
  route?: string;
  method?: string;
  message: string;
}

// In-memory circular buffer — max 500 events per process lifecycle
const MAX_EVENTS = 500;
const securityEventLog: SecurityEvent[] = [];

export function recordSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  const entry: SecurityEvent = { ...event, timestamp: new Date().toISOString() };
  if (securityEventLog.length >= MAX_EVENTS) {
    securityEventLog.shift(); // remove oldest
  }
  securityEventLog.push(entry);
}

export function getRecentSecurityEvents(limit = 50): SecurityEvent[] {
  return securityEventLog.slice(-limit).reverse();
}

export function getSecurityEventCounts(): Record<SecurityEventType, number> {
  const counts: Record<SecurityEventType, number> = {
    AUTH_FAILURE: 0,
    FORBIDDEN_ACCESS: 0,
    RATE_LIMIT: 0,
    SUSPICIOUS_REQUEST: 0,
    AI_FAILURE: 0,
    DATABASE_FAILURE: 0,
  };
  for (const ev of securityEventLog) {
    counts[ev.type]++;
  }
  return counts;
}
