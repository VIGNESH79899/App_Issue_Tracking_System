import { prisma } from '../config/database.js';
import { projectAccessService } from '../services/projectAccessService.js';
import { slaService } from '../services/slaService.js';
import { intelligenceService } from '../services/intelligenceService.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { JwtPayload } from '../middlewares/auth.js';
import { UserRole } from '@app-issue-track/shared';

export interface BoundedIssueContext {
  issueId: string;
  issueKey: string;
  projectId: string;
  sanitizedText: string;
}

export class IssueContextBuilder {
  async buildAuthorizedContext(currentUser: JwtPayload, issueId: string): Promise<BoundedIssueContext> {
    // 1. Fetch issue record
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      include: {
        application: { select: { name: true, code: true } },
        project: { select: { name: true, key: true } },
        reporter: { select: { firstName: true, lastName: true, role: true } },
        assignee: { select: { firstName: true, lastName: true, role: true } },
        comments: {
          take: 10,
          orderBy: { createdAt: 'asc' },
          include: {
            author: { select: { firstName: true, lastName: true, role: true } },
          },
        },
        history: {
          take: 15,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!issue) {
      throw ApiError.notFound(`Issue with ID '${issueId}' not found`);
    }

    // 2. Security Boundary: Verify project access BEFORE context construction
    const canAccess = await projectAccessService.canAccessProject(currentUser, issue.projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to access AI insights for this issue');
    }

    // 3. Pre-calculated deterministic facts
    const sla = slaService.calculateSlaForIssue(issue, issue.history);
    const intelligence = await intelligenceService.getIssueIntelligence(currentUser, issue.id);

    // Filter comments: exclude internal comments for REPORTER or DEVELOPER if not author
    const canSeeInternal = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.PROJECT_MANAGER;
    const visibleComments = issue.comments.filter((c) => {
      if (!c.isInternal) return true;
      return canSeeInternal || c.authorId === currentUser.userId;
    });

    // Sanitization helper to strip potential tokens/credentials and truncate text
    const sanitize = (text: string | null | undefined, maxLen = 800): string => {
      if (!text) return 'N/A';
      // Strip potential tokens or password hashes
      let cleaned = text
        .replace(/eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*/g, '[REDACTED_TOKEN]')
        .replace(/bearer\s+[a-zA-Z0-9._-]+/gi, '[REDACTED_AUTH_HEADER]')
        .replace(/\$2[aby]\$\d+\$[A-Za-z0-9./]{53}/g, '[REDACTED_HASH]');
      if (cleaned.length > maxLen) {
        cleaned = cleaned.substring(0, maxLen) + '... [TRUNCATED]';
      }
      return cleaned;
    };

    const formattedHistory = issue.history
      .map((h) => `- [${h.createdAt.toISOString()}] ${h.actionType}: ${h.fieldChanged} (Old: ${sanitize(h.oldValue, 100)}, New: ${sanitize(h.newValue, 100)})`)
      .join('\n');

    const formattedComments = visibleComments
      .map((c) => `- [${c.author.firstName} ${c.author.lastName}] (${c.isInternal ? 'Internal' : 'Public'}): ${sanitize(c.content, 300)}`)
      .join('\n');

    const formattedRelated = intelligence.relatedIssues
      .map((r) => `- [${r.issueKey}] ${r.title} (${r.status}, ${r.priority}) - Reason: ${r.relationshipReason}`)
      .join('\n');

    const contextText = `
ISSUE SUMMARY & DETAILS:
Key: ${issue.issueKey}
Title: ${sanitize(issue.title, 200)}
Application: ${issue.application.name} (${issue.application.code})
Project: ${issue.project.name} (${issue.project.key})
Module/Component: ${issue.moduleComponent || 'N/A'}
Environment: ${issue.environment || 'N/A'}
Status: ${issue.status}
Priority: ${issue.priority}
Severity: ${issue.severity}
Reporter: ${issue.reporter.firstName} ${issue.reporter.lastName} (${issue.reporter.role})
Assignee: ${issue.assignee ? `${issue.assignee.firstName} ${issue.assignee.lastName} (${issue.assignee.role})` : 'Unassigned'}
Created At: ${issue.createdAt.toISOString()}

DESCRIPTION:
${sanitize(issue.description, 1000)}

STEPS TO REPRODUCE:
${sanitize(issue.stepsToReproduce, 800)}

EXPECTED RESULT:
${sanitize(issue.expectedResult, 500)}

ACTUAL RESULT:
${sanitize(issue.actualResult, 500)}

RESOLUTION DETAILS:
${sanitize(issue.resolution, 500)}

DETERMINISTIC SLA & AGE METRICS:
Issue Age: ${intelligence.issueAge.formatted}
Current Status Duration: ${intelligence.currentStatusDuration.formatted}
Response Deadline: ${sla.responseDeadline} (Status: ${sla.responseStatus})
Resolution Deadline: ${sla.resolutionDeadline} (Status: ${sla.resolutionStatus}, ${sla.resolutionRemainingHours}h remaining)

AUTHORITATIVE RELATED ISSUES (PRE-CALCULATED):
${formattedRelated || 'None'}

RECENT RELEVANT COMMENTS:
${formattedComments || 'No comments'}

RECENT ISSUE HISTORY:
${formattedHistory || 'No history records'}
`.trim();

    return {
      issueId: issue.id,
      issueKey: issue.issueKey,
      projectId: issue.projectId,
      sanitizedText: contextText,
    };
  }
}

export const issueContextBuilder = new IssueContextBuilder();
