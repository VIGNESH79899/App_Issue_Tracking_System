import { IssueQualityMetric, AnalyzeIssueInput } from '@app-issue-track/shared';

export class IssueQualityService {
  calculateQualityScore(input: Partial<AnalyzeIssueInput>): IssueQualityMetric {
    let score = 0;
    const reasons: string[] = [];

    // 1. Title clarity (15 pts)
    const title = (input.title || '').trim();
    const titleClarity = title.length >= 10;
    if (titleClarity) {
      score += 15;
      reasons.push('✓ Clear and descriptive title provided (+15 pts)');
    } else {
      reasons.push('⚠ Title is too brief or ambiguous (0 pts)');
    }

    // 2. Description completeness (20 pts)
    const description = (input.description || '').trim();
    const descriptionCompleteness = description.length >= 30;
    if (descriptionCompleteness) {
      score += 20;
      reasons.push('✓ Comprehensive problem description provided (+20 pts)');
    } else {
      reasons.push('⚠ Description lacks sufficient context or detail (0 pts)');
    }

    // 3. Reproduction steps (15 pts)
    const steps = (input.stepsToReproduce || '').trim();
    const reproductionStepsProvided = steps.length >= 15;
    if (reproductionStepsProvided) {
      score += 15;
      reasons.push('✓ Explicit steps to reproduce provided (+15 pts)');
    } else {
      reasons.push('⚠ Steps to reproduce are missing or incomplete (0 pts)');
    }

    // 4. Expected behavior (10 pts)
    const expected = (input.expectedResult || '').trim();
    const expectedBehaviorProvided = expected.length >= 10;
    if (expectedBehaviorProvided) {
      score += 10;
      reasons.push('✓ Expected behavior clearly specified (+10 pts)');
    } else {
      reasons.push('⚠ Expected behavior is missing (0 pts)');
    }

    // 5. Actual behavior (10 pts)
    const actual = (input.actualResult || '').trim();
    const actualBehaviorProvided = actual.length >= 10;
    if (actualBehaviorProvided) {
      score += 10;
      reasons.push('✓ Actual observed outcome specified (+10 pts)');
    } else {
      reasons.push('⚠ Actual outcome is missing (0 pts)');
    }

    // 6. Environment (10 pts)
    const env = (input.environment || '').trim();
    const environmentSpecified = env.length > 0 && env.toLowerCase() !== 'n/a';
    if (environmentSpecified) {
      score += 10;
      reasons.push(`✓ Target environment specified [${env}] (+10 pts)`);
    } else {
      reasons.push('⚠ Environment details missing (0 pts)');
    }

    // 7. Error logs or stack trace presence (10 pts)
    const combinedText = `${title} ${description} ${steps} ${actual}`.toLowerCase();
    const errorLogsProvided =
      combinedText.includes('error') ||
      combinedText.includes('exception') ||
      combinedText.includes('stack') ||
      combinedText.includes('trace') ||
      combinedText.includes('timeout') ||
      combinedText.includes('500') ||
      combinedText.includes('404') ||
      combinedText.includes('failed');

    if (errorLogsProvided) {
      score += 10;
      reasons.push('✓ Error codes, messages, or stack trace keywords present (+10 pts)');
    } else {
      reasons.push('⚠ No error log or status code keywords found (0 pts)');
    }

    // 8. Module / Component specified (10 pts)
    const comp = (input.moduleComponent || '').trim();
    const moduleSpecified = comp.length > 0 && comp.toLowerCase() !== 'n/a';
    if (moduleSpecified) {
      score += 10;
      reasons.push(`✓ Module/Component identified [${comp}] (+10 pts)`);
    } else {
      reasons.push('⚠ Module or Component not specified (0 pts)');
    }

    return {
      score: Math.min(100, Math.max(0, score)),
      titleClarity,
      descriptionCompleteness,
      reproductionStepsProvided,
      expectedBehaviorProvided,
      actualBehaviorProvided,
      environmentSpecified,
      errorLogsProvided,
      moduleSpecified,
      reasons,
    };
  }
}

export const issueQualityService = new IssueQualityService();
