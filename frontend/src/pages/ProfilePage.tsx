import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { usersApi } from '../services/usersApi';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { User, Lock, Save, ShieldCheck, Mail } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();

  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('Validation Error', 'First name and last name are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await usersApi.updateUser(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });
      await refreshUser();
      toast.success('Profile Updated', 'Your name details have been saved successfully.');
    } catch (err: any) {
      const msg = err.message || err.response?.data?.error?.message || 'Failed to update profile.';
      toast.error('Update Failed', msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Profile</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your account profile details and view system permissions</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-6 space-y-6">
        {/* User Card Summary Header */}
        <div className="flex items-center space-x-4 pb-6 border-b border-slate-200">
          <div className="w-16 h-16 rounded-full bg-brand-100 text-brand-700 font-bold text-xl flex items-center justify-center border-2 border-brand-200 shadow-sm">
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {user?.firstName} {user?.lastName}
            </h2>
            <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center space-x-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{user?.email}</span>
              </span>
              <span className="bg-brand-50 border border-brand-200 text-brand-700 font-bold uppercase text-[10px] px-2 py-0.5 rounded">
                {user?.role}
              </span>
            </div>
          </div>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name *"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />

            <Input
              label="Last Name *"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>

          <div className="pt-2">
            <Input
              label="Email Address (Read-only)"
              value={user?.email || ''}
              disabled
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              System Role (Read-only)
            </label>
            <div className="relative">
              <div className="w-full text-xs font-bold font-mono bg-slate-100 border border-slate-300 text-slate-700 rounded-md py-2.5 px-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-brand-600" />
                  <span>{user?.role}</span>
                </div>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 flex items-center space-x-1">
              <Lock className="w-3 h-3 text-slate-400" />
              <span>System role is managed by administrators and team leads; it cannot be self-modified.</span>
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
            <Button type="submit" isLoading={isSubmitting} leftIcon={<Save className="w-4 h-4" />}>
              Save Profile Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
