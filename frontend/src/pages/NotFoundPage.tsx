import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
      <h1 className="text-6xl font-bold font-mono text-slate-900 tracking-tight">404</h1>
      <h2 className="text-xl font-bold text-slate-800">Page Not Found</h2>
      <p className="text-xs text-slate-500 max-w-sm">
        The page or resource you are looking for does not exist or has been relocated.
      </p>
      <div className="pt-2">
        <Button onClick={() => navigate('/')} leftIcon={<Home className="w-4 h-4" />}>
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};
