import React, { useEffect, useState } from 'react';
import { applicationsApi } from '../services/applicationsApi';
import { ApplicationDTO, UserRole } from '@app-issue-track/shared';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { AccessLockedCard } from '../components/common/AccessLockedCard';
import { Boxes, Plus, Edit2, Trash2 } from 'lucide-react';

export const ApplicationsPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editApp, setEditApp] = useState<ApplicationDTO | null>(null);
  const [deleteAppId, setDeleteAppId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManage = user?.role === UserRole.ADMIN || user?.role === UserRole.PROJECT_MANAGER;

  const loadApplications = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await applicationsApi.getApplications();
      setApplications(data);
    } catch (err: any) {
      setError(err.message || err.response?.data?.error?.message || 'Failed to load applications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) return;
    setIsSubmitting(true);
    try {
      const created = await applicationsApi.createApplication({ name, code: code.toUpperCase(), description, version: '1.0.0' });
      setApplications((prev) => [created, ...prev]);
      toast.success('Application Created', created.name);
      setCreateModalOpen(false);
      setName('');
      setCode('');
      setDescription('');
    } catch (err: any) {
      toast.error('Creation Failed', err.message || err.response?.data?.error?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editApp || !name.trim() || !code.trim()) return;
    setIsSubmitting(true);
    try {
      const updated = await applicationsApi.updateApplication(editApp.id, { name, code: code.toUpperCase(), description });
      setApplications((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      toast.success('Application Updated', updated.name);
      setEditApp(null);
    } catch (err: any) {
      toast.error('Update Failed', err.message || err.response?.data?.error?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteAppId) return;
    setIsSubmitting(true);
    try {
      await applicationsApi.deleteApplication(deleteAppId);
      setApplications((prev) => prev.filter((a) => a.id !== deleteAppId));
      toast.success('Application Deleted');
      setDeleteAppId(null);
    } catch (err: any) {
      toast.error('Deletion Failed', err.message || err.response?.data?.error?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (app: ApplicationDTO) => {
    setEditApp(app);
    setName(app.name);
    setCode(app.code);
    setDescription(app.description || '');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Software Applications</h1>
          <p className="text-xs text-slate-500 mt-1">Manage system applications, tracking codes, and module components</p>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setCreateModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Register Application
          </Button>
        )}
      </div>

      {isLoading ? (
        <SkeletonLoader rows={4} height="h-20" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadApplications} />
      ) : applications.length === 0 ? (
        canManage ? (
          <EmptyState
            title="No applications created"
            description="Get started by registering software applications for issue tracking."
            actionLabel="Register Application"
            onAction={() => setCreateModalOpen(true)}
            icon={<Boxes className="w-8 h-8" />}
          />
        ) : (
          <AccessLockedCard featureName="Applications" />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applications.map((app) => (
            <div key={app.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-subtle flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {app.code}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base truncate">{app.name}</h3>
                  </div>
                  {canManage && (
                    <div className="flex items-center space-x-1">
                      <button onClick={() => openEditModal(app)} className="p-1 text-slate-400 hover:text-slate-700 rounded">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => setDeleteAppId(app.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{app.description || 'No description provided.'}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Version: <span className="font-mono text-slate-700">{app.version}</span></span>
                <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 uppercase">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Register New Application">
        <form onSubmit={handleCreate} className="space-y-4 pt-2">
          <Input label="Application Name *" placeholder="e.g. Core Payment Gateway" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="System Code *" placeholder="e.g. PAY-GW" value={code} onChange={(e) => setCode(e.target.value)} required />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Description</label>
            <textarea rows={3} placeholder="Application details..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full text-xs rounded-md border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Register</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={!!editApp} onClose={() => setEditApp(null)} title="Edit Application">
        <form onSubmit={handleUpdate} className="space-y-4 pt-2">
          <Input label="Application Name *" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="System Code *" value={code} onChange={(e) => setCode(e.target.value)} required />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Description</label>
            <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} className="w-full text-xs rounded-md border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setEditApp(null)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Save Changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteAppId}
        onClose={() => setDeleteAppId(null)}
        onConfirm={handleDelete}
        title="Delete Application"
        message="Are you sure you want to delete this application? All associated projects and issues will be deleted permanently."
        confirmText="Delete Application"
        isDanger
        isLoading={isSubmitting}
      />
    </div>
  );
};
