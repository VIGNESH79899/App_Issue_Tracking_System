import React, { useState } from 'react';
import { IssueStatus, ALLOWED_STATUS_TRANSITIONS } from '@app-issue-track/shared';
import { Button } from '../common/Button';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { ArrowRight, CheckCircle, RefreshCcw, XCircle, AlertCircle } from 'lucide-react';

export interface StatusWorkflowControlProps {
  currentStatus: IssueStatus;
  onChangeStatus: (newStatus: IssueStatus, resolution?: string) => Promise<void>;
  isLoading?: boolean;
}

export const StatusWorkflowControl: React.FC<StatusWorkflowControlProps> = ({
  currentStatus,
  onChangeStatus,
  isLoading = false,
}) => {
  const [resolutionModalOpen, setResolutionModalOpen] = useState(false);
  const [resolutionText, setResolutionText] = useState('');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Available allowed transitions derived directly from canonical shared enums contract
  const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

  const handleStatusClick = async (targetStatus: IssueStatus) => {
    setErrorBanner(null);
    if (targetStatus === IssueStatus.RESOLVED) {
      setResolutionModalOpen(true);
      return;
    }

    try {
      await onChangeStatus(targetStatus);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Status transition rejected by server';
      setErrorBanner(errorMsg);
    }
  };

  const handleConfirmResolution = async () => {
    setErrorBanner(null);
    try {
      await onChangeStatus(IssueStatus.RESOLVED, resolutionText || 'Fixed');
      setResolutionModalOpen(false);
      setResolutionText('');
    } catch (err: any) {
      const errorMsg = err.response?.data?.error?.message || 'Failed to set issue status to RESOLVED';
      setErrorBanner(errorMsg);
    }
  };

  const getStatusButtonIcon = (status: IssueStatus) => {
    switch (status) {
      case IssueStatus.RESOLVED:
      case IssueStatus.VERIFIED:
      case IssueStatus.CLOSED:
        return <CheckCircle className="w-3.5 h-3.5" />;
      case IssueStatus.REOPENED:
        return <RefreshCcw className="w-3.5 h-3.5" />;
      default:
        return <ArrowRight className="w-3.5 h-3.5" />;
    }
  };

  const getStatusButtonVariant = (status: IssueStatus) => {
    if (status === IssueStatus.RESOLVED || status === IssueStatus.VERIFIED) return 'primary';
    if (status === IssueStatus.CLOSED) return 'outline';
    if (status === IssueStatus.REOPENED) return 'danger';
    return 'secondary';
  };

  return (
    <div className="space-y-3">
      {errorBanner && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-md text-xs font-semibold text-rose-700 flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
          <span>{errorBanner}</span>
          <button onClick={() => setErrorBanner(null)} className="ml-auto text-rose-500 hover:text-rose-700">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">
          Available Transitions:
        </span>
        {allowedNextStatuses.length === 0 ? (
          <span className="text-xs text-slate-400 italic">No further status transitions available</span>
        ) : (
          allowedNextStatuses.map((nextStatus) => (
            <Button
              key={nextStatus}
              size="sm"
              variant={getStatusButtonVariant(nextStatus)}
              isLoading={isLoading}
              onClick={() => handleStatusClick(nextStatus)}
              leftIcon={getStatusButtonIcon(nextStatus)}
            >
              Transition to {nextStatus.replace('_', ' ')}
            </Button>
          ))
        )}
      </div>

      {/* Resolution Text Modal */}
      <Modal
        isOpen={resolutionModalOpen}
        onClose={() => setResolutionModalOpen(false)}
        title="Resolve Issue"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600">
            Please enter resolution details describing how this issue was fixed or resolved.
          </p>
          <Input
            label="Resolution Summary"
            placeholder="e.g. Fixed null pointer exception in payment gateway handler."
            value={resolutionText}
            onChange={(e) => setResolutionText(e.target.value)}
          />
          <div className="flex items-center justify-end space-x-3 pt-2">
            <Button variant="outline" size="sm" onClick={() => setResolutionModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleConfirmResolution} isLoading={isLoading}>
              Mark as Resolved
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
