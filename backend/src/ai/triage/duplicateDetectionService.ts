import { prisma } from '../../config/database.js';
import { projectAccessService } from '../../services/projectAccessService.js';
import { ApiError } from '../../middlewares/errorHandler.js';
import { JwtPayload } from '../../middlewares/auth.js';
import { DuplicateCandidateItem, AnalyzeIssueInput, IssueStatus, IssuePriority, IssueSeverity } from '@app-issue-track/shared';

export class DuplicateDetectionService {
  async getDuplicateCandidates(
    currentUser: JwtPayload,
    draft: Partial<AnalyzeIssueInput>,
    excludeIssueId?: string
  ): Promise<DuplicateCandidateItem[]> {
    const projectId = draft.projectId;
    if (!projectId) {
      return [];
    }

    // 1. SECURITY BOUNDARY FIRST: Verify project access
    const canAccess = await projectAccessService.canAccessProject(currentUser, projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have access to this project to perform duplicate search');
    }

    // 2. Fetch user's accessible project IDs (null = ADMIN global access)
    const accessibleProjectIds = await projectAccessService.getAccessibleProjectIds(currentUser);
    if (accessibleProjectIds !== null && accessibleProjectIds.length === 0) {
      return [];
    }

    // 3. Stage 1: Deterministic retrieval from PostgreSQL
    const whereCondition: any = {};

    if (accessibleProjectIds !== null) {
      whereCondition.projectId = { in: accessibleProjectIds };
    }

    if (excludeIssueId) {
      whereCondition.id = { not: excludeIssueId };
    }

    const candidateIssues = await prisma.issue.findMany({
      where: whereCondition,
      take: 20,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        issueKey: true,
        title: true,
        description: true,
        status: true,
        priority: true,
        severity: true,
        moduleComponent: true,
      },
    });

    if (candidateIssues.length === 0) {
      return [];
    }

    // 4. Stage 2: Calculate deterministic text similarity scores
    const draftTitleWords = (draft.title || '').toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const draftDescWords = (draft.description || '').toLowerCase().split(/\s+/).filter((w) => w.length > 3);

    const scoredCandidates: DuplicateCandidateItem[] = candidateIssues.map((cand) => {
      let score = 0;
      const reasons: string[] = [];

      // Same component check (+25 pts)
      if (draft.moduleComponent && cand.moduleComponent && draft.moduleComponent.toLowerCase() === cand.moduleComponent.toLowerCase()) {
        score += 25;
        reasons.push(`Same component/module (${cand.moduleComponent})`);
      }

      // Title word overlap (+40 pts max)
      const candTitleLower = cand.title.toLowerCase();
      let titleMatches = 0;
      for (const word of draftTitleWords) {
        if (candTitleLower.includes(word)) {
          titleMatches++;
        }
      }
      if (draftTitleWords.length > 0 && titleMatches > 0) {
        const titleOverlapRatio = titleMatches / draftTitleWords.length;
        const titlePts = Math.round(titleOverlapRatio * 40);
        score += titlePts;
        reasons.push(`Title keyword overlap (${Math.round(titleOverlapRatio * 100)}% match)`);
      }

      // Description word overlap (+35 pts max)
      const candDescLower = cand.description.toLowerCase();
      let descMatches = 0;
      for (const word of draftDescWords) {
        if (candDescLower.includes(word)) {
          descMatches++;
        }
      }
      if (draftDescWords.length > 0 && descMatches > 0) {
        const descOverlapRatio = descMatches / Math.max(10, draftDescWords.length);
        const descPts = Math.round(Math.min(1, descOverlapRatio) * 35);
        score += descPts;
        reasons.push('Similar error pattern and description context');
      }

      const finalScore = Math.min(98, Math.max(10, score));

      return {
        issueId: cand.id,
        issueKey: cand.issueKey,
        title: cand.title,
        status: cand.status as IssueStatus,
        priority: cand.priority as IssuePriority,
        severity: cand.severity as IssueSeverity,
        similarityScore: finalScore,
        reasons: reasons.length > 0 ? reasons : ['General issue text resemblance'],
      };
    });

    // Filter candidates with similarity > 30% and return top 5 sorted by score descending
    return scoredCandidates
      .filter((c) => c.similarityScore >= 35)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, 5);
  }
}

export const duplicateDetectionService = new DuplicateDetectionService();
