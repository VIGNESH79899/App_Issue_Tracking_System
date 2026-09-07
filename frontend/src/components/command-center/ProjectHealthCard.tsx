import React from 'react';
import { ProjectHealthScore } from '@app-issue-track/shared';
import { ShieldAlert, CheckCircle2, AlertTriangle, HelpCircle } from 'lucide-react';

interface ProjectHealthCardProps {
  health: ProjectHealthScore;
}

export const ProjectHealthCard: React.FC<ProjectHealthCardProps> = ({ health }) => {
  const { score, level, reasons } = health;

  let levelColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  let Icon = CheckCircle2;

  if (level === 'CRITICAL') {
    levelColor = 'bg-rose-50 text-rose-800 border-rose-200';
    Icon = ShieldAlert;
  } else if (level === 'AT_RISK') {
    levelColor = 'bg-amber-50 text-amber-800 border-amber-200';
    Icon = AlertTriangle;
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-brand-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Project Health Engine</h3>
        </div>
        <div className={`border font-mono font-extrabold text-xs px-2.5 py-1 rounded flex items-center space-x-1.5 ${levelColor}`}>
          <span className="text-base">{score}</span>
          <span className="text-[10px] opacity-75">/ 100 ({level})</span>
        </div>
      </div>

      {/* Explainability Section ("Why?") */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 space-y-2">
        <div className="flex items-center space-x-1.5 text-slate-700 text-xs font-bold">
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
          <span>Why is health rated {level}?</span>
        </div>
        <ul className="space-y-1 text-xs text-slate-600 pl-1">
          {reasons.map((r, idx) => (
            <li key={idx} className="flex items-start space-x-2">
              <span className="text-slate-400">•</span>
              <span>{r}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
