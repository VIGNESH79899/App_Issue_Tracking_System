import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ProjectDTO,
  IncidentDTO,
  IncidentMetricsDTO,
  IncidentSeverity,
  IncidentStatus,
} from '@app-issue-track/shared';
import { projectsApi } from '../services/projectsApi';
import { incidentApi } from '../services/incidentApi';
import { useToast } from '../context/ToastContext';
import { IncidentFilters } from '../components/incidents/IncidentFilters';
import { IncidentMetricsCard } from '../components/incidents/IncidentMetricsCard';
import { IncidentStatusBadge } from '../components/incidents/IncidentStatusBadge';
import { IncidentSeverityBadge } from '../components/incidents/IncidentSeverityBadge';
import { IncidentSkeleton } from '../components/incidents/IncidentSkeleton';
import { IncidentEmptyState } from '../components/incidents/IncidentEmptyState';
import { Button } from '../components/common/Button';
import { ExternalLink, ShieldAlert, Clock } from 'lucide-react';

export const IncidentCommandCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedSeverity, setSelectedSeverity] = useState<IncidentSeverity | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<IncidentStatus | undefined>(undefined);
  const [isLoadingMeta, setIsLoadingMeta] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [incidents, setIncidents] = useState<IncidentDTO[]>([]);
  const [metrics, setMetrics] = useState<IncidentMetricsDTO | null>(null);

  // Load project metadata
  useEffect(() => {
    async function loadProjects() {
      try {
        const projs = await projectsApi.getProjects();
        setProjects(projs);
        if (projs.length > 0) {
          setSelectedProjectId(projs[0].id);
        }
      } catch {
        toast.error('Failed to load project metadata');
      } finally {
        setIsLoadingMeta(false);
      }
    }
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchData = useCallback(async () => {
    if (!selectedProjectId) return;
    setIsRefreshing(true);
    try {
      const [incList, met] = await Promise.all([
        incidentApi.getIncidents({
          projectId: selectedProjectId,
          severity: selectedSeverity,
          status: selectedStatus,
        }),
        incidentApi.getMetrics(selectedProjectId),
      ]);
      setIncidents(incList);
      setMetrics(met);
    } catch {
      toast.error('Failed to fetch incident metrics');
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedProjectId, selectedSeverity, selectedStatus, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Safe Polling every 15 seconds for active operational refresh
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden && selectedProjectId) {
        fetchData();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchData, selectedProjectId]);

  if (isLoadingMeta) return <IncidentSkeleton />;
  if (projects.length === 0) return <IncidentEmptyState />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Filter Bar */}
      <IncidentFilters
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        selectedSeverity={selectedSeverity}
        onSelectSeverity={setSelectedSeverity}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        onRefresh={fetchData}
        isRefreshing={isRefreshing}
      />

      {/* KPI Metrics Card */}
      {metrics && <IncidentMetricsCard metrics={metrics} />}

      {/* Main Incidents Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Active Project Incidents ({incidents.length})
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">Live 15s Polling Operational Refresh</span>
        </div>

        {incidents.length === 0 ? (
          <p className="text-xs text-slate-500 italic text-center py-6">
            Zero incidents matching selected filters in project workspace.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-2.5 px-3">Incident Key</th>
                  <th className="py-2.5 px-3">Title</th>
                  <th className="py-2.5 px-3 text-center">Severity</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3">Component</th>
                  <th className="py-2.5 px-3">Owner</th>
                  <th className="py-2.5 px-3 text-center">Detected</th>
                  <th className="py-2.5 px-3 text-right">War Room Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {incidents.map((inc) => (
                  <tr key={inc.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-rose-700">{inc.incidentKey}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900 max-w-xs truncate">{inc.title}</td>
                    <td className="py-2.5 px-3 text-center">
                      <IncidentSeverityBadge severity={inc.severity} />
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <IncidentStatusBadge status={inc.status} />
                    </td>
                    <td className="py-2.5 px-3 font-mono">{inc.moduleComponent || 'General'}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-700">{inc.ownerName || 'Unassigned'}</td>
                    <td className="py-2.5 px-3 text-center font-mono text-[11px] text-slate-500">
                      {new Date(inc.detectedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => navigate(`/incidents/${inc.id}`)}
                        leftIcon={<ExternalLink className="w-3 h-3" />}
                      >
                        Enter War Room
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
