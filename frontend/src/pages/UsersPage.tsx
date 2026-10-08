import React, { useEffect, useState } from 'react';
import { usersApi } from '../services/usersApi';
import { projectsApi } from '../services/projectsApi';
import { teamApi } from '../services/teamApi';
import { UserDTO, UserRole, ProjectDTO } from '@app-issue-track/shared';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { SkeletonLoader } from '../components/common/SkeletonLoader';
import { ErrorState } from '../components/common/ErrorState';
import { UserCheck, UserX, FolderPlus, AlertCircle, Trash2, Search, Filter, Shield } from 'lucide-react';

const MAX_PROJECTS_PER_USER = 2;

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<UserDTO[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assign to project modal state
  const [assignUser, setAssignUser] = useState<UserDTO | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [roleInProject, setRoleInProject] = useState<UserRole>(UserRole.DEVELOPER);
  const [isAssigning, setIsAssigning] = useState(false);

  // Delete user state
  const [deleteUserObj, setDeleteUserObj] = useState<UserDTO | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [accountTypeFilter, setAccountTypeFilter] = useState<'ALL' | 'OPERATIONAL' | 'TEST_FIXTURE'>('ALL');

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [userData, projData] = await Promise.all([
        usersApi.getUsers(),
        projectsApi.getProjects().catch(() => []),
      ]);
      setUsers(userData);
      setProjects(projData);
      if (projData.length > 0) setSelectedProjectId(projData[0].id);
    } catch (err: any) {
      setError(err.message || err.response?.data?.error?.message || 'Failed to fetch user directory');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openProjectManager = (user: UserDTO) => {
    setAssignUser(user);
    const assignedProjectIds = new Set(user.projectMemberships?.map((membership) => membership.projectId) || []);
    setSelectedProjectId(projects.find((project) => !assignedProjectIds.has(project.id))?.id || '');
    setRoleInProject(UserRole.DEVELOPER);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      const updated = await usersApi.changeUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      toast.success('User Role Updated', `${updated.firstName}'s role changed to ${newRole}.`);
    } catch (err: any) {
      const msg = err.message || err.response?.data?.error?.message || 'Role change failed';
      toast.error('Role Change Failed', msg);
    }
  };

  const handleToggleStatus = async (userId: string, currentActive: boolean) => {
    try {
      const updated = await usersApi.toggleUserStatus(userId, !currentActive);
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      toast.success('Account Status Changed', `${updated.firstName} is now ${!currentActive ? 'Active' : 'Inactive'}.`);
    } catch (err: any) {
      const msg = err.message || err.response?.data?.error?.message || 'Status change failed';
      toast.error('Status Change Failed', msg);
    }
  };

  const handleAssignToProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignUser || !selectedProjectId) return;

    if (!assignUser.isActive) {
      toast.error('Assignment Failed', 'User account is inactive. Please activate the user first.');
      return;
    }

    if ((assignUser.projectCount ?? 0) >= MAX_PROJECTS_PER_USER) {
      toast.error('Assignment Limit Reached', 'A user can be assigned to a maximum of two projects.');
      return;
    }

    setIsAssigning(true);
    try {
      await teamApi.addProjectMember(selectedProjectId, assignUser.id, roleInProject);
      const proj = projects.find((p) => p.id === selectedProjectId);
      toast.success('User Assigned to Project', `${assignUser.firstName} added to ${proj?.name || 'Project'}.`);
      const membership = {
        projectId: selectedProjectId,
        projectName: proj?.name || 'Project',
        projectKey: proj?.key || '',
        roleInProject,
      };
      const updatedUser = {
        ...assignUser,
        projectCount: Math.min(MAX_PROJECTS_PER_USER, (assignUser.projectCount ?? 0) + 1),
        projectMemberships: [...(assignUser.projectMemberships || []), membership],
      };
      setAssignUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === assignUser.id ? updatedUser : u)));
      const assignedProjectIds = new Set(updatedUser.projectMemberships.map((item) => item.projectId));
      setSelectedProjectId(projects.find((project) => !assignedProjectIds.has(project.id))?.id || '');
    } catch (err: any) {
      const msg = err.message || err.response?.data?.error?.message || 'Assignment failed';
      toast.error('Assignment Failed', msg);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemoveFromProject = async (projectId: string) => {
    if (!assignUser) return;

    setIsAssigning(true);
    try {
      await teamApi.removeProjectMember(projectId, assignUser.id);
      const removedProject = assignUser.projectMemberships?.find((membership) => membership.projectId === projectId);
      const updatedUser = {
        ...assignUser,
        projectCount: Math.max(0, (assignUser.projectCount ?? 0) - 1),
        projectMemberships: (assignUser.projectMemberships || []).filter((membership) => membership.projectId !== projectId),
      };
      setAssignUser(updatedUser);
      setUsers((prev) => prev.map((u) => (u.id === assignUser.id ? updatedUser : u)));
      setSelectedProjectId(projectId);
      toast.success('Project Assignment Removed', assignUser.firstName + ' was removed from ' + (removedProject?.projectName || 'the project') + '.');
    } catch (err: any) {
      const msg = err.message || err.response?.data?.error?.message || 'Unable to remove the project assignment';
      toast.error('Removal Failed', msg);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserObj) return;
    setIsDeleting(true);
    try {
      await usersApi.deleteUser(deleteUserObj.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserObj.id));
      toast.success('User Deleted', `${deleteUserObj.firstName} ${deleteUserObj.lastName} has been deleted.`);
      setDeleteUserObj(null);
    } catch (err: any) {
      const msg = err.message || err.response?.data?.error?.message || 'Delete failed';
      toast.error('Delete Failed', msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const isTestFixtureUser = (email: string) => {
    const lower = email.toLowerCase();
    return (
      lower.startsWith('testuser_') ||
      lower.startsWith('sec_user_') ||
      lower.startsWith('unassigned_') ||
      lower.includes('@test.com') ||
      lower.includes('@example.com')
    );
  };

  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase();
    const fullName = `${u.firstName} ${u.lastName}`.toLowerCase();
    const matchesSearch = !query || fullName.includes(query) || u.email.toLowerCase().includes(query);
    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    const matchesStatus =
      selectedStatusFilter === 'ALL' ||
      (selectedStatusFilter === 'ACTIVE' && u.isActive) ||
      (selectedStatusFilter === 'INACTIVE' && !u.isActive);

    const isFixture = isTestFixtureUser(u.email);
    const matchesType =
      accountTypeFilter === 'ALL' ||
      (accountTypeFilter === 'OPERATIONAL' && !isFixture) ||
      (accountTypeFilter === 'TEST_FIXTURE' && isFixture);

    return matchesSearch && matchesRole && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management Directory</h1>
          <p className="text-xs text-slate-500 mt-1">Manage user roles, project memberships, account activation, and user deletion</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
            {filteredUsers.length} of {users.length} Users
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-subtle flex flex-col md:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={accountTypeFilter}
            onChange={(e) => setAccountTypeFilter(e.target.value as any)}
            className="text-xs border border-slate-300 rounded-md py-1.5 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">All Account Types</option>
            <option value="OPERATIONAL">Operational / Core</option>
            <option value="TEST_FIXTURE">Test Fixtures</option>
          </select>

          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-md py-1.5 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">All Roles</option>
            {Object.values(UserRole).map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-md py-1.5 px-2.5 bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <SkeletonLoader rows={5} height="h-16" />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : filteredUsers.length === 0 ? (
        <div className="p-8 text-center text-xs text-slate-500 bg-white rounded-lg border border-slate-200">
          No users match the selected filters.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 shadow-subtle overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Account Type</th>
                  <th className="py-3 px-4">System Role</th>
                  <th className="py-3 px-4">Projects</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="w-[260px] min-w-[260px] py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  const isFixture = isTestFixtureUser(u.email);
                  const projectCount = u.projectCount ?? 0;
                  const hasReachedProjectLimit = projectCount >= MAX_PROJECTS_PER_USER;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center space-x-2">
                          <div className={`w-7 h-7 rounded-full font-bold text-[10px] flex items-center justify-center ${isFixture ? 'bg-slate-100 text-slate-500' : 'bg-brand-100 text-brand-700'}`}>
                            {u.firstName?.[0]}
                            {u.lastName?.[0]}
                          </div>
                          <span>
                            {u.firstName} {u.lastName} {isSelf && <span className="text-[10px] text-brand-600 font-mono">(You)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono">{u.email}</td>
                      <td className="py-3 px-4">
                        {isFixture ? (
                          <span className="inline-flex items-center font-mono text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                            TEST FIXTURE
                          </span>
                        ) : (
                          <span className="inline-flex items-center font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                            OPERATIONAL
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="w-36">
                          <Select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                            options={Object.values(UserRole).map((r) => ({ value: r, label: r }))}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center font-mono text-[11px] font-bold px-2 py-0.5 rounded border ${
                            hasReachedProjectLimit
                              ? 'text-amber-700 bg-amber-50 border-amber-200'
                              : 'text-slate-700 bg-slate-50 border-slate-200'
                          }`}
                        >
                          {projectCount} / {MAX_PROJECTS_PER_USER}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            <UserCheck className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            <UserX className="w-3 h-3" />
                            <span>Inactive</span>
                          </span>
                        )}
                      </td>
                      <td className="w-[260px] min-w-[260px] py-3 px-4">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openProjectManager(u)}
                            leftIcon={<FolderPlus className="w-3 h-3 text-brand-600" />}
                            disabled={!u.isActive}
                            title={
                              !u.isActive
                                ? 'Activate account before assigning to a project'
                                : 'Add, remove, or replace this user\'s project assignments'
                            }
                            className="whitespace-nowrap"
                          >
                            Manage Projects
                          </Button>
                          <button
                            onClick={() => handleToggleStatus(u.id, u.isActive)}
                            className={`h-8 whitespace-nowrap rounded-md border px-3 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 ${
                              u.isActive
                                ? 'border-amber-200 text-amber-600 hover:bg-amber-50'
                                : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                            }`}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          {!isSelf && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setDeleteUserObj(u)}
                              leftIcon={<Trash2 className="w-3 h-3 text-rose-600" />}
                              className="whitespace-nowrap border-rose-200 text-rose-600 hover:bg-rose-50"
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assign User to Project Modal */}
      <Modal
        isOpen={!!assignUser}
        onClose={() => setAssignUser(null)}
        title={`Manage Projects — ${assignUser?.firstName} ${assignUser?.lastName}`}
      >
        <form onSubmit={handleAssignToProject} className="space-y-4 pt-2">
          {!assignUser?.isActive && (
            <div className="bg-rose-50 border border-rose-200 rounded-md p-3 text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>This account is currently inactive. Activate the user account before assigning to a project.</span>
            </div>
          )}

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Current projects</span>
              <span className="font-mono text-[11px] font-bold text-slate-600">
                {assignUser?.projectCount ?? 0} / {MAX_PROJECTS_PER_USER}
              </span>
            </div>
            {assignUser?.projectMemberships?.length ? (
              <div className="space-y-2">
                {assignUser.projectMemberships.map((membership) => (
                  <div key={membership.projectId} className="flex items-center justify-between gap-3 rounded border border-slate-200 bg-white px-2.5 py-2 text-xs">
                    <div>
                      <span className="font-semibold text-slate-900">{membership.projectName}</span>
                      <span className="ml-1.5 font-mono text-slate-500">({membership.projectKey})</span>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      isLoading={isAssigning}
                      onClick={() => handleRemoveFromProject(membership.projectId)}
                      className="h-7 border-rose-200 px-2 text-rose-600 hover:bg-rose-50"
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500">No project assignments yet.</p>
            )}
          </div>

          {(assignUser?.projectCount ?? 0) >= MAX_PROJECTS_PER_USER && (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              This user already has two projects. Remove one above before adding a replacement.
            </div>
          )}

          <Select
            label="Target Project *"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            options={[
              { label: 'Select a project...', value: '' },
              ...projects
                .filter((project) => !assignUser?.projectMemberships?.some((membership) => membership.projectId === project.id))
                .map((project) => ({ label: `${project.name} (${project.key})`, value: project.id })),
            ]}
          />

          <Select
            label="Project Role *"
            value={roleInProject}
            onChange={(e) => setRoleInProject(e.target.value as UserRole)}
            options={[
              { label: 'Developer', value: UserRole.DEVELOPER },
              { label: 'Reporter', value: UserRole.REPORTER },
              { label: 'Project Manager', value: UserRole.PROJECT_MANAGER },
            ]}
          />

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200">
            <Button type="button" variant="outline" onClick={() => setAssignUser(null)}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isAssigning} disabled={!assignUser?.isActive || !selectedProjectId}>
              Add Project
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete User Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteUserObj}
        onClose={() => setDeleteUserObj(null)}
        onConfirm={handleDeleteUser}
        title="Delete User Account"
        message={
          deleteUserObj ? (
            <div className="space-y-2.5">
              <p className="text-slate-700">
                Are you sure you want to permanently delete{' '}
                <span className="font-semibold text-slate-900">
                  {deleteUserObj.firstName} {deleteUserObj.lastName}
                </span>
                ?
              </p>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-md font-mono text-xs text-slate-700 break-all select-all">
                {deleteUserObj.email}
              </div>
              <p className="text-xs text-slate-500">
                This will remove all project memberships and unassign any active issues. This action cannot be undone.
              </p>
            </div>
          ) : null
        }
        confirmText="Delete User"
        isDanger={true}
        isLoading={isDeleting}
      />
    </div>
  );
};
