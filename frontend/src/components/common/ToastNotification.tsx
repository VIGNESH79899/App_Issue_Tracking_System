import React from 'react';
import { useToast } from '../../context/ToastContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const ToastNotificationContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 max-w-sm w-full px-4 pointer-events-none"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';
        const isWarning = toast.type === 'warning';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-4 rounded-lg shadow-lg border text-sm transition-all duration-200 transform translate-y-0 ${
              isSuccess
                ? 'bg-white border-emerald-200 text-slate-900'
                : isError
                ? 'bg-white border-rose-200 text-slate-900'
                : isWarning
                ? 'bg-white border-amber-200 text-slate-900'
                : 'bg-white border-blue-200 text-slate-900'
            }`}
          >
            <div className="flex-shrink-0 mr-3 mt-0.5">
              {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {isError && <AlertCircle className="w-5 h-5 text-rose-600" />}
              {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600" />}
              {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-brand-600" />}
            </div>
            <div className="flex-1 mr-2">
              <h4 className="font-semibold text-slate-900 leading-tight">{toast.title}</h4>
              {toast.message && <p className="mt-1 text-xs text-slate-600 leading-relaxed">{toast.message}</p>}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded focus:outline-none focus:ring-1 focus:ring-slate-400"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
