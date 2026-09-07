import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '@app-issue-track/shared';
import { Button } from '../common/Button';
import { Send, Lock } from 'lucide-react';

export interface CommentComposerProps {
  onPostComment: (content: string, isInternal: boolean) => Promise<void>;
  isLoading?: boolean;
}

export const CommentComposer: React.FC<CommentComposerProps> = ({
  onPostComment,
  isLoading = false,
}) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const canPostInternal = user?.role !== UserRole.REPORTER;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      await onPostComment(content, isInternal);
      setContent('');
      setIsInternal(false);
    } catch {
      // Handled by parent Toast
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 border border-slate-200 rounded-lg shadow-subtle space-y-3">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Add a comment or technical note..."
        rows={3}
        className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-md text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:bg-white transition-all"
      />

      <div className="flex items-center justify-between">
        {canPostInternal ? (
          <label className="inline-flex items-center space-x-2 text-xs text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="inline-flex items-center space-x-1 font-medium">
              <Lock className="w-3 h-3 text-amber-600" />
              <span>Make internal note (visible to team only)</span>
            </span>
          </label>
        ) : (
          <div />
        )}

        <Button
          type="submit"
          size="sm"
          disabled={!content.trim()}
          isLoading={isLoading}
          leftIcon={<Send className="w-3.5 h-3.5" />}
        >
          Post Comment
        </Button>
      </div>
    </form>
  );
};
