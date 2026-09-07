import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  ForecastConfidence,
  ForecastDirection,
  BacklogForecast,
  SlaForecast,
  ProjectDeliveryRisk,
  AIAnalyticsBriefing,
} from '@app-issue-track/shared';
import { ForecastConfidenceBadge } from '../components/analytics/ForecastConfidenceBadge';
import { AnalyticsEmptyState } from '../components/analytics/AnalyticsEmptyState';
import { BacklogForecastCard } from '../components/analytics/BacklogForecastCard';
import { AIAnalyticsBriefingComponent } from '../components/analytics/AIAnalyticsBriefing';

describe('AITS Phase 8 - Analytics UI Contract Tests', () => {
  it('1. ForecastConfidence enum values should be defined correctly', () => {
    expect(ForecastConfidence.HIGH).toBe('HIGH');
    expect(ForecastConfidence.MEDIUM).toBe('MEDIUM');
    expect(ForecastConfidence.LOW).toBe('LOW');
    expect(ForecastConfidence.INSUFFICIENT_DATA).toBe('INSUFFICIENT_DATA');
  });

  it('2. ForecastDirection enum values should be defined correctly', () => {
    expect(ForecastDirection.IMPROVING).toBe('IMPROVING');
    expect(ForecastDirection.STABLE).toBe('STABLE');
    expect(ForecastDirection.DETERIORATING).toBe('DETERIORATING');
  });

  it('3. BacklogForecast DTO should construct correctly', () => {
    const forecast: BacklogForecast = {
      currentBacklog: 47,
      forecast7Days: 52,
      forecast14Days: 59,
      forecast30Days: 74,
      direction: ForecastDirection.DETERIORATING,
      confidence: ForecastConfidence.HIGH,
      points: [],
      explanation: ['CURRENT FACT: open backlog = 47 active issues.'],
    };
    expect(forecast.forecast14Days).toBe(59);
    expect(forecast.direction).toBe('DETERIORATING');
  });

  it('4. SlaForecast DTO should construct correctly', () => {
    const forecast: SlaForecast = {
      currentCompliancePercentage: 84,
      forecast7Days: 81,
      forecast14Days: 78,
      forecast30Days: 73,
      direction: ForecastDirection.DETERIORATING,
      confidence: ForecastConfidence.MEDIUM,
      expectedAtRiskIssues: 5,
      expectedBreachedIssues: 2,
      explanation: ['CURRENT FACT: 2 active SLA breaches.'],
    };
    expect(forecast.currentCompliancePercentage).toBe(84);
    expect(forecast.expectedBreachedIssues).toBe(2);
  });

  it('5. ProjectDeliveryRisk score should be within 0-100 range', () => {
    const risk: ProjectDeliveryRisk = {
      score: 67,
      level: 'HIGH',
      currentHealthScore: 60,
      backlogPressure: 70,
      slaPressure: 60,
      capacityPressure: 65,
      incidentPressure: 55,
      resolutionPressure: 70,
      confidence: ForecastConfidence.HIGH,
      reasons: ['Backlog growing faster than resolution rate.'],
    };
    expect(risk.score).toBeGreaterThanOrEqual(0);
    expect(risk.score).toBeLessThanOrEqual(100);
    expect(risk.level).toBe('HIGH');
  });

  it('6. should render INSUFFICIENT DATA confidence badges clearly', () => {
    const html = renderToStaticMarkup(
      <ForecastConfidenceBadge confidence={ForecastConfidence.INSUFFICIENT_DATA} />
    );

    expect(html).toContain('INSUFFICIENT DATA');
  });

  it('7. should render a clean empty state with no project leakage', () => {
    const html = renderToStaticMarkup(<AnalyticsEmptyState />);

    expect(html).toContain('No Accessible Projects for Forecasting');
    expect(html).not.toContain('Project A');
    expect(html).not.toContain('Project B');
  });

  it('8. should distinguish current and forecast backlog values in the UI', () => {
    const forecast: BacklogForecast = {
      currentBacklog: 12,
      forecast7Days: 15,
      forecast14Days: 18,
      forecast30Days: 22,
      direction: ForecastDirection.DETERIORATING,
      confidence: ForecastConfidence.MEDIUM,
      points: [],
      explanation: ['CURRENT FACT: open backlog = 12 active issues.'],
    };

    const html = renderToStaticMarkup(<BacklogForecastCard forecast={forecast} />);
    expect(html).toContain('Current');
    expect(html).toContain('7-Day');
    expect(html).toContain('14-Day');
    expect(html).toContain('30-Day');
    expect(html).toContain('12');
    expect(html).toContain('18');
  });

  it('9. should render AI briefing as advisory output from calculated facts', () => {
    const briefing: AIAnalyticsBriefing = {
      summary: 'Delivery risk remains elevated due to backlog growth.',
      keyRisks: ['Backlog outpaces resolution'],
      forecastHighlights: ['14-day backlog is projected to increase'],
      recommendedFocusAreas: ['Rebalance ownership'],
      generatedAt: new Date().toISOString(),
    };

    const html = renderToStaticMarkup(
      <AIAnalyticsBriefingComponent briefing={briefing} isLoading={false} />
    );

    expect(html).toContain('Generated from calculated backend facts. Advisory only.');
    expect(html).toContain('Backlog outpaces resolution');
  });
});
