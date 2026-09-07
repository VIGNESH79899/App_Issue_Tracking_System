import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ShieldCheck, LogIn } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Validation Error', 'Please fill in both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email, password });
      toast.success('Welcome back', 'Successfully authenticated.');
      navigate('/');
    } catch (err: any) {
      const msg = err.message || err.response?.data?.error?.message || 'Invalid email or password credentials.';
      toast.error('Authentication Failed', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl border border-slate-200 p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-brand-600 rounded-xl text-white flex items-center justify-center font-bold text-xl mx-auto shadow-md">
            AI
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Applications Issue Track</h1>
          <p className="text-xs text-slate-500 font-medium">Enterprise SaaS Issue Management Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="admin@system.local"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <Button
            type="submit"
            className="w-full h-10"
            isLoading={isLoading}
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            Sign In to Account
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:underline">
            Register new account
          </Link>
        </div>
      </div>
    </div>
  );
};
