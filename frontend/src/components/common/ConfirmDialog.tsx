import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full flex-shrink-0 ${isDanger ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="text-sm text-slate-600 leading-relaxed">{message}</div>
      </div>
      <div className="flex items-center justify-end space-x-3 mt-6">
        <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant={isDanger ? 'danger' : 'primary'} size="sm" onClick={onConfirm} isLoading={isLoading}>
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
};
