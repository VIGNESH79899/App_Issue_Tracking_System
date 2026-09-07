import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IncidentDTO,
  IncidentTimelineDTO,
  IncidentEscalationDTO,
  IncidentRecurrenceDTO,
  IssueDTO,
  PostIncidentAnalysisDTO,
  IncidentStatus,
  IncidentSeverity,
} from '@app-issue-track/shared';
import { incidentApi } from '../services/incidentApi';
import { postIncidentApi } from '../services/postIncidentApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { IncidentStatusBadge } from '../components/incidents/IncidentStatusBadge';
import { IncidentSeverityBadge } from '../components/incidents/IncidentSeverityBadge';
import { IncidentTimeline } from '../components/incidents/IncidentTimeline';
import { IncidentEscalationPanel } from '../components/incidents/IncidentEscalationPanel';
import { IncidentActionBar } from '../components/incidents/IncidentActionBar';
import { PostIncidentAnalysis } from '../components/incidents/PostIncidentAnalysis';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { Button } from '../components/common/Button';
import { ShieldAlert, Clock, Layers, Sparkles, ExternalLink, Activity } from 'lucide-react';

export const IncidentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [incident, setIncident] = useState<IncidentDTO | null>(null);
  const [timeline, setTimeline] = useState<IncidentTimelineDTO[]>([]);
  const [escalations, setEscalations] = useState<IncidentEscalationDTO[]>([]);
  const [recurrence, setRecurrence] = useState<IncidentRecurrenceDTO | null>(null);
  const [relatedIssues, setRelatedIssues] = useState<IssueDTO[]>([]);
  const [analysis, setAnalysis] = useState<PostIncidentAnalysisDTO | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const fetchIncidentDetails = useCallback(async () => {
    if (!id) return;
    try {
      const [inc, tl, esc, rec, rel] = await Promise.all([
        incidentApi.getIncidentById(id),
        incidentApi.getTimeline(id),
        incidentApi.getEscalations(id),
        incidentApi.getRecurrence(id),
        incidentApi.getRelatedIssues(id),
      ]);
      setIncident(inc);
      setTimeline(tl);
      setEscalations(esc);
      setRecurrence(rec);
      setRelatedIssues(rel);
    } catch (err: any) {
      toast.error('Failed to load incident details', err.message);
    } finally {
      setIsLoading(false);
    }
  }, [id, toast]);

  useEffect(() => {
    fetchIncidentDetails();
  }, [fetchIncidentDetails]);

  const handleAcknowledge = async () => {
    if (!id) return;
    setIsActionLoading(true);
    try {
      const updated = await incidentApi.acknowledgeIncident(id);
      setIncident(updated);
      toast.success('Incident Acknowledged');
      fetchIncidentDetails();
    } catch (err: any) {
      toast.error('Failed to acknowledge incident', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleTransition = async (status: IncidentStatus) => {
    if (!id) return;
    setIsActionLoading(true);
    try {
      const updated = await incidentApi.transitionStatus(id, status);
      setIncident(updated);
      toast.success(`Incident Status Changed to ${status}`);
      fetchIncidentDetails();
    } catch (err: any) {
      toast.error('Failed to change status', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!id) return;
    setIsActionLoading(true);
    try {
      const updated = await incidentApi.resolveIncident(id, 'Incident mitigated and operational status restored.');
      setIncident(updated);
      toast.success('Incident Resolved');
      fetchIncidentDetails();
    } catch (err: any) {
      toast.error('Failed to resolve incident', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleClose = async () => {
    if (!id) return;
    setIsActionLoading(true);
    try {
      const updated = await incidentApi.closeIncident(id);
      setIncident(updated);
      toast.success('Incident Closed');
      fetchIncidentDetails();
    } catch (err: any) {
      toast.error('Failed to close incident', err.message);
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleGenerateAiAnalysis = async () => {
    if (!id) return;
    setIsAiLoading(true);
    try {
      const res = await postIncidentApi.getAnalysis(id);
      setAnalysis(res);
      toast.success('AI Post-Incident Analysis Generated');
    } catch (err: any) {
      toast.error('Failed to generate AI analysis', err.message);
    } finally {
      setIsAiLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <SkeletonLoader height="h-20" />
        <SkeletonLoader height="h-64" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center py-12 text-slate-500">
        Incident record not found or inaccessible.
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Header War Room Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-subtle">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center border border-rose-200 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-extrabold text-rose-700 text-sm">{incident.incidentKey}</span>
                <IncidentSeverityBadge severity={incident.severity} />
                <IncidentStatusBadge status={incident.status} />
              </div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight mt-0.5">{incident.title}</h1>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleGenerateAiAnalysis}
              isLoading={isAiLoading}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-600" />}
            >
              Generate AI Review
            </Button>
          </div>
        </div>

        {/* State-aware Action Bar */}
        <IncidentActionBar
          incident={incident}
          currentUserRole={user?.role}
          onAcknowledge={handleAcknowledge}
          onTransitionStatus={handleTransition}
          onResolve={handleResolve}
          onClose={handleClose}
          isLoading={isActionLoading}
        />
      </div>

      {/* Main War Room Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Overview & Impact */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-subtle">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
              Incident Context & Impact
            </h3>

            <div className="text-xs space-y-2">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase">Impact Summary</span>
                <p className="font-medium text-slate-900 bg-slate-50 p-2.5 rounded border border-slate-200 mt-1">
                  {incident.impactSummary || 'Operational degradation reported.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 text-slate-700">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Project</span>
                  <span className="font-bold">{incident.projectName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Application</span>
                  <span className="font-bold">{incident.applicationName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Component</span>
                  <span className="font-mono font-bold text-brand-700">{incident.moduleComponent || 'General'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Source Issue</span>
                  {incident.sourceIssueKey ? (
                    <button
                      onClick={() => navigate(`/issues/${incident.sourceIssueId}`)}
                      className="font-mono font-bold text-brand-600 hover:underline flex items-center space-x-1"
                    >
                      <span>{incident.sourceIssueKey}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-slate-400">Direct Incident</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recurrence Intelligence */}
          {recurrence && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 shadow-subtle">
              <div className="flex items-center space-x-2 border-b border-slate-100 pb-2">
                <Layers className="w-4 h-4 text-brand-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Component Recurrence Intelligence
                </h3>
              </div>
              <div className="text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Prior Incidents:</span>
                  <span className="font-mono font-bold text-slate-900">{recurrence.recurrenceCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">Recurrence Risk:</span>
                  <span className="font-mono font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border">
                    {recurrence.recurrenceRisk}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded border">
                  {recurrence.explanation}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CENTER COLUMN: Timeline & Active Escalations */}
        <div className="space-y-6 lg:col-span-2">
          <IncidentEscalationPanel escalations={escalations} />
          <IncidentTimeline timeline={timeline} />
        </div>
      </div>

      {/* BOTTOM SECTION: AI Post-Incident Analysis (Post-Mortem) */}
      <PostIncidentAnalysis analysis={analysis} isLoading={isAiLoading} />
    </div>
  );
};
