import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
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
  maxWidth = 'md',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth={maxWidth}>
      <div className="flex items-start space-x-3.5">
        <div
          className={`p-2.5 rounded-xl flex-shrink-0 mt-0.5 border ${
            isDanger
              ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs'
              : 'bg-amber-50 border-amber-200 text-amber-600 shadow-xs'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0 text-sm text-slate-600 leading-relaxed break-words [overflow-wrap:anywhere]">
          {message}
        </div>
      </div>
      <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-slate-100">
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
