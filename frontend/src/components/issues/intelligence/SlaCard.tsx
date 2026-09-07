import React from 'react';
import { SlaMetrics, SlaStatus } from '@app-issue-track/shared';
import { Clock, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';

interface SlaCardProps {
  sla: SlaMetrics | undefined;
}

export const SlaCard: React.FC<SlaCardProps> = ({ sla }) => {
  if (!sla) return null;

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (status: SlaStatus) => {
    switch (status) {
      case SlaStatus.ON_TRACK:
        return (
          <span className="inline-flex items-center space-x-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
            <CheckCircle className="w-3 h-3" />
            <span>On Track</span>
          </span>
        );
      case SlaStatus.AT_RISK:
        return (
          <span className="inline-flex items-center space-x-1 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
            <AlertTriangle className="w-3 h-3" />
            <span>At Risk</span>
          </span>
        );
      case SlaStatus.BREACHED:
        return (
          <span className="inline-flex items-center space-x-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
            <ShieldAlert className="w-3 h-3" />
            <span>SLA Breached</span>
          </span>
        );
      case SlaStatus.COMPLETED_SLA_MET:
        return (
          <span className="inline-flex items-center space-x-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
            <CheckCircle className="w-3 h-3" />
            <span>Completed (SLA Met)</span>
          </span>
        );
      case SlaStatus.COMPLETED_SLA_BREACHED:
        return (
          <span className="inline-flex items-center space-x-1 bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
            <ShieldAlert className="w-3 h-3" />
            <span>Completed (SLA Breached)</span>
          </span>
        );
      default:
        return null;
    }
  };

  const getProgressBarColor = (status: SlaStatus) => {
    switch (status) {
      case SlaStatus.ON_TRACK:
        return 'bg-emerald-500';
      case SlaStatus.AT_RISK:
        return 'bg-amber-500';
      case SlaStatus.BREACHED:
      case SlaStatus.COMPLETED_SLA_BREACHED:
        return 'bg-rose-500';
      default:
        return 'bg-brand-500';
    }
  };

  const formattedDeadline = formatDate(sla.resolutionDeadline);
  const remainingHours = sla.resolutionRemainingHours;
  const isRemainingPositive = remainingHours > 0;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-subtle space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-slate-500" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">SLA Intelligence</h4>
        </div>
        {getStatusBadge(sla.resolutionStatus)}
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">Resolution Deadline:</span>
          <span className="font-bold text-slate-800 font-mono">{formattedDeadline}</span>
        </div>

        <div className="flex items-center justify-between text-xs pt-1">
          <span className="text-slate-500 font-medium">Remaining Time:</span>
          <span className={`font-bold font-mono ${isRemainingPositive ? 'text-slate-900' : 'text-rose-600'}`}>
            {isRemainingPositive ? `${remainingHours}h remaining` : `${Math.abs(remainingHours)}h overdue`}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1 pt-1">
        <div className="flex justify-between text-[10px] text-slate-500 font-medium">
          <span>SLA Consumption</span>
          <span>{sla.resolutionPercentage}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full transition-all duration-300 ${getProgressBarColor(sla.resolutionStatus)}`}
            style={{ width: `${Math.min(100, sla.resolutionPercentage)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
