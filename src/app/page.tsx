'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ImportModal } from '@/components/ingest/ImportModal';

export default function HomePage() {
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleUploadSuccess = (_jobs: any[], message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 5000);
  };

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center p-8 text-center bg-[#080B11] transition-colors">
      <div className="max-w-2xl space-y-5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2563EB]/15 border border-[#2563EB]/30 text-xs font-mono text-[#38BDF8]">
          <span>🚪 Backdoor Command Center</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
          Backdoor <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-slate-300 align-middle">v1.0</span>
        </h1>

        <p className="text-base text-slate-400 max-w-lg mx-auto leading-relaxed">
          Autonomous career acceleration command center triangulating executive, recruiter, and peer doors across 35 verified tech sources.
        </p>

        <div className="flex flex-wrap justify-center gap-3.5 pt-3">
          <Link
            href="/radar"
            className="rounded-lg bg-[#2563EB] hover:bg-blue-600 px-5 py-2.5 font-semibold text-white transition shadow-md flex items-center gap-2 text-sm"
          >
            <span>Launch Radar</span>
            <span className="text-xs">&rarr;</span>
          </Link>
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="rounded-lg border border-[#2563EB]/30 bg-[#161F33]/60 hover:bg-[#161F33] px-5 py-2.5 font-medium text-[#38BDF8] transition shadow-sm flex items-center gap-2 text-sm"
          >
            <span>📥 Import Opportunities</span>
          </button>
          <Link
            href="/jobs"
            className="rounded-lg border border-white/10 hover:border-white/20 bg-[#0F1523] hover:bg-[#161F33] px-5 py-2.5 font-medium text-slate-300 hover:text-white transition shadow-sm text-sm"
          >
            View Pipeline
          </Link>
        </div>

        {/* Telemetry Footer */}
        <div className="pt-8 border-t border-white/5 flex items-center justify-center gap-6 text-xs font-mono text-slate-500">
          <span>• 35 Source Ingestion</span>
          <span>• 0 Automated Sends (Rule R1)</span>
          <span>• Dual Theme: Cobalt / Sage</span>
        </div>
      </div>

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#0F1523] border border-[#2563EB]/40 text-[#38BDF8] text-xs font-mono shadow-2xl flex items-center gap-3">
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
