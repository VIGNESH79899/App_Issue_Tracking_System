import { AIIssueInsight } from '@app-issue-track/shared';
import { ZodType } from 'zod';

export interface AIProvider {
  name: string;
  generateStructuredInsight(prompt: string): Promise<AIIssueInsight>;
  generateStructuredJson?<T>(prompt: string, systemPrompt: string, schema: ZodType<T>): Promise<T>;
}
