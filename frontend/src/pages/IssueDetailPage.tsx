import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { issuesApi } from '../services/issuesApi';
import { commentsApi } from '../services/commentsApi';
import { attachmentsApi } from '../services/attachmentsApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { intelligenceApi } from '../services/intelligenceApi';
import {
  IssueDTO,
  IssueStatus,
  IssuePriority,
  IssueSeverity,
  CommentDTO,
  AttachmentDTO,
  IssueHistoryDTO,
  UserRole,
  IssueIntelligence,
} from '@app-issue-track/shared';
import { StatusBadge } from '../components/common/StatusBadge';
import { PriorityBadge } from '../components/common/PriorityBadge';
import { SeverityBadge } from '../components/common/SeverityBadge';
import { Button } from '../components/common/Button';
import { StatusWorkflowControl } from '../components/issues/StatusWorkflowControl';
import { AssigneeSelectorModal } from '../components/issues/AssigneeSelectorModal';
import { CommentList } from '../components/issues/CommentList';
import { CommentComposer } from '../components/issues/CommentComposer';
import { AIInsightsPanel } from '../components/ai/AIInsightsPanel';
import { AITriagePanel } from '../components/ai-triage/AITriagePanel';
import { triageApi } from '../services/triageApi';
import { IssueTriageAnalysis } from '@app-issue-track/shared';
import { AttachmentList } from '../components/issues/AttachmentList';
import { HistoryTimeline } from '../components/issues/HistoryTimeline';
import { IssueIntelligencePanel } from '../components/issues/intelligence/IssueIntelligencePanel';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { ErrorState } from '../components/common/ErrorState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { incidentApi } from '../services/incidentApi';
import { ArrowLeft, User, UserPlus, Trash2, Calendar, MessageSquare, Paperclip, History, ShieldAlert } from 'lucide-react';

