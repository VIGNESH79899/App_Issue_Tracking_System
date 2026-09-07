import React from 'react';
import { IncidentMetricsDTO } from '@app-issue-track/shared';
import { Activity, Clock, ShieldAlert, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react';

interface IncidentMetricsCardProps {
  metrics: IncidentMetricsDTO;
}

export const IncidentMetricsCard: React.FC<IncidentMetricsCardProps> = ({ metrics }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-subtle">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Active Incidents</span>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-extrabold font-mono text-rose-700">{metrics.activeCount}</span>
          <Activity className="w-4 h-4 text-rose-600" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-subtle">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SEV1 / SEV2</span>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-extrabold font-mono text-rose-800">
            {metrics.sev1Count} <span className="text-xs text-slate-400 font-normal">/ {metrics.sev2Count}</span>
          </span>
          <ShieldAlert className="w-4 h-4 text-rose-600" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-subtle">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">MTTA (Ack Time)</span>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-extrabold font-mono text-slate-900">
            {metrics.mttaHours !== null ? `${metrics.mttaHours}h` : 'N/A'}
          </span>
          <Clock className="w-4 h-4 text-brand-600" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-subtle">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">MTTR (Resolve Time)</span>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-extrabold font-mono text-slate-900">
            {metrics.mttrHours !== null ? `${metrics.mttrHours}h` : 'N/A'}
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-subtle">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">SLA Breaches</span>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-extrabold font-mono text-amber-700">{metrics.slaBreachedCount}</span>
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-1 shadow-subtle">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Recurrence Rate</span>
        <div className="flex items-baseline justify-between">
          <span className="text-xl font-extrabold font-mono text-slate-900">{metrics.recurrenceRate}%</span>
          <TrendingUp className="w-4 h-4 text-brand-600" />
        </div>
      </div>
    </div>
  );
};
