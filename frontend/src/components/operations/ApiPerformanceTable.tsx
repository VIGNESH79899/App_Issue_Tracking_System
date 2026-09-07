import React from 'react';
import type { EndpointStat } from '../../services/operationsApi';

interface Props {
  stats: EndpointStat[];
}

function latencyColor(ms: number): string {
  if (ms >= 1000) return 'text-red-600';
  if (ms >= 500) return 'text-yellow-600';
  return 'text-green-600';
}

export const ApiPerformanceTable: React.FC<Props> = ({ stats }) => {
  const sorted = [...stats].sort((a, b) => b.requests - a.requests).slice(0, 15);

  if (sorted.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">API Performance</h3>
        <p className="text-sm text-gray-500">No request data yet. Traffic will appear after requests are made.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">API Performance</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="pb-2 font-medium">Endpoint</th>
              <th className="pb-2 font-medium text-right">Reqs</th>
              <th className="pb-2 font-medium text-right">Errors</th>
              <th className="pb-2 font-medium text-right">Avg</th>
              <th className="pb-2 font-medium text-right">P95</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {sorted.map((ep) => (
              <tr key={ep.route} className="hover:bg-gray-50 transition-colors">
                <td className="py-2 font-mono text-gray-700 max-w-[280px] truncate">{ep.route}</td>
                <td className="py-2 text-right text-gray-900">{ep.requests.toLocaleString()}</td>
                <td className={`py-2 text-right font-medium ${ep.errors > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {ep.errors}
                </td>
                <td className={`py-2 text-right font-medium ${latencyColor(ep.averageMs)}`}>
                  {ep.averageMs}ms
                </td>
                <td className={`py-2 text-right font-medium ${latencyColor(ep.p95Ms)}`}>
                  {ep.p95Ms}ms
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
