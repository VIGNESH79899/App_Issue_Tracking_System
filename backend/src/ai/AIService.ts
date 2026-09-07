import { AIProvider } from './AIProvider.js';
import { GeminiProvider } from './providers/GeminiProvider.js';
import { issueContextBuilder } from './issueContextBuilder.js';
import { AIInsightResponseData } from '@app-issue-track/shared';
import { env } from '../config/env.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { JwtPayload } from '../middlewares/auth.js';

export class AIService {
  private provider: AIProvider | null = null;

  constructor() {
    this.provider = new GeminiProvider();
  }

  isAiAvailable(): boolean {
    return Boolean(env.AI_ENABLED && env.GEMINI_API_KEY && this.provider);
  }

  async generateIssueInsights(
    currentUser: JwtPayload,
    issueId: string
  ): Promise<AIInsightResponseData> {
    // 1. SECURITY BOUNDARY FIRST: Verify project access and build authorized context
    const context = await issueContextBuilder.buildAuthorizedContext(currentUser, issueId);

    // 2. Check AI feature flag & credentials availability
    if (!this.isAiAvailable()) {
      throw new ApiError(400, 'AI_UNAVAILABLE', 'AI assistance is currently unavailable.');
    }

    // 3. Dispatch to LLM provider
    try {
      const insights = await this.provider!.generateStructuredInsight(context.sanitizedText);
      return {
        issueId,
        generatedAt: new Date().toISOString(),
        provider: this.provider!.name,
        model: env.AI_MODEL || 'gemini-2.5-flash',
        insights,
      };
    } catch (err: any) {
      console.error(`AI Generation Error for issue '${issueId}':`, err.message || err);
      throw new ApiError(
        500,
        'AI_GENERATION_FAILED',
        'Failed to generate AI insights due to provider failure or invalid model response'
      );
    }
  }
}

export const aiService = new AIService();
