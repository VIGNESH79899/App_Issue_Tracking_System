import React, { useState } from 'react';
import { AttachmentDTO, UserRole } from '@app-issue-track/shared';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Paperclip, UploadCloud, FileText, Download, Trash2 } from 'lucide-react';

export interface AttachmentListProps {
  attachments: AttachmentDTO[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (attachmentId: string) => Promise<void>;
  isLoading?: boolean;
}

export const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  onUpload,
  onDelete,
  isLoading = false,
}) => {
  const { user } = useAuth();
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onUpload(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* File Dropzone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`p-6 border-2 border-dashed rounded-lg text-center transition-colors ${
          dragOver ? 'border-brand-500 bg-brand-50/50' : 'border-slate-300 bg-slate-50/50'
        }`}
      >
        <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
        <p className="text-xs font-semibold text-slate-700">
          Drag & drop file here, or{' '}
          <label className="text-brand-600 hover:underline cursor-pointer">
            browse
            <input type="file" onChange={handleFileChange} className="hidden" />
          </label>
        </p>
        <p className="text-[10px] text-slate-500 mt-1">Supports Images, PDF, Docs, Zip (Max 10MB)</p>
      </div>

      {/* Attachment Items */}
      {attachments.length === 0 ? (
        <div className="p-4 text-center text-xs text-slate-500 border border-slate-200 rounded-md">
          No attachments uploaded for this issue.
        </div>
      ) : (
        <div className="space-y-2">
          {attachments.map((att) => {
            const isUploader = user?.id === att.uploadedById;
            const isAdmin = user?.role === UserRole.ADMIN;
            const canDelete = isUploader || isAdmin;
            const fileSizeKb = Math.round(att.fileSize / 1024);

            return (
              <div
                key={att.id}
                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-md shadow-subtle text-xs"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <FileText className="w-5 h-5 text-brand-600 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 truncate">{att.originalName}</p>
                    <p className="text-[10px] text-slate-400">
                      {fileSizeKb} KB • Uploaded {new Date(att.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <a
                    href={`/api/v1/attachments/${att.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-500 hover:text-brand-600 hover:bg-slate-100 rounded"
                    title="Download attachment"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                  {canDelete && (
                    <button
                      onClick={() => onDelete(att.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                      title="Delete attachment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
