import React, { useState } from 'react';
import { CommentDTO, UserRole } from '@app-issue-track/shared';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { MessageSquare, Lock, Trash2, Edit2 } from 'lucide-react';

export interface CommentListProps {
  comments: CommentDTO[];
  onUpdateComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

export const CommentList: React.FC<CommentListProps> = ({
  comments,
  onUpdateComment,
  onDeleteComment,
}) => {
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleStartEdit = (comment: CommentDTO) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleSaveEdit = async (commentId: string) => {
    if (!editContent.trim()) return;
    setIsSaving(true);
    try {
      await onUpdateComment(commentId, editContent);
      setEditingId(null);
    } catch {
      // Ignore
    } finally {
      setIsSaving(false);
    }
  };

  if (comments.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200 rounded-md">
        No comments posted yet. Be the first to start the discussion.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const isAuthor = user?.id === comment.authorId;
        const isAdmin = user?.role === UserRole.ADMIN;
        const canDelete = isAuthor || isAdmin;
        const canEdit = isAuthor;
        const isEditing = editingId === comment.id;

        return (
          <div
            key={comment.id}
            className={`p-4 rounded-lg border text-sm transition-colors ${
              comment.isInternal ? 'bg-amber-50/50 border-amber-200' : 'bg-white border-slate-200 shadow-subtle'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center justify-center">
                  {comment.author?.firstName?.[0] || 'U'}
                </div>
                <span className="font-semibold text-slate-900 text-xs">
                  {comment.author?.firstName} {comment.author?.lastName}
                </span>
                <span className="text-[10px] text-slate-400">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
                {comment.isInternal && (
                  <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                    <Lock className="w-2.5 h-2.5" />
                    <span>Internal Note</span>
                  </span>
                )}
              </div>

              {!isEditing && (
                <div className="flex items-center space-x-1">
                  {canEdit && (
                    <button
                      onClick={() => handleStartEdit(comment)}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded"
                      aria-label="Edit comment"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      aria-label="Delete comment"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-2 mt-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-md focus:ring-2 focus:ring-brand-500 focus:outline-none"
                  rows={3}
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setEditingId(null)}>
                    Cancel
                  </Button>
                  <Button size="sm" isLoading={isSaving} onClick={() => handleSaveEdit(comment.id)}>
                    Save Changes
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
