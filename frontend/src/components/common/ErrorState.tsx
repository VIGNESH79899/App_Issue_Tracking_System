import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Service Request Unsuccessful',
  message,
  onRetry,
}) => {
  // Sanitize message to avoid leaking raw Axios internals or stack traces
  let sanitized = message;
  if (
    message.includes('Network Error') ||
    message.includes('ECONNREFUSED') ||
    message.includes('failed to fetch') ||
    message.includes('timeout')
  ) {
    sanitized = 'Unable to communicate with the engineering service. Please verify your connection or retry shortly.';
  } else if (message.includes('403') || message.includes('Forbidden')) {
    sanitized = 'You do not have administrative authorization to access this workspace resource.';
  } else if (message.includes('401') || message.includes('Unauthorized')) {
    sanitized = 'Your session has expired. Please refresh the page or sign in again.';
  }

  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center p-8 text-center border border-rose-200 rounded-xl bg-rose-50/40 my-4 max-w-md mx-auto"
    >
      <div className="p-2.5 bg-white border border-rose-200 rounded-xl text-rose-600 mb-3 shadow-subtle">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
      <p className="mt-1.5 text-xs text-slate-600 leading-relaxed max-w-sm">{sanitized}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry Request
          </Button>
        </div>
      )}
    </div>
  );
};

export default ErrorState;
