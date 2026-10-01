import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import { UserRole } from '@app-issue-track/shared';
import {
  Terminal,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.REPORTER);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName) {
      toast.error('Validation Error', 'Please complete all required fields.');
      return;
    }

    if (password.length < 8) {
      toast.error('Validation Error', 'Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      await register({ firstName, lastName, email, password, role });
      toast.success('Registration Complete', 'Your account has been created successfully.');
      navigate('/');
    } catch (err: any) {
      const msg = err.message || err.response?.data?.error?.message || 'Failed to register user account.';
      toast.error('Registration Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-brand-500 selection:text-white relative overflow-hidden">
      {/* Background Architectural Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-2xl border border-slate-800/80 bg-[#111625]/90 backdrop-blur-xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* Left Column: Platform Overview */}
        <div className="lg:col-span-5 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between bg-gradient-to-br from-slate-900/90 via-[#0d1322]/80 to-[#0b0f19]">
          <div className="space-y-6">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-brand-500/20 border border-white/10">
                <Terminal className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  AITS <span className="text-xs font-mono font-medium px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-400 border border-brand-500/20">v1.0</span>
                </span>
                <span className="text-[11px] text-slate-400 block -mt-0.5 font-mono">Applications Issue Tracking System</span>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-2 pt-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Join the Engineering Operations Workspace
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Create a member account to participate in project issue tracking, incident triage, and collaborative post-mortems.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-2.5 pt-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>Deterministic project-scoped role permissions</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>Real-time issue status state machine</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>Automated SLA breach forecasting</span>
              </div>
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-4 h-4 text-brand-400 flex-shrink-0" />
                <span>Incident command center & war room</span>
              </div>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Enterprise RBAC
            </span>
            <span>Zero Data Leakage</span>
          </div>
        </div>

        {/* Right Column: Register Form */}
        <div className="lg:col-span-7 p-8 lg:p-10 flex flex-col justify-center bg-[#0e1320]">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Create an Account</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your details to register a new engineering account.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="Alex"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full h-10 px-3.5 text-sm bg-slate-900/90 border border-slate-700/80 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Vance"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full h-10 px-3.5 text-sm bg-slate-900/90 border border-slate-700/80 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="user@system.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-10 px-3.5 text-sm bg-slate-900/90 border border-slate-700/80 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="role" className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Workspace Role
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full h-10 px-3.5 text-sm bg-slate-900/90 border border-slate-700/80 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                >
                  <option value={UserRole.REPORTER}>Reporter / QA</option>
                  <option value={UserRole.DEVELOPER}>Developer</option>
                  <option value={UserRole.PROJECT_MANAGER}>Project Manager</option>
                  <option value={UserRole.ADMIN}>Admin</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-10 pl-3.5 pr-10 text-sm bg-slate-900/90 border border-slate-700/80 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-brand-600 hover:bg-brand-500 text-white font-medium text-sm rounded-lg shadow-md shadow-brand-600/25 transition-all mt-2"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create Account & Join
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors underline">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
