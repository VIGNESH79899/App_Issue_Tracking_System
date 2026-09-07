import React, { useEffect, useState } from 'react';
import { projectsApi } from '../services/projectsApi';
import { applicationsApi } from '../services/applicationsApi';
import { usersApi } from '../services/usersApi';
import { ProjectDTO, ApplicationDTO, UserDTO, ProjectMemberDTO, UserRole } from '@app-issue-track/shared';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorState } from '../components/common/ErrorState';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { AccessLockedCard } from '../components/common/AccessLockedCard';
import { FolderGit2, Plus, Users, Trash2, UserPlus, UserX } from 'lucide-react';

export const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [applications, setApplications] = useState<ApplicationDTO[]>([]);
  const [allUsers, setAllUsers] = useState<UserDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [membersModalProject, setMembersModalProject] = useState<ProjectDTO | null>(null);
  const [projectMembers, setProjectMembers] = useState<ProjectMemberDTO[]>([]);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [addUserId, setAddUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canManage = user?.role === UserRole.ADMIN || user?.role === UserRole.PROJECT_MANAGER;

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [projs, apps, users] = await Promise.all([
        projectsApi.getProjects(),
        applicationsApi.getApplications(),
        canManage ? usersApi.getUsers().catch(() => []) : Promise.resolve([]),
      ]);
      setProjects(projs);
      setApplications(apps);
      setAllUsers(users.filter((u) => u.isActive));
      if (apps.length > 0) setApplicationId(apps[0].id);
    } catch (err: any) {
      setError(err.message || err.response?.data?.error?.message || 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim() || !applicationId) return;
    setIsSubmitting(true);
    try {
      const created = await projectsApi.createProject({ name, key: key.toUpperCase(), description, applicationId });
      setProjects((prev) => [created, ...prev]);
      toast.success('Project Created', `${created.name} (${created.key})`);
      setCreateModalOpen(false);
      setName('');
      setKey('');
      setDescription('');
    } catch (err: any) {
      toast.error('Creation Failed', err.message || err.response?.data?.error?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!deleteProjectId) return;
    setIsSubmitting(true);
    try {
      await projectsApi.deleteProject(deleteProjectId);
      setProjects((prev) => prev.filter((p) => p.id !== deleteProjectId));
      toast.success('Project Deleted');
      setDeleteProjectId(null);
    } catch (err: any) {
      toast.error('Deletion Failed', err.message || err.response?.data?.error?.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenMembersModal = async (project: ProjectDTO) => {
    setMembersModalProject(project);
    try {
      const members = await projectsApi.getProjectMembers(project.id);
      setProjectMembers(members);
    } catch {
      toast.error('Failed to load project team members');
    }
  };

  const handleAddMember = async () => {
    if (!membersModalProject || !addUserId) return;
    try {
      const newMember = await projectsApi.addProjectMember(membersModalProject.id, addUserId);
      setProjectMembers((prev) => [...prev, newMember]);
      toast.success('Member Added');
      setAddUserId('');
    } catch (err: any) {
      toast.error('Failed to add member', err.message || err.response?.data?.error?.message);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!membersModalProject) return;
    try {
      await projectsApi.removeProjectMember(membersModalProject.id, userId);
      setProjectMembers((prev) => prev.filter((m) => m.userId !== userId));
      toast.success('Member Removed');
    } catch (err: any) {
      toast.error('Failed to remove member', err.message || err.response?.data?.error?.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Software Projects</h1>
          <p className="text-xs text-slate-500 mt-1">Manage project keys, team members, and associated applications</p>
        </div>
        {canManage && (
          <Button size="sm" onClick={() => setCreateModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Create Project
          </Button>
        )}
      </div>

      {isLoading ? (
        <SkeletonLoader rows={4} height="h-20" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : projects.length === 0 ? (
        canManage ? (
          <EmptyState
            title="No projects created"
            description="Create your first software project and assign key identifiers."
            actionLabel="Create Project"
            onAction={() => setCreateModalOpen(true)}
            icon={<FolderGit2 className="w-8 h-8" />}
          />
        ) : (
          <AccessLockedCard featureName="Projects" />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((proj) => (
            <div key={proj.id} className="bg-white p-5 rounded-lg border border-slate-200 shadow-subtle flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      {proj.key}
                    </span>
                    <h3 className="font-bold text-slate-900 text-base truncate">{proj.name}</h3>
                  </div>
                  {canManage && (
                    <button onClick={() => setDeleteProjectId(proj.id)} className="p-1 text-slate-400 hover:text-rose-600 rounded">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-600 mt-2 line-clamp-2">{proj.description || 'No project description.'}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">App: <span className="font-semibold text-slate-700">{proj.applicationName || 'Default'}</span></span>
                <Button variant="outline" size="sm" onClick={() => handleOpenMembersModal(proj)} leftIcon={<Users className="w-3 h-3" />}>
                  Team Members
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Project Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Create New Project">
        <form onSubmit={handleCreateProject} className="space-y-4 pt-2">
          <Select
            label="Target Application *"
            value={applicationId}
            onChange={(e) => setApplicationId(e.target.value)}
            options={applications.map((a) => ({ label: `${a.name} (${a.code})`, value: a.id }))}
          />
          <Input label="Project Name *" placeholder="e.g. Mobile Checkout SDK" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Project Key *" placeholder="e.g. SDK" value={key} onChange={(e) => setKey(e.target.value.toUpperCase())} maxLength={6} required />
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Description</label>
            <textarea rows={3} placeholder="Project scope..." value={description} onChange={(e) => setDescription(e.target.value)} className="w-full text-xs rounded-md border border-slate-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-brand-500" />
          </div>
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting}>Create Project</Button>
          </div>
        </form>
      </Modal>

      {/* Project Team Members Modal */}
      <Modal isOpen={!!membersModalProject} onClose={() => setMembersModalProject(null)} title={`Team Members — ${membersModalProject?.name}`}>
        <div className="space-y-4 pt-2">
          {canManage && (
            <div className="flex items-center space-x-2 pb-4 border-b border-slate-200">
              <div className="flex-1">
                <Select
                  value={addUserId}
                  onChange={(e) => setAddUserId(e.target.value)}
                  options={[
                    { label: 'Select user to add...', value: '' },
                    ...allUsers
                      .filter((u) => !projectMembers.some((pm) => pm.userId === u.id))
                      .map((u) => ({ label: `${u.firstName} ${u.lastName} (${u.email})`, value: u.id })),
                  ]}
                />
              </div>
              <Button size="sm" onClick={handleAddMember} disabled={!addUserId} leftIcon={<UserPlus className="w-3.5 h-3.5" />}>
                Add
              </Button>
            </div>
          )}

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {projectMembers.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No team members assigned to this project yet.</p>
            ) : (
              projectMembers.map((pm) => (
                <div key={pm.id} className="flex items-center justify-between p-2.5 bg-slate-50 rounded border border-slate-200 text-xs">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 font-bold flex items-center justify-center text-[10px]">
                      {pm.user?.firstName?.[0]}
                    </div>
                    <div>
                      <span className="font-semibold text-slate-900 block">{pm.user?.firstName} {pm.user?.lastName}</span>
                      <span className="text-[10px] text-slate-500 block">{pm.user?.email}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                      {pm.roleInProject}
                    </span>
                    {canManage && (
                      <button onClick={() => handleRemoveMember(pm.userId)} className="p-1 text-slate-400 hover:text-rose-600 rounded">
                        <UserX className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Delete Project Dialog */}
      <ConfirmDialog
        isOpen={!!deleteProjectId}
        onClose={() => setDeleteProjectId(null)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? All associated issues and history logs will be removed."
        confirmText="Delete Project"
        isDanger
        isLoading={isSubmitting}
      />
    </div>
  );
};
