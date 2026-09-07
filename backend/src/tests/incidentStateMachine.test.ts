import { describe, it, expect } from 'vitest';
import { ALLOWED_INCIDENT_TRANSITIONS } from '../services/incidentService.js';
import { IncidentStatus } from '@app-issue-track/shared';

describe('AITS Phase 6 — Incident Status State Machine Tests', () => {
  it('1. DETECTED should only transition to ACKNOWLEDGED', () => {
    const allowed = ALLOWED_INCIDENT_TRANSITIONS[IncidentStatus.DETECTED];
    expect(allowed).toEqual([IncidentStatus.ACKNOWLEDGED]);
    expect(allowed.includes(IncidentStatus.RESOLVED)).toBe(false);
    expect(allowed.includes(IncidentStatus.CLOSED)).toBe(false);
  });

  it('2. ACKNOWLEDGED should only transition to INVESTIGATING', () => {
    const allowed = ALLOWED_INCIDENT_TRANSITIONS[IncidentStatus.ACKNOWLEDGED];
    expect(allowed).toEqual([IncidentStatus.INVESTIGATING]);
  });

  it('3. INVESTIGATING should only transition to MITIGATING', () => {
    const allowed = ALLOWED_INCIDENT_TRANSITIONS[IncidentStatus.INVESTIGATING];
    expect(allowed).toEqual([IncidentStatus.MITIGATING]);
  });

  it('4. MITIGATING should only transition to RESOLVED', () => {
    const allowed = ALLOWED_INCIDENT_TRANSITIONS[IncidentStatus.MITIGATING];
    expect(allowed).toEqual([IncidentStatus.RESOLVED]);
  });

  it('5. CLOSED should not allow any further transitions', () => {
    const allowed = ALLOWED_INCIDENT_TRANSITIONS[IncidentStatus.CLOSED];
    expect(allowed).toEqual([]);
  });
});
