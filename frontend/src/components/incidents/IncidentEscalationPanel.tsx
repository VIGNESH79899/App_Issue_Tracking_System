import React from 'react';
import { IncidentEscalationDTO } from '@app-issue-track/shared';
import { AlertOctagon } from 'lucide-react';

interface IncidentEscalationPanelProps {
  escalations: IncidentEscalationDTO[];
}

export const IncidentEscalationPanel: React.FC<IncidentEscalationPanelProps> = ({ escalations }) => {
  if (escalations.length === 0) {
    return (
      <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 text-center text-xs text-emerald-800 font-medium">
        ✓ No active escalations for this incident. SLA thresholds operating within limits.
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-subtle">
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
        <AlertOctagon className="w-4 h-4 text-rose-600" />
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Active Incident Escalations ({escalations.length})
        </h3>
      </div>

      <div className="space-y-3">
        {escalations.map((item, idx) => (
          <div key={idx} className="bg-rose-50/60 border border-rose-200 rounded-lg p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-rose-900 font-mono">{item.trigger}</span>
              <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded bg-rose-600 text-white">
                {item.severity}
              </span>
            </div>

            <div className="bg-white/80 p-2 rounded border border-rose-100 font-mono text-[11px] text-slate-700 space-y-0.5">
              <span className="font-bold block text-[10px] text-rose-800 uppercase">Empirical Evidence:</span>
              {item.evidence.map((ev, eIdx) => (
                <div key={eIdx}>• {ev}</div>
              ))}
            </div>

            <div className="text-rose-900 font-semibold pt-1 border-t border-rose-200/60">
              💡 Action Required: {item.recommendedAction}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
