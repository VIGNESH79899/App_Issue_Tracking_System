import React from 'react';
import { EngineeringBottleneck } from '@app-issue-track/shared';
import { AlertOctagon, ShieldAlert } from 'lucide-react';

interface EngineeringBottlenecksProps {
  bottlenecks: EngineeringBottleneck[];
}

export const EngineeringBottlenecks: React.FC<EngineeringBottlenecksProps> = ({ bottlenecks }) => {
  if (!bottlenecks || bottlenecks.length === 0) {
    return (
      <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 text-center text-xs text-emerald-800 font-medium">
        ✓ No operational engineering bottlenecks detected. All project indicators operating cleanly.
      </div>
    );
  }

  const getSeverityStyle = (severity: EngineeringBottleneck['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-50 border-rose-200 text-rose-900';
      case 'HIGH':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-900';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
        <AlertOctagon className="w-4 h-4 text-rose-600" />
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Operational Engineering Bottlenecks ({bottlenecks.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {bottlenecks.map((item, idx) => (
          <div key={idx} className={`border rounded-lg p-3.5 space-y-2 shadow-subtle ${getSeverityStyle(item.severity)}`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">{item.title}</span>
              <span className="font-mono text-[10px] font-extrabold border px-2 py-0.5 rounded bg-white/80">
                {item.severity}
              </span>
            </div>

            <p className="text-[11px] leading-relaxed opacity-90">{item.description}</p>

            {item.evidence && item.evidence.length > 0 && (
              <div className="text-[10px] font-mono bg-white/60 p-2 rounded border border-black/5 space-y-0.5">
                <span className="font-bold block uppercase tracking-wider text-[9px] opacity-75">Empirical Evidence:</span>
                {item.evidence.map((ev, eIdx) => (
                  <div key={eIdx}>• {ev}</div>
                ))}
              </div>
            )}

            <div className="text-[11px] font-semibold pt-1 border-t border-black/5">
              💡 Action: {item.recommendedAction}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
