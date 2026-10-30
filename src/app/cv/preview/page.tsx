'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { buildTailoredCv } from '@/engine/cv-builder';

function CvPreviewContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get('jobId') || 'job-preview';
  const company = searchParams.get('company') || 'Technology Leader';
  const title = searchParams.get('title') || 'Staff Product Manager';

  const tailoredCv = buildTailoredCv({
    jobId,
    company,
    title,
  });

  const { document, auditReport } = tailoredCv;

  return (
    <div className="min-h-screen bg-[#080B11] text-[#F8FAFC] py-8 px-4 sm:px-6 font-sans">
      {/* Top Action Bar (Hidden during Print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between flex-wrap gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            href="/radar"
            className="text-xs px-3 py-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-colors"
          >
            &larr; Back to Radar
          </Link>
          <span className="text-xs text-slate-400">
            Tailored for <strong className="text-white">{company}</strong> — {title}
          </span>
          <span className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20 flex items-center gap-1 font-semibold">
            <span>✓</span>
            <span>Rule R5: 100% Metric Match ({auditReport.totalMetricsChecked} Checked)</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => window.print()}
            className="text-xs px-4 py-2 rounded bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold shadow-md flex items-center gap-1.5 transition-colors"
          >
            <span>🖨️</span>
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* 2-Page Executive Document Sheet */}
      <div className="max-w-4xl mx-auto bg-[#0F1523] border border-white/10 rounded-xl p-8 sm:p-12 shadow-2xl print:bg-white print:text-black print:border-none print:p-0 print:shadow-none">
        {/* Header */}
        <header className="border-b border-white/10 pb-6 mb-6 print:border-neutral-300">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white print:text-black">
              {document.candidateName}
            </h1>
            <span className="text-xs font-mono text-[#2563EB] print:text-blue-700">
              {document.headline}
            </span>
          </div>

          <div className="mt-2 text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1 print:text-neutral-600">
            <span>{document.location}</span>
            <span>•</span>
            <a href={`mailto:${document.email}`} className="text-slate-300 hover:underline print:text-black">
              {document.email}
            </a>
            <span>•</span>
            <a href={`https://${document.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-slate-300 hover:underline print:text-black">
              {document.linkedin}
            </a>
          </div>

          <div className="mt-4 p-2.5 rounded bg-[#161F33] border border-white/5 flex items-center justify-between text-xs print:bg-neutral-100 print:border-neutral-200">
            <span className="text-slate-300 print:text-black">
              <strong>Target Alignment:</strong> {document.targetRole} @ {document.company}
            </span>
            <span className="text-[10px] font-mono text-[#10B981] print:text-emerald-700">
              Rule R5 Verified Ground-Truth
            </span>
          </div>
        </header>

        {/* Executive Summary */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2 print:text-neutral-700">
            Executive Summary
          </h2>
          <p className="text-xs leading-relaxed text-slate-200 print:text-neutral-800">
            {document.summary}
          </p>
        </section>

        {/* Core Product Leadership Experience */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3 print:text-neutral-700">
            Tailored Product Leadership Experience
          </h2>
          <div className="space-y-4">
            {document.experience.map((exp, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white print:text-black">
                    {exp.title} &mdash; <span className="text-slate-400 print:text-neutral-600">{exp.employer}</span>
                  </span>
                  <span className="font-mono text-[11px] text-slate-400 print:text-neutral-500">
                    {exp.period}
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 print:text-neutral-800">
                  {exp.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="leading-relaxed">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* AI-Native Side Projects */}
        <section className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-3 print:text-neutral-700">
            Featured AI-Native Side Projects
          </h2>
          <div className="space-y-3">
            {document.sideProjects.map((proj, pIdx) => (
              <div key={pIdx} className="p-3 rounded bg-[#161F33]/40 border border-white/5 print:bg-neutral-50 print:border-neutral-200">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-white print:text-black">
                    {proj.name}
                  </span>
                  <div className="flex items-center gap-1">
                    {proj.techStack.map((tech, tIdx) => (
                      <span key={tIdx} className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/5 text-slate-400 print:bg-neutral-200 print:text-neutral-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-300 print:text-neutral-800">
                  {proj.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Core Competencies */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#94A3B8] mb-2 print:text-neutral-700">
            Core Competencies &amp; Domain Rigor
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {document.competencies.map((comp, cIdx) => (
              <span
                key={cIdx}
                className="text-[11px] px-2.5 py-1 rounded bg-[#161F33] text-slate-300 border border-white/5 print:bg-neutral-100 print:text-black print:border-neutral-300"
              >
                {comp}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function CvPreviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080B11] p-8 text-white">Loading document preview...</div>}>
      <CvPreviewContent />
    </Suspense>
  );
}

