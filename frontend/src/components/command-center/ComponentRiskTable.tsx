import { ComponentRiskSummary } from '@app-issue-track/shared';
import { Layers } from 'lucide-react';

interface ComponentRiskTableProps {
  components: ComponentRiskSummary[];
}

export const ComponentRiskTable: React.FC<ComponentRiskTableProps> = ({ components }) => {
  const getBadgeColor = (level: ComponentRiskSummary['riskLevel']) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-brand-600" />
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Module / Component Risk Intelligence</h3>
        </div>
        <span className="text-xs text-slate-500 font-mono">{components.length} Components</span>
      </div>

      {components.length === 0 ? (
        <p className="text-xs text-slate-500 italic text-center py-4">No component risk data recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">Module Component</th>
                <th className="py-2.5 px-3">Risk Level</th>
                <th className="py-2.5 px-3 text-center">Active</th>
                <th className="py-2.5 px-3 text-center">Critical</th>
                <th className="py-2.5 px-3 text-center">SLA Breaches</th>
                <th className="py-2.5 px-3 text-center">Quality Score</th>
                <th className="py-2.5 px-3 text-center">7d Growth</th>
                <th className="py-2.5 px-3">Why? / Reasons</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {components.map((comp, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60">
                  <td className="py-2.5 px-3 font-mono font-bold text-brand-700">{comp.component}</td>
                  <td className="py-2.5 px-3">
                    <span className={`border font-mono text-[10px] font-bold px-2 py-0.5 rounded ${getBadgeColor(comp.riskLevel)}`}>
                      {comp.riskLevel} ({comp.riskScore})
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center font-mono font-bold">{comp.activeIssues}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-rose-700 font-bold">{comp.criticalIssues}</td>
                  <td className="py-2.5 px-3 text-center font-mono text-rose-700">{comp.slaBreaches}</td>
                  <td className="py-2.5 px-3 text-center font-mono">{comp.averageQualityScore}/100</td>
                  <td className="py-2.5 px-3 text-center font-mono">+{comp.recentGrowthPercentage}%</td>
                  <td className="py-2.5 px-3 text-[11px] text-slate-600 max-w-xs truncate">
                    {comp.reasons.join('; ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
