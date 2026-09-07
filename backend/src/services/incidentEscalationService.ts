import { IncidentEscalationDTO, EscalationLevel } from '@app-issue-track/shared';
import { prisma } from '../config/database.js';
import { ESCALATION_THRESHOLDS } from './incidentEscalationPolicy.js';
import { projectAccessService } from './projectAccessService.js';
import { JwtPayload } from '../middlewares/auth.js';
import { ApiError } from '../middlewares/errorHandler.js';

export class IncidentEscalationService {
  async evaluateIncidentEscalations(
    currentUser: JwtPayload,
    incidentId: string
  ): Promise<IncidentEscalationDTO[]> {
    const incident = await prisma.incident.findUnique({
      where: { id: incidentId },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true } },
        sourceIssue: { select: { id: true, priority: true } },
      },
    });

    if (!incident) throw ApiError.notFound('Incident not found');

    const canAccess = await projectAccessService.canAccessProject(currentUser, incident.projectId);
    if (!canAccess) throw ApiError.forbidden('You do not have access to this project');

    const escalations: IncidentEscalationDTO[] = [];
    const now = new Date();
    const detectedAt = new Date(incident.detectedAt);
    const elapsedMinutes = Math.floor((now.getTime() - detectedAt.getTime()) / (1000 * 60));
    const elapsedHours = Math.floor(elapsedMinutes / 60);

    // Rule 1: Unacknowledged SEV1/SEV2 Threshold
    if (incident.status === 'DETECTED' && !incident.acknowledgedAt) {
      if (incident.severity === 'SEV1' && elapsedMinutes >= ESCALATION_THRESHOLDS.UNACKNOWLEDGED_SEV1_MINUTES) {
        escalations.push({
          trigger: 'UNACKNOWLEDGED_SEV1_SLA_EXCEEDED',
          severity: EscalationLevel.CRITICAL,
          evidence: [
            `Severity: SEV1`,
            `Acknowledgement SLA Threshold: ${ESCALATION_THRESHOLDS.UNACKNOWLEDGED_SEV1_MINUTES} minutes`,
            `Elapsed Time: ${elapsedMinutes} minutes`,
            `Status: DETECTED (Unacknowledged)`,
          ],
          recommendedAction: 'Notify Project Manager and Engineering Lead immediately.',
          createdAt: now.toISOString(),
        });
      } else if (incident.severity === 'SEV2' && elapsedMinutes >= ESCALATION_THRESHOLDS.UNACKNOWLEDGED_SEV2_MINUTES) {
        escalations.push({
          trigger: 'UNACKNOWLEDGED_SEV2_SLA_EXCEEDED',
          severity: EscalationLevel.HIGH,
          evidence: [
            `Severity: SEV2`,
            `Acknowledgement SLA Threshold: ${ESCALATION_THRESHOLDS.UNACKNOWLEDGED_SEV2_MINUTES} minutes`,
            `Elapsed Time: ${elapsedMinutes} minutes`,
            `Status: DETECTED (Unacknowledged)`,
          ],
          recommendedAction: 'Assign an incident owner and acknowledge immediately.',
          createdAt: now.toISOString(),
        });
      }
    }

    // Rule 2: Unresolved Duration Threshold
    if (incident.status !== 'RESOLVED' && incident.status !== 'CLOSED') {
      if (incident.severity === 'SEV1' && elapsedHours >= ESCALATION_THRESHOLDS.UNRESOLVED_SEV1_HOURS) {
        escalations.push({
          trigger: 'UNRESOLVED_SEV1_LONG_RUNNING',
          severity: EscalationLevel.CRITICAL,
          evidence: [
            `Severity: SEV1`,
            `Resolution Target: ${ESCALATION_THRESHOLDS.UNRESOLVED_SEV1_HOURS} hours`,
            `Elapsed Time: ${elapsedHours} hours`,
            `Status: ${incident.status}`,
          ],
          recommendedAction: 'Escalate to cross-functional incident response team.',
          createdAt: now.toISOString(),
        });
      }
    }

    // Rule 3: Unassigned Critical Incident
    if (!incident.ownerId && (incident.severity === 'SEV1' || incident.severity === 'SEV2')) {
      escalations.push({
        trigger: 'UNASSIGNED_CRITICAL_INCIDENT',
        severity: EscalationLevel.HIGH,
        evidence: [
          `Incident Key: ${incident.incidentKey}`,
          `Severity: ${incident.severity}`,
          `Owner: Unassigned`,
        ],
        recommendedAction: 'Assign a dedicated incident commander.',
        createdAt: now.toISOString(),
      });
    }

    // Rule 4: Component Recurrence
    if (incident.moduleComponent) {
      const pastIncidentsCount = await prisma.incident.count({
        where: {
          projectId: incident.projectId,
          moduleComponent: incident.moduleComponent,
          id: { not: incident.id },
        },
      });

      if (pastIncidentsCount >= ESCALATION_THRESHOLDS.COMPONENT_RECURRENCE_THRESHOLD) {
        escalations.push({
          trigger: 'RECURRING_COMPONENT_INCIDENTS',
          severity: EscalationLevel.WARNING,
          evidence: [
            `Component: ${incident.moduleComponent}`,
            `Prior Component Incidents: ${pastIncidentsCount}`,
            `Recurrence Threshold: ${ESCALATION_THRESHOLDS.COMPONENT_RECURRENCE_THRESHOLD}`,
          ],
          recommendedAction: 'Schedule an architectural stability review for component.',
          createdAt: now.toISOString(),
        });
      }
    }

    return escalations;
  }
}

export const incidentEscalationService = new IncidentEscalationService();
