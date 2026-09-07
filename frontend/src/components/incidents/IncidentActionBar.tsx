import React from 'react';
import { IncidentDTO, IncidentStatus, UserRole } from '@app-issue-track/shared';
import { Button } from '../common/Button';
import { CheckCircle2, ShieldAlert, ArrowRight, XCircle } from 'lucide-react';

interface IncidentActionBarProps {
  incident: IncidentDTO;
  currentUserRole?: UserRole;
  onAcknowledge: () => void;
  onTransitionStatus: (status: IncidentStatus) => void;
  onResolve: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const IncidentActionBar: React.FC<IncidentActionBarProps> = ({
  incident,
  currentUserRole,
  onAcknowledge,
  onTransitionStatus,
  onResolve,
  onClose,
  isLoading,
}) => {
  const isReporter = currentUserRole === UserRole.REPORTER;

  return (
    <div className="bg-slate-900 text-white border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-subtle">
      <div className="flex items-center space-x-2">
        <ShieldAlert className="w-5 h-5 text-brand-400" />
        <div>
          <span className="text-xs font-bold uppercase tracking-wider block text-slate-300">Incident Command Action Bar</span>
          <span className="text-[11px] text-slate-400 font-mono">Current Status: {incident.status}</span>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {incident.status === IncidentStatus.DETECTED && (
          <Button
            size="sm"
            variant="primary"
            onClick={onAcknowledge}
            isLoading={isLoading}
            disabled={isReporter}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Acknowledge Incident
          </Button>
        )}

        {incident.status === IncidentStatus.ACKNOWLEDGED && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => onTransitionStatus(IncidentStatus.INVESTIGATING)}
            isLoading={isLoading}
            disabled={isReporter}
            leftIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Start Investigation
          </Button>
        )}

        {incident.status === IncidentStatus.INVESTIGATING && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => onTransitionStatus(IncidentStatus.MITIGATING)}
            isLoading={isLoading}
            disabled={isReporter}
            leftIcon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            Start Mitigation
          </Button>
        )}

        {incident.status === IncidentStatus.MITIGATING && (
          <Button
            size="sm"
            variant="primary"
            onClick={onResolve}
            isLoading={isLoading}
            disabled={isReporter}
            leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
          >
            Resolve Incident
          </Button>
        )}

        {incident.status === IncidentStatus.RESOLVED && (
          <Button
            size="sm"
            variant="outline"
            onClick={onClose}
            isLoading={isLoading}
            disabled={isReporter}
            leftIcon={<XCircle className="w-3.5 h-3.5" />}
          >
            Close Incident
          </Button>
        )}

        {incident.status === IncidentStatus.CLOSED && (
          <span className="text-xs font-mono text-slate-400 bg-slate-800 px-3 py-1.5 rounded border border-slate-700">
            ✓ Incident Closed
          </span>
        )}
      </div>
    </div>
  );
};
