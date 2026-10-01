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

    setIsAssigning(true);
    try {
      await teamApi.addProjectMember(selectedProjectId, assignUser.id, roleInProject);
      const proj = projects.find((p) => p.id === selectedProjectId);
      toast.success('User Assigned to Project', `${assignUser.firstName} added to ${proj?.name || 'Project'}.`);
      setAssignUser(null);
    } catch (err: any) {
      const msg = err.message || err.response?.data?.error?.message || 'Assignment failed';
      toast.error('Assignment Failed', msg);
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
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  const isFixture = isTestFixtureUser(u.email);
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
                      <td className="py-3 px-4 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setAssignUser(u)}
                          leftIcon={<FolderPlus className="w-3 h-3 text-brand-600" />}
                          disabled={!u.isActive}
                          title={!u.isActive ? 'Activate account before assigning to a project' : ''}
                        >
                          Assign
                        </Button>
                        <button
                          onClick={() => handleToggleStatus(u.id, u.isActive)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded transition-colors ${
                            u.isActive
                              ? 'text-amber-600 hover:bg-amber-50 border border-amber-200'
                              : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
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
                            className="text-rose-600 border-rose-200 hover:bg-rose-50"
                          >
                            Delete
                          </Button>
                        )}
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
        title={`Assign ${assignUser?.firstName} ${assignUser?.lastName} to Project`}
      >
        <form onSubmit={handleAssignToProject} className="space-y-4 pt-2">
          {!assignUser?.isActive && (
            <div className="bg-rose-50 border border-rose-200 rounded-md p-3 text-xs text-rose-700 flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>This account is currently inactive. Activate the user account before assigning to a project.</span>
            </div>
          )}

          <Select
            label="Target Project *"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            options={projects.map((p) => ({ label: `${p.name} (${p.key})`, value: p.id }))}
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
            <Button type="submit" isLoading={isAssigning} disabled={!assignUser?.isActive}>
              Confirm Assignment
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
