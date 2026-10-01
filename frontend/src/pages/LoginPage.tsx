import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/common/Button';
import {
  Layers,
  ShieldCheck,
  Activity,
  ArrowRight,
  Eye,
  EyeOff,
  Terminal,
  Zap,
  Lock,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Validation Error', 'Please enter your email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success('Authenticated', 'Welcome back to the engineering console.');
      navigate('/');
    } catch (err: any) {
      const msg = err.message || err.response?.data?.error?.message || 'Invalid email or password credentials.';
      toast.error('Authentication Failed', msg);
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
        {/* Left Column: Platform Branding & Highlights */}
        <div className="lg:col-span-6 p-8 lg:p-10 border-b lg:border-b-0 lg:border-r border-slate-800/80 flex flex-col justify-between bg-gradient-to-br from-slate-900/90 via-[#0d1322]/80 to-[#0b0f19]">
          <div className="space-y-6">
            {/* Logo and System Status */}
            <div className="flex items-center justify-between">
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
              <div className="flex items-center space-x-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Operational</span>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-2 pt-2">
              <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white">
                Enterprise Engineering & Issue Operations Console
              </h2>
              <p className="text-xs lg:text-sm text-slate-400 leading-relaxed">
                Streamline incident response, automated bug triage, and project delivery risk with deterministically scoped workflows.
              </p>
            </div>

            {/* Core Pillars */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800/60 hover:border-slate-700/60 transition-colors">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0 mt-0.5">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Incident Command & War Room</div>
                  <div className="text-[11px] text-slate-400 leading-normal">
                    15-second real-time telemetry, stage progression gates, and automated post-incident audits.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800/60 hover:border-slate-700/60 transition-colors">
                <div className="p-2 rounded-lg bg-brand-500/10 text-brand-400 border border-brand-500/20 flex-shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Strict RBAC & Scoped Scoping</div>
                  <div className="text-[11px] text-slate-400 leading-normal">
                    Strict boundary isolation preventing horizontal privilege escalation across projects.
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-800/30 border border-slate-800/60 hover:border-slate-700/60 transition-colors">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex-shrink-0 mt-0.5">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-200">Engineering Telemetry & Forecasting</div>
                  <div className="text-[11px] text-slate-400 leading-normal">
                    SLA breach forecasts, capacity workload balance, and verified fact-grounded advisory insights.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Left Footer Badges */}
          <div className="pt-6 mt-6 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span className="flex items-center gap-1">
              <Lock className="w-3 h-3 text-slate-400" /> AES-256 / SHA-256 JWT
            </span>
            <span>REST API / PostgreSQL 16</span>
          </div>
        </div>

        {/* Right Column: Sign In Form */}
        <div className="lg:col-span-6 p-8 lg:p-10 flex flex-col justify-center bg-[#0e1320]">
          <div className="max-w-md w-full mx-auto space-y-6">
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">Sign In to Console</h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter your credentials to access the engineering console.
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  placeholder="admin@system.local"
                  required
                  className="w-full h-10 px-3.5 text-sm bg-slate-900/90 border border-slate-700/80 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 font-mono">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                    }}
                    placeholder="••••••••••••"
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
                Authenticate & Access Console
              </Button>
            </form>

            <div className="pt-4 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                Need a new workspace account?{' '}
                <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 transition-colors underline">
                  Register Account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