export const IssueDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  const [issue, setIssue] = useState<IssueDTO | null>(null);
  const [comments, setComments] = useState<CommentDTO[]>([]);
  const [attachments, setAttachments] = useState<AttachmentDTO[]>([]);
  const [history, setHistory] = useState<IssueHistoryDTO[]>([]);
  const [intelligence, setIntelligence] = useState<IssueIntelligence | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isIntelligenceLoading, setIsIntelligenceLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intelligenceError, setIntelligenceError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'comments' | 'attachments' | 'history'>('comments');
  const [assigneeModalOpen, setAssigneeModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [triageAnalysis, setTriageAnalysis] = useState<IssueTriageAnalysis | null>(null);

  const handleAcceptPriority = async (val: string) => {
    if (!issue) return;
    try {
      await issuesApi.updateIssue(issue.id, { priority: val as any });
      setIssue((current) => (current ? { ...current, priority: val as IssuePriority } : current));
      issuesApi.getIssueHistory(issue.id).then(setHistory).catch(() => undefined);
      toast.success('Priority Updated', `Set priority to ${val}. Recorded in issue audit history.`);
      return true;
    } catch (err: any) {
      toast.error('Update Failed', err.message || 'Failed to update priority');
      return false;
    }
  };

  const handleAcceptSeverity = async (val: string) => {
    if (!issue) return;
    try {
      await issuesApi.updateIssue(issue.id, { severity: val as any });
      setIssue((current) => (current ? { ...current, severity: val as IssueSeverity } : current));
      issuesApi.getIssueHistory(issue.id).then(setHistory).catch(() => undefined);
      toast.success('Severity Updated', `Set severity to ${val}. Recorded in issue audit history.`);
      return true;
    } catch (err: any) {
      toast.error('Update Failed', err.message || 'Failed to update severity');
      return false;
    }
  };

  const handleAcceptComponent = async (val: string) => {
    if (!issue) return;
    try {
      await issuesApi.updateIssue(issue.id, { moduleComponent: val });
      setIssue((current) => (current ? { ...current, moduleComponent: val } : current));
      issuesApi.getIssueHistory(issue.id).then(setHistory).catch(() => undefined);
      toast.success('Component Updated', `Set component to ${val}. Recorded in issue audit history.`);
      return true;
    } catch (err: any) {
      toast.error('Update Failed', err.message || 'Failed to update component');
      return false;
    }
  };

  const loadIntelligence = useCallback(async (issueId: string) => {
    setIsIntelligenceLoading(true);
    setIntelligenceError(null);
    try {
      const data = await intelligenceApi.getIssueIntelligence(issueId);
      setIntelligence(data);
    } catch (err: any) {
      setIntelligenceError(err.response?.data?.error?.message || err.message || 'Failed to load intelligence');
    } finally {
      setIsIntelligenceLoading(false);
    }
  }, []);

  const loadIssueDetails = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const issueData = await issuesApi.getIssueById(id);
      setIssue(issueData);

      // Load comments, attachments, history concurrently
      const [comms, atts, hist] = await Promise.all([
        commentsApi.getCommentsByIssue(issueData.id),
        attachmentsApi.getAttachmentsByIssue(issueData.id),
        issuesApi.getIssueHistory(issueData.id),
      ]);

      setComments(comms);
      setAttachments(atts);
      setHistory(hist);

      // Load intelligence and triage
      loadIntelligence(issueData.id);
      triageApi.triageIssue(issueData.id).then(setTriageAnalysis).catch(() => setTriageAnalysis(null));
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load issue details');
    } finally {
      setIsLoading(false);
    }
  }, [id, loadIntelligence]);

  useEffect(() => {
    loadIssueDetails();
  }, [loadIssueDetails]);

  const handleStatusChange = async (newStatus: IssueStatus, resolution?: string) => {
    if (!issue) return;
    try {
      const updated = await issuesApi.changeStatus(issue.id, newStatus, resolution);
      setIssue(updated);
      toast.success('Status Updated', `Issue status changed to ${newStatus}.`);

      // Refresh history & intelligence
      const hist = await issuesApi.getIssueHistory(issue.id);
      setHistory(hist);
      loadIntelligence(issue.id);
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || 'Status transition rejected';
      toast.error('Transition Rejected', msg);
      throw err;
    }
  };

  const handleAssignUser = async (userId: string | null) => {
    if (!issue) return;
    try {
      const updated = await issuesApi.assignIssue(issue.id, userId);
      setIssue(updated);
      toast.success('Assignee Updated', userId ? 'Developer assigned successfully.' : 'Issue unassigned.');

      const hist = await issuesApi.getIssueHistory(issue.id);
      setHistory(hist);
      loadIntelligence(issue.id);
    } catch (err: any) {
      toast.error('Assignment Failed', err.response?.data?.error?.message || 'Failed to update assignee.');
    }
  };

  const handlePostComment = async (content: string, isInternal: boolean) => {
    if (!issue) return;
    try {
      const newComment = await commentsApi.createComment(issue.id, { content, isInternal });
      setComments((prev) => [newComment, ...prev]);
      toast.success('Comment Posted');

      const hist = await issuesApi.getIssueHistory(issue.id);
      setHistory(hist);
    } catch (err: any) {
      toast.error('Failed to post comment', err.response?.data?.error?.message);
    }
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    try {
      const updated = await commentsApi.updateComment(commentId, content);
      setComments((prev) => prev.map((c) => (c.id === commentId ? updated : c)));
      toast.success('Comment updated');
    } catch {
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await commentsApi.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const handleUploadAttachment = async (file: File) => {
    if (!issue) return;
    try {
      const created = await attachmentsApi.uploadAttachment(issue.id, file);
      setAttachments((prev) => [created, ...prev]);
      toast.success('Attachment Uploaded', created.originalName);

      const hist = await issuesApi.getIssueHistory(issue.id);
      setHistory(hist);
    } catch (err: any) {
      toast.error('Upload Failed', err.response?.data?.error?.message || 'Failed to upload attachment');
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    try {
      await attachmentsApi.deleteAttachment(attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
      toast.success('Attachment deleted');
    } catch {
      toast.error('Failed to delete attachment');
    }
  };

  const handleDeleteIssue = async () => {
    if (!issue) return;
    setIsDeleting(true);
    try {
      await issuesApi.deleteIssue(issue.id);
      toast.success('Issue Deleted');
      navigate('/issues');
    } catch (err: any) {
      toast.error('Failed to delete issue', err.response?.data?.error?.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <SkeletonLoader rows={5} height="h-20" />;
  }

  if (error || !issue) {
    return <ErrorState message={error || 'Issue not found'} onRetry={loadIssueDetails} />;
  }

  const canDeleteIssue = user?.role === UserRole.ADMIN || user?.role === UserRole.PROJECT_MANAGER;
  const canAssign = user?.role === UserRole.ADMIN || user?.role === UserRole.PROJECT_MANAGER;

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/issues')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <span className="font-mono text-sm font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded border border-brand-200">
            {issue.issueKey}
          </span>
          <h1 className="text-xl font-bold text-slate-900 leading-tight">{issue.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          <PriorityBadge priority={issue.priority} size="md" />
          <SeverityBadge severity={issue.severity} size="md" />
          <StatusBadge status={issue.status} size="md" />
        </div>
      </div>

      {/* Flagship Issue Action Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-subtle flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {canAssign && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAssigneeModalOpen(true)}
              leftIcon={<UserPlus className="w-3.5 h-3.5 text-brand-600" />}
            >
              {issue.assignee ? 'Reassign Developer' : 'Assign Developer'}
            </Button>
          )}

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-[11px] text-slate-500 font-medium">Priority:</span>
            <select
              value={issue.priority}
              onChange={(e) => handleAcceptPriority(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer text-xs"
              aria-label="Change issue priority"
            >
              {Object.values(IssuePriority).map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs">
            <span className="text-[11px] text-slate-500 font-medium">Severity:</span>
            <select
              value={issue.severity}
              onChange={(e) => handleAcceptSeverity(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none cursor-pointer text-xs"
              aria-label="Change issue severity"
            >
              {Object.values(IssueSeverity).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('comments')}
            leftIcon={<MessageSquare className="w-3.5 h-3.5 text-slate-500" />}
          >
            Comment ({comments.length})
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab('attachments')}
            leftIcon={<Paperclip className="w-3.5 h-3.5 text-slate-500" />}
          >
            Attach ({attachments.length})
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {canDeleteIssue && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  const inc = await incidentApi.escalateIssue(issue.id);
                  toast.success('Escalated to Incident', `Created ${inc.incidentKey}`);
                  navigate(`/incidents/${inc.id}`);
                } catch (err: any) {
                  toast.error('Escalation Failed', err.response?.data?.error?.message || err.message);
                }
              }}
              leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-rose-600" />}
            >
              Escalate to Incident
            </Button>
          )}

          {canDeleteIssue && (
            <Button variant="danger" size="sm" onClick={() => setDeleteConfirmOpen(true)} leftIcon={<Trash2 className="w-3.5 h-3.5" />}>
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Workflow Controls Bar */}
          <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Lifecycle Status</span>
              <StatusBadge status={issue.status} />
            </div>

            <StatusWorkflowControl currentStatus={issue.status} onChangeStatus={handleStatusChange} />
          </div>

          {/* Issue Summary & Technical Spec Card */}
          <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-subtle space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Issue Description</h3>
            <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{issue.description}</p>

            {(issue.stepsToReproduce || issue.expectedResult || issue.actualResult) && (
              <div className="pt-4 border-t border-slate-100 space-y-3">
                {issue.stepsToReproduce && (
                  <div>
                    <span className="font-semibold text-slate-700 block">Steps to Reproduce:</span>
                    <p className="text-slate-600 font-mono text-[11px] mt-1 bg-slate-50 p-2.5 rounded border border-slate-200">
                      {issue.stepsToReproduce}
                    </p>
                  </div>
                )}
                {issue.expectedResult && (
                  <div>
                    <span className="font-semibold text-slate-700 block">Expected Result:</span>
                    <p className="text-slate-600 mt-0.5">{issue.expectedResult}</p>
                  </div>
                )}
                {issue.actualResult && (
                  <div>
                    <span className="font-semibold text-slate-700 block">Actual Result:</span>
                    <p className="text-rose-600 font-medium mt-0.5">{issue.actualResult}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Discussion / Attachments / History Tabs */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-subtle overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-bold text-slate-600">
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 border-b-2 transition-colors ${
                  activeTab === 'comments' ? 'border-brand-600 text-brand-600 bg-white' : 'border-transparent hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Comments ({comments.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('attachments')}
                className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 border-b-2 transition-colors ${
                  activeTab === 'attachments' ? 'border-brand-600 text-brand-600 bg-white' : 'border-transparent hover:text-slate-900'
                }`}
              >
                <Paperclip className="w-4 h-4" />
                <span>Attachments ({attachments.length})</span>
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 px-4 flex items-center justify-center space-x-2 border-b-2 transition-colors ${
                  activeTab === 'history' ? 'border-brand-600 text-brand-600 bg-white' : 'border-transparent hover:text-slate-900'
                }`}
              >
                <History className="w-4 h-4" />
                <span>Issue Timeline & Traceability ({history.length})</span>
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'comments' && (
                <div className="space-y-6">
                  <CommentComposer onPostComment={handlePostComment} />
                  <CommentList comments={comments} onUpdateComment={handleUpdateComment} onDeleteComment={handleDeleteComment} />
                </div>
              )}

              {activeTab === 'attachments' && (
                <AttachmentList attachments={attachments} onUpload={handleUploadAttachment} onDelete={handleDeleteAttachment} />
              )}

              {activeTab === 'history' && <HistoryTimeline history={history} />}
            </div>
          </div>
        </div>

        {/* Right Sidebar Metadata & Intelligence Column */}
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-subtle space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Issue Metadata
            </h3>

            <div>
              <span className="text-slate-500 block">Assignee</span>
              <div className="flex items-center justify-between mt-1">
                {issue.assignee ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 font-bold text-[10px] flex items-center justify-center">
                      {issue.assignee.firstName?.[0]}
                    </div>
                    <span className="font-semibold text-slate-900">
                      {issue.assignee.firstName} {issue.assignee.lastName}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-400 italic">Unassigned</span>
                )}
                {canAssign && (
                  <Button variant="ghost" size="sm" onClick={() => setAssigneeModalOpen(true)} leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
                    Change
                  </Button>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-500 block">Reporter</span>
              <div className="flex items-center space-x-2 mt-1">
                <div className="w-6 h-6 rounded-full bg-slate-200 font-bold text-[10px] flex items-center justify-center">
                  {issue.reporter?.firstName?.[0]}
                </div>
                <span className="font-semibold text-slate-900">
                  {issue.reporter?.firstName} {issue.reporter?.lastName}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
              <div>
                <span className="text-slate-500 block">Priority</span>
                <div className="mt-1"><PriorityBadge priority={issue.priority} /></div>
              </div>
              <div>
                <span className="text-slate-500 block">Severity</span>
                <div className="mt-1"><SeverityBadge severity={issue.severity} /></div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div>
                <span className="text-slate-500 block">Application</span>
                <span className="font-semibold text-slate-900 block mt-0.5">{issue.applicationName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Project</span>
                <span className="font-semibold text-slate-900 block mt-0.5">{issue.projectName || 'N/A'}</span>
              </div>
              {issue.moduleComponent && (
                <div>
                  <span className="text-slate-500 block">Component</span>
                  <span className="font-mono text-slate-900 block mt-0.5">{issue.moduleComponent}</span>
                </div>
              )}
              {issue.environment && (
                <div>
                  <span className="text-slate-500 block">Environment</span>
                  <span className="font-mono text-slate-700 block mt-0.5">{issue.environment}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center justify-between">
                <span>Created:</span>
                <span>{new Date(issue.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Updated:</span>
                <span>{new Date(issue.updatedAt).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* AI Engineering Triage Panel */}
          {triageAnalysis && (
            <AITriagePanel
              analysis={triageAnalysis}
              onAcceptPriority={handleAcceptPriority}
              onAcceptSeverity={handleAcceptSeverity}
              onAcceptComponent={handleAcceptComponent}
              acceptedPriority={issue.priority === triageAnalysis.suggestedPriority.value}
              acceptedSeverity={issue.severity === triageAnalysis.suggestedSeverity.value}
              acceptedComponent={issue.moduleComponent === triageAnalysis.suggestedComponent.value}
              onViewIssue={(targetId) => navigate(`/issues/${targetId}`)}
            />
          )}

          {/* AI Issue Intelligence Panel */}
          <AIInsightsPanel issueId={issue.id} />

          {/* Issue Intelligence Engine Panel */}
          <IssueIntelligencePanel
            intelligence={intelligence}
            isLoading={isIntelligenceLoading}
            error={intelligenceError}
          />
        </div>
      </div>

      {/* Assignee Modal */}
      <AssigneeSelectorModal
        isOpen={assigneeModalOpen}
        onClose={() => setAssigneeModalOpen(false)}
        issueId={issue.id}
        currentAssigneeId={issue.assigneeId}
        onAssign={handleAssignUser}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={handleDeleteIssue}
        title="Delete Issue"
        message="Are you sure you want to delete this issue? This action cannot be undone."
        confirmText="Delete Issue"
        isDanger
        isLoading={isDeleting}
      />
    </div>
  );
};
