'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface ValidationErrorItem {
  row: number;
  column: string;
  message: string;
}

export interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (importedJobs: any[], toastMessage: string) => void;
}

export function ImportModal({ isOpen, onClose, onUploadSuccess }: ImportModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrorItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedFile(null);
      setGeneralError(null);
      setValidationErrors([]);
      setIsDragging(false);
      setIsUploading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setGeneralError(null);
    setValidationErrors([]);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const name = file.name.toLowerCase();
      if (!name.endsWith('.csv') && !name.endsWith('.xlsx')) {
        setGeneralError('Invalid file format: Please upload a .csv or .xlsx file.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGeneralError(null);
    setValidationErrors([]);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const name = file.name.toLowerCase();
      if (!name.endsWith('.csv') && !name.endsWith('.xlsx')) {
        setGeneralError('Invalid file format: Please upload a .csv or .xlsx file.');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleDownloadTemplate = () => {
    window.open('/api/ingest/template', '_blank');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setGeneralError('Please choose or drag a file to upload.');
      return;
    }

    setIsUploading(true);
    setGeneralError(null);
    setValidationErrors([]);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/ingest/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.status === 400) {
        setGeneralError(data.error || 'Upload error');
        return;
      }

      if (res.status === 422 && Array.isArray(data.errors)) {
        setValidationErrors(data.errors);
        return;
      }

      if (!res.ok || !data.success) {
        setGeneralError(data.error || 'Bulk upload failed to process.');
        return;
      }

      // Success
      const toastMsg = `✓ ${data.imported} opportunities imported & scored (${data.deduplicated} deduplicated)`;
      if (onUploadSuccess) {
        onUploadSuccess(data.jobs || [], toastMsg);
      }
      onClose();
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Network error during upload');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Import Target Opportunities</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/80 text-sky-400 border border-sky-800/60 font-semibold">
                Limit: 50 rows per batch
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Upload candidate roles using our standardized 6-column format (.csv or .xlsx).
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl p-1 leading-none rounded transition-colors"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Template Action Bar */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs">
          <div className="text-slate-300">
            <span className="font-semibold text-slate-200">Need the standardized columns?</span>
            <span className="text-slate-400 block text-[11px]">
              company_name, job_title, apply_url, location, workplace_type, raw_description
            </span>
          </div>
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="px-3 py-1.5 rounded-md font-mono text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>Download Template (CSV)</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-sky-400 bg-sky-950/20'
                : 'border-slate-700 bg-slate-900/60 hover:border-sky-500/50'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv, .xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="space-y-2">
              <div className="text-2xl">📥</div>
              <div className="text-xs font-medium text-slate-200">
                {selectedFile ? (
                  <span className="text-sky-400 font-mono font-semibold">{selectedFile.name}</span>
                ) : (
                  <span>
                    Drag &amp; drop your file here, or{' '}
                    <span className="text-sky-400 underline">browse files</span>
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500">
                Supports .csv and .xlsx &bull; Maximum 50 rows per batch
              </div>
            </div>
          </div>

          {/* General Error Banner */}
          {generalError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono">
              {generalError}
            </div>
          )}

          {/* Pre-Import Validation Error Table */}
          {validationErrors.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-rose-400 font-mono">
                  ⚠ Validation Issues ({validationErrors.length} errors found)
                </span>
                <span className="text-[11px] text-slate-400">Fix rows before importing</span>
              </div>
              <div className="max-h-44 overflow-y-auto rounded-lg border border-rose-500/20 bg-slate-950/80 text-xs">
                <table className="w-full text-left font-mono">
                  <thead className="bg-slate-900 text-[10px] text-slate-400 border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="py-1.5 px-3">Row #</th>
                      <th className="py-1.5 px-3">Column</th>
                      <th className="py-1.5 px-3">Issue Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-[11px]">
                    {validationErrors.map((err, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/50">
                        <td className="py-1.5 px-3 text-slate-300 font-bold">
                          {err.row > 0 ? `Row ${err.row}` : 'Header'}
                        </td>
                        <td className="py-1.5 px-3 text-sky-400">{err.column}</td>
                        <td className="py-1.5 px-3 text-rose-300">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#2563EB] hover:bg-blue-600 disabled:opacity-50 text-white transition-colors flex items-center gap-2 shadow-sm font-sans"
            >
              <span>{isUploading ? 'Validating & Ingesting...' : 'Upload & Score Opportunities'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

