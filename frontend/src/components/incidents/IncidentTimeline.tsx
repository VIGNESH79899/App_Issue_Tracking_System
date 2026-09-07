import React from 'react';
import { IncidentTimelineDTO } from '@app-issue-track/shared';
import { Clock, User } from 'lucide-react';

interface IncidentTimelineProps {
  timeline: IncidentTimelineDTO[];
}

export const IncidentTimeline: React.FC<IncidentTimelineProps> = ({ timeline }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
      <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
        <Clock className="w-4 h-4 text-brand-600" />
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Chronological Incident Timeline</h3>
      </div>

      {timeline.length === 0 ? (
        <p className="text-xs text-slate-500 italic text-center py-4">No timeline events recorded.</p>
      ) : (
        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
          {timeline.map((t) => (
            <div key={t.id} className="relative space-y-1">
              <div className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-brand-600 ring-4 ring-white" />
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1.5 font-bold text-slate-900">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{t.actorName}</span>
                </div>
                <span className="font-mono text-[10px] text-slate-500">
                  {new Date(t.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              <div className="text-xs text-slate-700 font-medium">
                <span className="font-mono font-bold text-brand-700">{t.action}</span>
                {t.oldState && t.newState && (
                  <span className="text-slate-500 font-mono text-[11px] ml-2">
                    ({t.oldState} → {t.newState})
                  </span>
                )}
              </div>

              {t.metadata && <p className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded border">{t.metadata}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
