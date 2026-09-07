import { prisma } from '../config/database.js';
import { projectAccessService } from './projectAccessService.js';
import { slaService } from './slaService.js';
import { developerCapacityService } from './developerCapacityService.js';
import { componentRiskService } from './componentRiskService.js';
import { ApiError } from '../middlewares/errorHandler.js';
import { JwtPayload } from '../middlewares/auth.js';
import { EngineeringBottleneck } from '@app-issue-track/shared';

export class BottleneckService {
  async detectBottlenecks(
    currentUser: JwtPayload,
    projectId: string
  ): Promise<EngineeringBottleneck[]> {
    const canAccess = await projectAccessService.canAccessProject(currentUser, projectId);
    if (!canAccess) {
      throw ApiError.forbidden('You do not have permission to detect bottlenecks for this project');
    }

    const bottlenecks: EngineeringBottleneck[] = [];

    const issues = await prisma.issue.findMany({
      where: { projectId },
      select: {
        id: true,
        issueKey: true,
        title: true,
        status: true,
        priority: true,
        severity: true,
        assigneeId: true,
        createdAt: true,
        resolvedAt: true,
        closedAt: true,
      },
    });

    if (issues.length === 0) {
      return [];
    }

    // 1. DEVELOPER CAPACITY BOTTLENECK
    const capacities = await developerCapacityService.getDeveloperCapacity(currentUser, projectId);
    const overloadedDevs = capacities.filter((c) => c.capacityLevel === 'OVERLOADED' || c.capacityLevel === 'BUSY');
    if (overloadedDevs.length > 0) {
      bottlenecks.push({
        type: 'DEVELOPER_CAPACITY',
        severity: overloadedDevs.some((d) => d.capacityLevel === 'OVERLOADED') ? 'HIGH' : 'MEDIUM',
        title: 'Developer Capacity Constrained',
        description: `${overloadedDevs.length} developer(s) are operating at high or overloaded capacity.`,
        affectedCount: overloadedDevs.length,
        evidence: overloadedDevs.map(
          (d) => `${d.developerName}: ${d.activeIssues} active issues (${d.criticalHighIssues} critical/high)`
        ),
        recommendedAction: 'Reassign unassigned or low-priority issues to balance team workload distribution.',
      });
    }

    // 2. SLA BREACHES BOTTLENECK
    let breachCount = 0;
    const breachedKeys: string[] = [];
    for (const i of issues) {
      const sla = slaService.calculateSlaForIssue(i as any);
      if (sla.responseStatus === 'BREACHED' || sla.resolutionStatus === 'BREACHED') {
        breachCount++;
        breachedKeys.push(`[${i.issueKey}] ${i.title}`);
      }
    }
    if (breachCount > 0) {
      bottlenecks.push({
        type: 'SLA_BREACHES',
        severity: breachCount >= 3 ? 'CRITICAL' : 'HIGH',
        title: 'SLA Breach Accumulation',
        description: `${breachCount} active or historical issue(s) have breached SLA commitments.`,
        affectedCount: breachCount,
        evidence: breachedKeys.slice(0, 3),
        recommendedAction: 'Immediately escalate breached issues and verify response/resolution deadlines.',
      });
    }

    // 3. CRITICAL BACKLOG BOTTLENECK
    const criticalBacklog = issues.filter(
      (i) =>
        i.status !== 'RESOLVED' &&
        i.status !== 'CLOSED' &&
        (i.priority === 'CRITICAL' || i.severity === 'CRITICAL' || i.severity === 'BLOCKER')
    );
    if (criticalBacklog.length > 0) {
      bottlenecks.push({
        type: 'CRITICAL_BACKLOG',
        severity: criticalBacklog.length >= 2 ? 'CRITICAL' : 'HIGH',
        title: 'Critical/Blocker Backlog Accumulation',
        description: `${criticalBacklog.length} critical or blocker issue(s) remain open in the project backlog.`,
        affectedCount: criticalBacklog.length,
        evidence: criticalBacklog.map((i) => `[${i.issueKey}] ${i.title} (${i.priority}/${i.severity})`),
        recommendedAction: 'Schedule immediate engineering swarm session to resolve high-severity blockers.',
      });
    }

    // 4. UNASSIGNED ASSIGNMENT BOTTLENECK
    const unassignedCount = issues.filter(
      (i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED' && !i.assigneeId
    ).length;
    if (unassignedCount >= 2) {
      bottlenecks.push({
        type: 'ASSIGNMENT_BACKLOG',
        severity: 'MEDIUM',
        title: 'Unassigned Issue Backlog',
        description: `${unassignedCount} active issue(s) lack assigned developer ownership.`,
        affectedCount: unassignedCount,
        evidence: [`${unassignedCount} reported issues waiting for assignee assignment.`],
        recommendedAction: 'Use Smart Issue Routing to assign issues to qualified team members.',
      });
    }

    // 5. COMPONENT CONCENTRATION BOTTLENECK
    const components = await componentRiskService.getComponentRiskSummaries(currentUser, projectId);
    const riskyComponents = components.filter((c) => c.riskLevel === 'CRITICAL' || c.riskLevel === 'HIGH');
    if (riskyComponents.length > 0) {
      bottlenecks.push({
        type: 'COMPONENT_CONCENTRATION',
        severity: 'HIGH',
        title: 'High Risk Component Concentration',
        description: `${riskyComponents.length} module component(s) show concentrated issue risk and high growth.`,
        affectedCount: riskyComponents.length,
        evidence: riskyComponents.map((c) => `${c.component}: Risk Score ${c.riskScore}/100 (${c.activeIssues} active issues)`),
        recommendedAction: 'Conduct architecture review and unit testing audit on vulnerable components.',
      });
    }

    return bottlenecks;
  }
}

export const bottleneckService = new BottleneckService();
