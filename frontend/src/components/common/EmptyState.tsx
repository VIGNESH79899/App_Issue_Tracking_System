import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

export interface EmptyStateProps {
  title: string;
  description: string;
  why?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  why,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 text-center border border-dashed border-slate-200 rounded-xl bg-slate-50/50 my-4 max-w-lg mx-auto">
      <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-subtle text-slate-400 mb-3.5">
        {icon || <Inbox className="w-7 h-7 text-slate-400" />}
      </div>
      <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
      <p className="mt-1.5 text-xs text-slate-600 leading-relaxed max-w-sm">{description}</p>
      {why && (
        <div className="mt-2.5 px-3 py-1.5 bg-slate-100/70 border border-slate-200/60 rounded text-[11px] text-slate-500 max-w-sm">
          <span className="font-semibold text-slate-700">Context: </span>
          {why}
        </div>
      )}
      {(actionLabel || secondaryActionLabel) && (
        <div className="mt-5 flex items-center justify-center gap-2">
          {actionLabel && onAction && (
            <Button size="sm" onClick={onAction}>
              {actionLabel}
            </Button>
          )}
          {secondaryActionLabel && onSecondaryAction && (
            <Button size="sm" variant="outline" onClick={onSecondaryAction}>
              {secondaryActionLabel}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
