'use client';

import React, { useState } from 'react';
import { ImportModal } from '@/components/ingest/ImportModal';

export default function HomePage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleUploadSuccess = (_jobs: any[], message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-[#080B11]">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-white">Backdoor v1.0</h1>
        <p className="text-slate-400">
          Career acceleration command center based on the Backdoor thesis.
        </p>
        <div className="flex flex-wrap justify-center gap-4 pt-4">
          <a
            href="/radar"
            className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 transition shadow-sm"
          >
            Launch Radar
          </a>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="rounded-lg border border-sky-500/30 bg-[#0F1523] px-4 py-2 font-medium text-sky-400 hover:bg-slate-800 transition shadow-sm flex items-center gap-2"
          >
            <span>📥 Import Opportunities</span>
          </button>
          <a
            href="/jobs"
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 font-medium text-slate-200 hover:bg-slate-800 transition"
          >
            View Jobs
          </a>
        </div>
      </div>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-sky-500/40 text-sky-400 text-xs font-mono shadow-2xl flex items-center gap-3">
          <span className="text-base font-bold text-emerald-400">✓</span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}
    </main>
  );
}
