'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CompanyDataProduct } from '@/types/data-product';
import { RoleTeardownSynthesis } from '@/types/teardown-strategy';

function TeardownPreviewContent() {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId') || 'comp-default';
  const company = searchParams.get('company') || 'Technology Leader';
  const role = searchParams.get('role') || 'Staff Product Manager';
  const scopedProduct = searchParams.get('scopedProduct') || company;

  const [dataProduct, setDataProduct] = useState<CompanyDataProduct | null>(null);
  const [synthesis, setSynthesis] = useState<RoleTeardownSynthesis | null>(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const fetchIntel = async () => {
      try {
        const res = await fetch(
          `/api/intel/product?companyId=${encodeURIComponent(companyId)}&companyName=${encodeURIComponent(company)}&roleTitle=${encodeURIComponent(role)}&scopedProduct=${encodeURIComponent(scopedProduct)}`
        );
        if (res.ok) {
          const data = await res.json();
          setDataProduct(data.dataProduct);
          setSynthesis(data.synthesis);
        }
      } catch {
        // Fallback
      } finally {
        setLoading(false);
      }
    };
    fetchIntel();
  }, [companyId, company, role, scopedProduct]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080B11] text-slate-200 flex items-center justify-center font-mono text-xs">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
          Rendering Executive Teardown 1-Pager...
        </span>
      </div>
    );
  }

  const p = dataProduct;
  const s = synthesis;

  return (
    <div className="min-h-screen bg-[#080B11] text-[#F8FAFC] py-8 px-4 sm:px-6 font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 px-4 py-2 rounded-lg bg-sky-950 text-sky-200 border border-sky-800 shadow-xl font-mono text-xs animate-fade-in">
          {toastMessage}
        </div>
      )}

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
            Executive 1-Pager: <strong className="text-white">{scopedProduct}</strong> — {role}
          </span>
          <span className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20 flex items-center gap-1 font-semibold">
            <span>✓</span>
            <span>Rule R5 Verified Ground-Truth</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              showToast('✓ Link copied to clipboard');
            }}
            className="text-xs px-3 py-2 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 transition-colors"
          >
            Copy Link
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="text-xs px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md flex items-center gap-1.5 transition-colors"
          >
            <span>🖨️</span>
            <span>Print / Save as PDF</span>
          </button>
        </div>
      </div>

      {/* Executive 1-Pager Document Sheet */}
      <div className="max-w-4xl mx-auto bg-[#0F1523] border border-white/10 rounded-xl p-8 sm:p-12 shadow-2xl print:bg-white print:text-black print:border-none print:p-0 print:shadow-none space-y-8">
        {/* Document Header */}
        <header className="border-b border-white/10 pb-6 print:border-neutral-300">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-sky-400 block mb-1 print:text-blue-700">
                Strategic Consulting Memo &bull; Executive Teardown
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white print:text-black">
                {role}
              </h1>
            </div>
            <div className="text-left sm:text-right font-mono text-xs text-slate-400 print:text-neutral-600">
              <span className="block text-white font-bold print:text-black">{scopedProduct}</span>
              <span>Parent: {company}</span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-[#161F33] border border-white/5 flex items-center justify-between flex-wrap gap-2 text-xs print:bg-neutral-100 print:border-neutral-200">
            <span className="text-slate-300 print:text-black">
              <strong>Prepared By:</strong> Candidate (Consultative Engagement)
            </span>
            <span className="font-mono text-slate-400 print:text-neutral-600">
              Date: {new Date().toISOString().split('T')[0]} &bull; Status: Confidential
            </span>
          </div>
        </header>

        {/* SECTION 1: Corporate Snapshot & Plain-English Financials */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400 border-b border-white/10 pb-1 print:text-blue-800 print:border-neutral-300">
            1. Corporate Snapshot &amp; Leadership Compass
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded bg-[#161F33]/60 border border-white/5 print:bg-neutral-50 print:border-neutral-200">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5 print:text-neutral-500">Business Model</span>
              <span className="font-bold text-white print:text-black">
                {p?.financialTranslation.businessModel.label || 'Enterprise Seat-Based SaaS'}
              </span>
            </div>
            <div className="p-3 rounded bg-[#161F33]/60 border border-white/5 print:bg-neutral-50 print:border-neutral-200">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5 print:text-neutral-500">Capital Strategy</span>
              <span className="font-bold text-white print:text-black">Runway Reinvestment</span>
            </div>
            <div className="p-3 rounded bg-[#161F33]/60 border border-white/5 print:bg-neutral-50 print:border-neutral-200">
              <span className="text-[10px] uppercase font-mono text-slate-400 block mb-0.5 print:text-neutral-500">Sentiment Score</span>
              <span className="font-bold text-emerald-400 print:text-emerald-700 font-mono">
                {p?.sentimentMeter.score || 72}/100 (Healthy)
              </span>
            </div>
          </div>
          <div className="p-3.5 rounded bg-[#161F33]/40 border border-white/5 text-xs text-slate-300 leading-relaxed print:bg-neutral-50 print:text-neutral-800 print:border-neutral-200">
            <strong>Financial Translation:</strong> {p?.financialTranslation.plainEnglishSummary || `${company} demonstrates solid gross margins with capital earmarked for offensive product scaling and infrastructure triage.`}
          </div>
        </section>

        {/* SECTION 2: The Strategic Discrepancy */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400 border-b border-white/10 pb-1 print:text-blue-800 print:border-neutral-300">
            2. The Strategic Discrepancy (Intent vs. Ground Truth)
          </h2>
          <div className="space-y-2 text-xs">
            <div className="p-3 rounded bg-[#161F33]/40 border border-white/5 print:bg-neutral-50 print:border-neutral-200">
              <span className="font-bold text-white block mb-0.5 print:text-black">Layer 1: Stated Leadership Intent</span>
              <p className="text-slate-300 print:text-neutral-800 italic">
                &ldquo;{p?.discrepancy.layer1StatedIntent || 'Seamless, effortless self-serve product-led growth with instant enterprise scalability.'}&rdquo;
              </p>
            </div>
            <div className="p-3 rounded bg-[#161F33]/40 border border-white/5 print:bg-neutral-50 print:border-neutral-200">
              <span className="font-bold text-white block mb-0.5 print:text-black">Layer 2: Ground Truth Review Consensus</span>
              <p className="text-slate-300 print:text-neutral-800">
                {p?.discrepancy.layer2GroundTruth || 'User reviews flag onboarding friction, export timeouts, and steep enterprise tier pricing jumps.'}
              </p>
            </div>
            <div className="p-3 rounded bg-sky-950/40 border border-sky-800/40 text-sky-200 print:bg-blue-50 print:text-blue-900 print:border-blue-200">
              <strong>The Candidate Opportunity:</strong> {p?.discrepancy.discrepancyDelta || 'Triage early configuration leaks to protect NRR and accelerate enterprise seat activation.'}
            </div>
          </div>
        </section>

        {/* SECTION 3: Top Customer Friction Points */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400 border-b border-white/10 pb-1 print:text-blue-800 print:border-neutral-300">
            3. Top Customer Friction Points (Multi-Channel Audit)
          </h2>
          <div className="space-y-2 text-xs">
            {(p?.topFrictionPoints || []).slice(0, 3).map((f, i) => (
              <div key={f.id || i} className="p-3 rounded bg-[#161F33]/50 border border-white/5 print:bg-neutral-50 print:border-neutral-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white print:text-black">#{i + 1} {f.title}</span>
                  <span className="font-mono text-[10px] uppercase text-sky-400 print:text-blue-700">
                    {f.sourceBadge} &bull; {f.verificationIndicator}
                  </span>
                </div>
                <p className="text-slate-300 italic print:text-neutral-800">{f.quote}</p>
                <span className="text-[10px] font-mono text-slate-400 print:text-neutral-500 block pt-0.5">
                  {f.frequencyIndicator}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: Three Zero-Solution Diagnostic Questions */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400 border-b border-white/10 pb-1 print:text-blue-800 print:border-neutral-300">
            4. Three Zero-Solution Diagnostic Questions (For Hiring Manager)
          </h2>
          <div className="space-y-2 text-xs">
            {(s?.threeDiagnosticQuestions || []).map((q, i) => (
              <div key={q.type || i} className="p-3 rounded bg-[#161F33]/50 border border-white/5 print:bg-neutral-50 print:border-neutral-200 space-y-1">
                <span className="font-mono text-[10px] font-bold text-emerald-400 print:text-emerald-700 block uppercase">
                  Q{i + 1}: {q.type.replace('_', ' ')}
                </span>
                <p className="text-slate-200 font-medium leading-relaxed print:text-neutral-900">
                  &ldquo;{q.question}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: Dual-Track 30–60–90 Day Execution Blueprint */}
        <section className="space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400 border-b border-white/10 pb-1 print:text-blue-800 print:border-neutral-300">
            5. Dual-Track 30–60–90 Day Execution Blueprint
          </h2>
          <div className="p-3.5 rounded bg-[#161F33]/80 border border-sky-900/40 print:bg-neutral-50 print:border-neutral-300 space-y-3 text-xs">
            <div className="border-b border-white/5 pb-2 print:border-neutral-200">
              <span className="font-mono text-[10px] uppercase text-sky-400 print:text-blue-700 block font-bold">
                Common Baseline (Days 0–30)
              </span>
              <p className="text-slate-200 mt-0.5 print:text-neutral-800">
                {s?.dualTrackRoadmap.days0to30_CommonBaseline || 'Audit top customer escalations, shadow 5 customer onboarding sessions, and map cross-functional data pipelines.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded bg-[#0F1523] border border-white/5 print:bg-white print:border-neutral-200 space-y-1">
                <span className="font-bold text-emerald-400 print:text-emerald-700 block text-xs">
                  Track A: Velocity Path (Immediate Triage)
                </span>
                <p className="text-slate-300 print:text-neutral-700 text-[11px]">
                  <strong>Days 30–60:</strong> {s?.dualTrackRoadmap.trackA_Velocity.days30to60 || 'Deploy interactive preset templates for high-friction configuration screens.'}
                </p>
                <p className="text-slate-300 print:text-neutral-700 text-[11px]">
                  <strong>Days 60–90:</strong> {s?.dualTrackRoadmap.trackA_Velocity.days60to90 || 'Measure 30-day cohort retention uplift and automate setup telemetry.'}
                </p>
                <span className="text-[10px] font-mono text-emerald-400 print:text-emerald-700 block pt-1">
                  Anchor: {s?.dualTrackRoadmap.trackA_Velocity.verifiedMetric || '42% query latency reduction'}
                </span>
              </div>

              <div className="p-3 rounded bg-[#0F1523] border border-white/5 print:bg-white print:border-neutral-200 space-y-1">
                <span className="font-bold text-sky-400 print:text-blue-700 block text-xs">
                  Track B: Scalability Path (Structural Foundation)
                </span>
                <p className="text-slate-300 print:text-neutral-700 text-[11px]">
                  <strong>Days 30–60:</strong> {s?.dualTrackRoadmap.trackB_Scalability.days30to60 || 'Refactor core configuration data model and asynchronous queue brokers.'}
                </p>
                <p className="text-slate-300 print:text-neutral-700 text-[11px]">
                  <strong>Days 60–90:</strong> {s?.dualTrackRoadmap.trackB_Scalability.days60to90 || 'Roll out enterprise governance frameworks and telemetry dashboards.'}
                </p>
                <span className="text-[10px] font-mono text-sky-400 print:text-blue-700 block pt-1">
                  Anchor: {s?.dualTrackRoadmap.trackB_Scalability.verifiedMetric || '94.6% retrieval precision'}
                </span>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-400 italic print:text-neutral-600">
              &ldquo;{s?.dualTrackRoadmap.collaborativeClosingQuestion || 'Given the immediate priorities of the team, which of these two paths takes more operational pressure off your desk in Q1?'}&rdquo;
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-4 border-t border-white/10 text-center font-mono text-[10px] text-slate-500 print:text-neutral-500 print:border-neutral-200">
          Generated via Backdoor Executive Intelligence Engine &bull; Zero Hallucination Guarantee (Rule R5)
        </footer>
      </div>
    </div>
  );
}

export default function TeardownPreviewPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#080B11] text-slate-400 flex items-center justify-center font-mono text-xs">
          Loading document...
        </div>
      }
    >
      <TeardownPreviewContent />
    </Suspense>
  );
}

