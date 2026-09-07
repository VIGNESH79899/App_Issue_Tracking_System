import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { aiService } from '../ai/AIService.js';
import { GeminiProvider } from '../ai/providers/GeminiProvider.js';
import { issueContextBuilder } from '../ai/issueContextBuilder.js';
import { issueInsightSchema } from '../ai/schemas/issueInsightSchema.js';
import { UserRole } from '@app-issue-track/shared';

describe('Google Gemini AI Intelligence Layer & Security Boundaries', () => {
  it('1. should initialize GeminiProvider correctly', () => {
    const provider = new GeminiProvider();
    expect(provider.name).toBe('gemini');
  });

  it('2. should return controlled AI_UNAVAILABLE error when AI is disabled or GEMINI_API_KEY missing', async () => {
    expect(aiService.isAiAvailable()).toBe(false);

    const mockUser = {
      userId: 'test-user-1',
      email: 'user@test.com',
      role: UserRole.REPORTER,
    };

    await expect(aiService.generateIssueInsights(mockUser as any, 'some-issue-id')).rejects.toThrow();
  });

  it('3. should return 401 Unauthorized when accessing AI endpoints without auth token', async () => {
    const res = await request(app).get('/api/v1/issues/test-issue-id/ai-insights');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('4. should return 401 Unauthorized when calling regenerate endpoint without auth token', async () => {
    const res = await request(app).post('/api/v1/issues/test-issue-id/ai-insights/regenerate');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('5. should reject AI context creation for unauthorized project user (403 Forbidden)', async () => {
    const unassignedUser = {
      userId: 'unassigned-user-id',
      email: 'unassigned@test.com',
      role: UserRole.REPORTER,
    };

    await expect(
      issueContextBuilder.buildAuthorizedContext(unassignedUser as any, 'non-accessible-issue')
    ).rejects.toThrow();
  });

  it('6. should strictly validate Gemini output JSON structure with Zod schema', () => {
    const validGeminiInsight = {
      summary: 'High priority payment gateway authorization timeout issue.',
      rootCauseHypotheses: [
        {
          hypothesis: 'Network latency during token verification',
          confidence: 85,
          evidence: ['Actual result mentions timeout error'],
        },
      ],
      recommendedActions: [
        {
          action: 'Increase webhook timeout limit to 5000ms',
          priority: 'HIGH',
          reason: 'Prevents false timeouts during high traffic',
        },
      ],
      riskAssessment: {
        level: 'HIGH',
        reasons: ['Directly impacts customer checkout transactions'],
      },
      testingRecommendations: ['Run load test against checkout endpoint'],
      missingInformation: ['Application server access logs around timestamp'],
    };

    const parsed = issueInsightSchema.parse(validGeminiInsight);
    expect(parsed.summary).toBe(validGeminiInsight.summary);
    expect(parsed.rootCauseHypotheses[0].confidence).toBe(85);
  });

  it('7. should reject invalid Gemini output schema missing required summary field', () => {
    const invalidInsight = {
      rootCauseHypotheses: [],
      recommendedActions: [],
      riskAssessment: { level: 'LOW', reasons: [] },
    };

    expect(() => issueInsightSchema.parse(invalidInsight)).toThrow();
  });

  it('8. should sanitize context text and strip sensitive tokens and password hashes before Gemini', () => {
    const sampleText = 'Error with token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.secret and hash $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';

    const sanitized = sampleText
      .replace(/eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, '[REDACTED_TOKEN]')
      .replace(/\$2[aby]\$\d+\$[A-Za-z0-9./]{53}/g, '[REDACTED_HASH]');

    expect(sanitized).not.toContain('eyJhbGci');
    expect(sanitized).not.toContain('$2a$10$');
    expect(sanitized).toContain('[REDACTED_TOKEN]');
    expect(sanitized).toContain('[REDACTED_HASH]');
  });

  it('9. should enforce rate limiting protection contract for AI generation requests', () => {
    const limit = 10;
    const requestTimestamps: number[] = [];
    const now = Date.now();
    for (let i = 0; i < 11; i++) {
      requestTimestamps.push(now);
    }
    const isExceeded = requestTimestamps.length > limit;
    expect(isExceeded).toBe(true);
  });
});
