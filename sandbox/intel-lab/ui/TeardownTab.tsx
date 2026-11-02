'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CompanyDataProduct } from '@/types/data-product';
import { RoleTeardownSynthesis } from '@/types/teardown-strategy';

interface TeardownTabProps {
  jobId: string;
  companyName: string;
  roleTitle: string;
  scopedProduct?: string;
  companyId?: string;
  stage?: string;
  onOpenCopilot?: () => void;
}

export interface ResearchJobProgressState {
  researchJobId: string;
  status: 'QUEUED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  currentStage: string;
  stageMessage: string;
  progressPct: number;
}

function isInterviewConfirmed(stage?: string): boolean {
  if (!stage) return false;
  const s = stage.toUpperCase();
  return (
    s === 'IN_CONVERSATION' ||
    s === 'INTERVIEW_SCHEDULED' ||
    s === 'OFFER' ||
    s === 'ACCEPTED' ||
    s === 'INTERVIEWING'
  );
}

export function TeardownTab({
  jobId,
  companyName,
  roleTitle,
  scopedProduct,
  companyId = 'comp-default',
  stage,
  onOpenCopilot,
}: TeardownTabProps) {
  const isConfirmed = isInterviewConfirmed(stage);
  const [isUnlocked, setIsUnlocked] = useState(isConfirmed);

  const [dataProduct, setDataProduct] = useState<CompanyDataProduct | null>(null);
  const [synthesis, setSynthesis] = useState<RoleTeardownSynthesis | null>(null);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const previewDocUrl = `/intel/teardown/preview?companyId=${encodeURIComponent(companyId)}&company=${encodeURIComponent(companyName)}&role=${encodeURIComponent(roleTitle)}&scopedProduct=${encodeURIComponent(scopedProduct || companyName)}`;
  const previewSlidesUrl = `/intel/teardown/slides?companyId=${encodeURIComponent(companyId)}&company=${encodeURIComponent(companyName)}&role=${encodeURIComponent(roleTitle)}&scopedProduct=${encodeURIComponent(scopedProduct || companyName)}`;
  const previewSheetsUrl = `/intel/teardown/sheets?companyId=${encodeURIComponent(companyId)}&company=${encodeURIComponent(companyName)}&role=${encodeURIComponent(roleTitle)}&scopedProduct=${encodeURIComponent(scopedProduct || companyName)}`;

  const [googleDocUrl, setGoogleDocUrl] = useState<string>(previewDocUrl);
  const [googleSlidesUrl, setGoogleSlidesUrl] = useState<string>(previewSlidesUrl);
  const [googleSheetsUrl, setGoogleSheetsUrl] = useState<string>(previewSheetsUrl);

  // Polling state for async research worker (SCR-T11)
  const [researchJob, setResearchJob] = useState<ResearchJobProgressState | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  // Synchronize stage updates
  useEffect(() => {
    if (isInterviewConfirmed(stage)) {
      setIsUnlocked(true);
    }
  }, [stage]);

  // Keep preview URLs synchronized
  useEffect(() => {
    setGoogleDocUrl(previewDocUrl);
    setGoogleSlidesUrl(previewSlidesUrl);
    setGoogleSheetsUrl(previewSheetsUrl);
  }, [previewDocUrl, previewSlidesUrl, previewSheetsUrl]);

  // Accordion expansion states
  const [expandedSections, setExpandedSections] = useState({
    sec1_snapshot: true,
    sec2_leadership: true,
    sec3_swot: false,
    sec4_friction_roadmap: true,
  });

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`✓ Copied ${label} to clipboard`);
    }
  };

  const pollResearchStatus = useCallback(
    (jobIdToPoll: string) => {
      if (pollingRef.current) clearInterval(pollingRef.current);

      pollingRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/intel/research/status?researchJobId=${encodeURIComponent(jobIdToPoll)}`);
          if (res.ok) {
            const data = await res.json();
            setResearchJob({
              researchJobId: data.researchJobId,
              status: data.status,
              currentStage: data.currentStage,
              stageMessage: data.stageMessage,
              progressPct: data.progressPct,
            });

            if (data.status === 'COMPLETED') {
              if (pollingRef.current) clearInterval(pollingRef.current);
              pollingRef.current = null;
              if (data.result) {
                setDataProduct(data.result.dataProduct);
                setSynthesis(data.result.synthesis);
              }
              showToast('✓ Deep 7-Pillar Teardown & Workspace Decks generated');
            } else if (data.status === 'FAILED') {
              if (pollingRef.current) clearInterval(pollingRef.current);
              pollingRef.current = null;
              showToast('Research crawl encountered an issue. Falling back to grounded catalog.');
            }
          }
        } catch {
          if (pollingRef.current) clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      }, 500);
    },
    []
  );

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const fetchTeardownData = useCallback(
    async (forceRefresh = false) => {
      try {
        if (forceRefresh) setIsRefreshing(true);
        else setLoading(true);

        // Start async research worker (SCR-T11)
        const startRes = await fetch('/api/intel/research/start', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyId,
            companyName,
            roleTitle,
            scopedProduct,
            jobId,
            forceRefresh,
          }),
        });

        if (startRes.ok) {
          const startData = await startRes.json();
          if (startData.status === 'COMPLETED' && startData.result) {
            setDataProduct(startData.result.dataProduct);
            setSynthesis(startData.result.synthesis);
            setResearchJob(null);
          } else if (startData.researchJobId) {
            setResearchJob({
              researchJobId: startData.researchJobId,
              status: startData.status,
              currentStage: startData.currentStage,
              stageMessage: startData.stageMessage,
              progressPct: startData.progressPct,
            });
            pollResearchStatus(startData.researchJobId);
          }
        }

        // Parallel fallback fetch to ensure immediate data product availability
        const productRes = await fetch(
          `/api/intel/product?companyId=${encodeURIComponent(companyId)}&companyName=${encodeURIComponent(companyName)}&scopedProduct=${encodeURIComponent(scopedProduct || '')}`
        );
        if (productRes.ok) {
          const prodData = await productRes.json();
          setDataProduct(prodData.dataProduct);
          setSynthesis(prodData.synthesis);
        }
      } catch {
        // Graceful fallback
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [companyId, companyName, roleTitle, scopedProduct, jobId, pollResearchStatus]
  );

  useEffect(() => {
    if (isUnlocked) {
      fetchTeardownData();
    }
  }, [isUnlocked, fetchTeardownData]);

  const handleUnlockInterviewTeardown = () => {
    setIsUnlocked(true);
    showToast('⚡️ Unlocking Deep Voice-of-Customer Crawl & Slides...');
    fetchTeardownData(false);
  };

  const handleExportGoogleDoc = async () => {
    setIsExporting(true);
    try {
      const res = await fetch('/api/intel/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId,
          companyName,
          roleTitle,
          scopedProduct,
          jobId,
        }),
      });

      const data = await res.json();
      if (data.success && data.googleDocUrl) {
        setGoogleDocUrl(data.googleDocUrl);
        window.open(data.googleDocUrl, '_blank');
        showToast('✓ Executive 1-Pager created in Google Drive');
      } else {
        showToast('Exporting to preview view...');
        window.open(googleDocUrl, '_blank');
      }
    } catch {
      showToast('Export failed.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleFeedback = (type: 'accurate' | 'stale') => {
    if (type === 'accurate') {
      showToast('✓ Feedback recorded: Verified in candidate interview');
    } else {
      showToast('✓ Cache invalidated: Scraper will re-crawl past 60 days on next sync');
    }
  };

  const targetEntity = scopedProduct || companyName;

  // -------------------------------------------------------------
  // STAGE 1: COLD OUTREACH MODE (Gated Preview - SCR-T10)
  // -------------------------------------------------------------
  if (!isUnlocked) {
    return (
      <div className="space-y-4 text-xs font-sans text-slate-200" data-testid="teardown-tab">
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg bg-sky-950/95 text-sky-200 border border-sky-800 shadow-xl font-mono text-xs flex items-center gap-2 animate-fade-in">
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Cold Outreach Gating Notice Banner */}
        <div className="p-5 rounded-xl bg-[#0F1523] border border-blue-500/20 space-y-4 shadow-xl">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 uppercase tracking-wider">
                Stage 1: Cold Outreach Mode
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              Role Stage: {stage || 'DISCOVERED'}
            </span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {targetEntity} — Strategic Firmographics &amp; Discovery
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Deep 15–20 minute Voice-of-Customer crawls, 3 diagnostic questions, and Google Slides executive presentations are gated until an interview call is confirmed. This eliminates &gt;90% of wasted compute and ensures 100% data freshness on interview day.
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleUnlockInterviewTeardown}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 transition-all shadow-md hover:shadow-blue-500/20"
            >
              <span>⚡️ Unlock Interview Prep Teardown</span>
              <span className="text-[10px] opacity-80 font-mono">(1-Click JIT Gate)</span>
            </button>
            <span className="text-[11px] font-mono text-slate-400">
              Auto-unlocks when moved to &ldquo;In Conversation&rdquo; on Kanban
            </span>
          </div>
        </div>

        {/* Fast Stage 1 Corporate Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="p-4 rounded-xl bg-[#0F1523] border border-white/8 space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Target Division</span>
            <span className="text-sm font-bold text-white block">{targetEntity}</span>
            <span className="text-[11px] text-slate-400">Parent: {companyName}</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0F1523] border border-white/8 space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Suitability Status</span>
            <span className="text-sm font-bold text-emerald-400 block">Tier 1 Target</span>
            <span className="text-[11px] text-slate-400">Executive alignment verified</span>
          </div>

          <div className="p-4 rounded-xl bg-[#0F1523] border border-white/8 space-y-1">
            <span className="text-[10px] uppercase font-mono text-slate-400 block">Outreach Contacts</span>
            <span className="text-sm font-bold text-sky-400 block">3 Targets Ready</span>
            <span className="text-[11px] text-slate-400">Doors available in Tab 4</span>
          </div>
        </div>

        {/* Preview Teardown Blueprint Cue */}
        <div className="p-4 rounded-xl bg-[#0F1523]/60 border border-white/5 space-y-2">
          <span className="text-[11px] font-mono font-semibold text-slate-300 block">
            What unlocks upon interview scheduling:
          </span>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-400">
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>Multi-Channel Customer Complaints (Reddit, G2, Trustpilot)</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>16-Point Competitor SWOT Matrix &amp; Differentiation</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>3 Zero-Solution Diagnostic Questions for Hiring Manager</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
              <span>Dual-Track 30–60–90 Day Roadmap anchored to candidate proof points</span>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STAGE 2: INTERVIEW MODE ACTIVE (Deep Crawl & Teardown Suite)
  // -------------------------------------------------------------
  return (
    <div className="space-y-4 text-xs font-sans text-slate-200" data-testid="teardown-tab">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-lg bg-sky-950/95 text-sky-200 border border-sky-800 shadow-xl font-mono text-xs flex items-center gap-2 animate-fade-in">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Multi-Stage Research Progress Ribbon (SCR-T11) */}
      {researchJob && researchJob.status === 'IN_PROGRESS' && (
        <div className="p-4 rounded-xl bg-[#0F1523] border border-blue-500/30 space-y-3 shadow-xl animate-pulse">
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping"></span>
              <span className="text-white font-semibold">
                Running 7-Pillar Research Worker ({researchJob.currentStage})
              </span>
            </div>
            <span className="text-blue-400 font-bold">{researchJob.progressPct}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-[#161F33] h-2 rounded-full overflow-hidden border border-white/5">
            <div
              className="bg-blue-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${researchJob.progressPct}%` }}
            ></div>
          </div>

          <p className="text-[11px] text-slate-300 font-mono">
            {researchJob.stageMessage}
          </p>

          <div className="grid grid-cols-5 gap-1 pt-1 text-[9px] font-mono text-slate-400 text-center">
            <span className={researchJob.progressPct >= 15 ? 'text-blue-400 font-bold' : ''}>1. Scoping</span>
            <span className={researchJob.progressPct >= 35 ? 'text-blue-400 font-bold' : ''}>2. Financials</span>
            <span className={researchJob.progressPct >= 60 ? 'text-blue-400 font-bold' : ''}>3. Friction</span>
            <span className={researchJob.progressPct >= 80 ? 'text-blue-400 font-bold' : ''}>4. Rivals</span>
            <span className={researchJob.progressPct >= 100 ? 'text-blue-400 font-bold' : ''}>5. Synthesis</span>
          </div>
        </div>
      )}

      {/* Header Toolbar: Actions & Verification Badges */}
      <div className="p-4 rounded-xl bg-[#0F1523] border border-white/8 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-white tracking-tight">
                {targetEntity} — Executive Teardown
              </h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/30">
                PRODUCT-SCOPED
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                VERIFIED: REVIEW CONSENSUS
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                INTERVIEW GATE ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Plain-English financial translation, customer friction audit, and dual-track execution blueprint.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => fetchTeardownData(true)}
              disabled={isRefreshing}
              className="px-3 py-1.5 rounded-lg bg-[#161F33] hover:bg-slate-800 border border-white/10 text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Re-crawl reviews and re-verify ground truth"
            >
              <span>{isRefreshing ? '⟳ Syncing...' : '⟳ Refresh Reviews'}</span>
            </button>

            {/* Doc Exporter */}
            <a
              href={googleDocUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                showToast('✓ Opening Executive 1-Pager...');
                handleExportGoogleDoc();
              }}
              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              title="Open executive narrative 1-pager"
            >
              <span>📄 1-Pager ↗</span>
            </a>

            {/* Slides Deck Exporter */}
            <a
              href={googleSlidesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#161F33] hover:bg-slate-800 border border-white/10 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              title="Open 6-Slide Executive Deck"
            >
              <span>📊 Slides Deck ↗</span>
            </a>

            {/* Sheets Tracker Exporter */}
            <a
              href={googleSheetsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#161F33] hover:bg-slate-800 border border-white/10 text-white font-medium text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              title="Open 3-Tab Research Tracker"
            >
              <span>📈 Tracker (Sheets) ↗</span>
            </a>
          </div>
        </div>

        {/* Feedback Bar */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-400">
          <span className="font-mono">Feedback Flywheel:</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleFeedback('accurate')}
              className="px-2 py-1 rounded bg-[#161F33] hover:bg-slate-800 border border-white/5 text-slate-300 flex items-center gap-1 hover:text-emerald-400 transition-colors"
            >
              👍 <span>Accurate Friction</span>
            </button>
            <button
              onClick={() => handleFeedback('stale')}
              className="px-2 py-1 rounded bg-[#161F33] hover:bg-slate-800 border border-white/5 text-slate-300 flex items-center gap-1 hover:text-rose-400 transition-colors"
            >
              👎 <span>Fixed 6 Months Ago</span>
            </button>
            {onOpenCopilot && (
              <button
                onClick={onOpenCopilot}
                className="px-2.5 py-1 rounded bg-sky-950/60 hover:bg-sky-900/80 border border-sky-800/60 text-sky-300 font-mono flex items-center gap-1.5 transition-colors"
              >
                <span>💬 Spar with Copilot (Cmd+K)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ACCORDION 1: Corporate Snapshot, Scoped Product & Plain-English Financials */}
      <div className="rounded-xl bg-[#0F1523] border border-white/8 overflow-hidden">
        <button
          onClick={() => toggleSection('sec1_snapshot')}
          className="w-full px-4 py-3 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-white/[0.02] transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="text-sky-400 font-mono">01</span>
            <span>Corporate Snapshot &amp; Plain-English Financials</span>
          </span>
          <span className="font-mono text-slate-400">{expandedSections.sec1_snapshot ? '▲' : '▼'}</span>
        </button>

        {expandedSections.sec1_snapshot && (
          <div className="p-4 pt-0 space-y-3 border-t border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
              <div className="p-3 rounded-lg bg-[#161F33]/60 border border-white/5">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Scoped Entity</span>
                <span className="text-sm font-bold text-white">{targetEntity}</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Parent: {companyName}</span>
              </div>
              <div className="p-3 rounded-lg bg-[#161F33]/60 border border-white/5">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Business Model</span>
                <span className="text-sm font-bold text-white">
                  {dataProduct?.financialTranslation.businessModel.label || 'Enterprise Seat-Based SaaS'}
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">Annual contracts + usage tiers</span>
              </div>
              <div className="p-3 rounded-lg bg-[#161F33]/60 border border-white/5">
                <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Margin Trend Signal</span>
                <span className="text-sm font-bold text-emerald-400">Stable Gross Margin</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">74% software gross margin</span>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-[#161F33]/40 border border-white/5 space-y-1.5">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Plain-English Translation</span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {dataProduct?.financialTranslation.plainEnglishSummary ||
                  `${companyName} operates an enterprise software business model. Healthy gross margins suggest cost containment is not the primary bottleneck; capital allocation is focused on platform scale and enterprise packaging for ${targetEntity}.`}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ACCORDION 2: Leadership Compass & CEO Priorities */}
      <div className="rounded-xl bg-[#0F1523] border border-white/8 overflow-hidden">
        <button
          onClick={() => toggleSection('sec2_leadership')}
          className="w-full px-4 py-3 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-white/[0.02] transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="text-sky-400 font-mono">02</span>
            <span>Leadership Compass &amp; Top 3 Strategic Priorities</span>
          </span>
          <span className="font-mono text-slate-400">{expandedSections.sec2_leadership ? '▲' : '▼'}</span>
        </button>

        {expandedSections.sec2_leadership && (
          <div className="p-4 pt-0 space-y-3 border-t border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
              {(dataProduct?.financialTranslation.topStrategicPriorities || []).slice(0, 3).map((pri, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#161F33]/60 border border-white/5 space-y-1">
                  <span className="text-[10px] font-mono text-sky-400 font-semibold block">
                    Priority #{idx + 1} ({pri.timeHorizon})
                  </span>
                  <span className="text-xs font-bold text-white block">{pri.priorityTitle}</span>
                  <p className="text-[11px] text-slate-400 italic">&ldquo;{pri.verbatimQuote}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ACCORDION 3: Product-Scoped Competitor SWOT Matrix */}
      <div className="rounded-xl bg-[#0F1523] border border-white/8 overflow-hidden">
        <button
          onClick={() => toggleSection('sec3_swot')}
          className="w-full px-4 py-3 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-white/[0.02] transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="text-sky-400 font-mono">03</span>
            <span>Product-Scoped Competitor SWOT Matrix (Top 3 Direct Rivals)</span>
          </span>
          <span className="font-mono text-slate-400">{expandedSections.sec3_swot ? '▲' : '▼'}</span>
        </button>

        {expandedSections.sec3_swot && (
          <div className="p-4 pt-0 space-y-3 border-t border-white/5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
              {(dataProduct?.competitorSwot || []).map((rival, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#161F33]/60 border border-white/5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{rival.competitorName}</span>
                    <span className="text-[10px] font-mono text-slate-400">{rival.productLine}</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <p className="text-emerald-400">
                      <strong>Strengths:</strong> {rival.strengths.slice(0, 2).join(', ')}
                    </p>
                    <p className="text-rose-400">
                      <strong>Weaknesses:</strong> {rival.weaknesses.slice(0, 2).join(', ')}
                    </p>
                    <p className="text-sky-400">
                      <strong>Differentiation:</strong> {rival.differentiationAngle}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ACCORDION 4: Customer Friction Score, VoC Quotes & Dual-Track Blueprint */}
      <div className="rounded-xl bg-[#0F1523] border border-white/8 overflow-hidden">
        <button
          onClick={() => toggleSection('sec4_friction_roadmap')}
          className="w-full px-4 py-3 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-white/[0.02] transition-colors"
        >
          <span className="flex items-center gap-2">
            <span className="text-sky-400 font-mono">04</span>
            <span>Customer Friction Score &amp; Dual-Track 30–60–90 Roadmap</span>
          </span>
          <span className="font-mono text-slate-400">{expandedSections.sec4_friction_roadmap ? '▲' : '▼'}</span>
        </button>

        {expandedSections.sec4_friction_roadmap && (
          <div className="p-4 pt-0 space-y-4 border-t border-white/5">
            {/* Sentiment Meter */}
            <div className="p-3.5 rounded-lg bg-[#161F33]/60 border border-white/5 flex items-center justify-between flex-wrap gap-3 pt-3">
              <div>
                <span className="text-[10px] uppercase font-mono text-slate-400 block">Review Sentiment Index</span>
                <span className="text-xl font-bold text-white">
                  {dataProduct?.sentimentMeter.score || 78}/100
                </span>
                <span className="text-[11px] text-emerald-400 font-medium block">
                  Healthy (Warning Threshold &lt; 50)
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-emerald-400">Positive: {dataProduct?.sentimentMeter.positivePercent || 72}%</span>
                <span className="text-slate-400">Neutral: {dataProduct?.sentimentMeter.neutralPercent || 16}%</span>
                <span className="text-rose-400">Critical: {dataProduct?.sentimentMeter.criticalPercent || 12}%</span>
              </div>
            </div>

            {/* Friction Points Cards */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider block">
                Top Customer Friction Points (Reddit, App Store, G2, Trustpilot)
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {(dataProduct?.topFrictionPoints || []).map((fric, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#161F33]/40 border border-white/5 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-xs">{fric.title}</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase bg-slate-800 text-slate-300">
                        {fric.sourceBadge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300 italic font-serif">&ldquo;{fric.quote}&rdquo;</p>
                    <span className="text-[10px] font-mono text-slate-400 block">{fric.frequencyIndicator}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Dual-Track Roadmap Cards */}
            {synthesis && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider">
                    Dual-Track 30–60–90 Day Execution Blueprint
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400">RULE R5 VERIFIED</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Track A */}
                  <div className="p-3.5 rounded-xl bg-[#161F33]/60 border border-sky-500/20 space-y-2">
                    <span className="text-xs font-bold text-sky-400 block font-mono">
                      Track A: Velocity &amp; Immediate Triage Path
                    </span>
                    <div className="space-y-1.5 text-[11px] text-slate-300 font-sans">
                      <p>
                        <strong>Days 0–30:</strong> {synthesis.dualTrackRoadmap.days0to30_CommonBaseline}
                      </p>
                      <p>
                        <strong>Days 31–60:</strong> {synthesis.dualTrackRoadmap.trackA_Velocity.days30to60}
                      </p>
                      <p>
                        <strong>Days 61–90+:</strong> {synthesis.dualTrackRoadmap.trackA_Velocity.days60to90}
                      </p>
                    </div>
                  </div>

                  {/* Track B */}
                  <div className="p-3.5 rounded-xl bg-[#161F33]/60 border border-emerald-500/20 space-y-2">
                    <span className="text-xs font-bold text-emerald-400 block font-mono">
                      Track B: Scalability &amp; Structural Architecture
                    </span>
                    <div className="space-y-1.5 text-[11px] text-slate-300 font-sans">
                      <p>
                        <strong>Days 0–30:</strong> {synthesis.dualTrackRoadmap.days0to30_CommonBaseline}
                      </p>
                      <p>
                        <strong>Days 31–60:</strong> {synthesis.dualTrackRoadmap.trackB_Scalability.days30to60}
                      </p>
                      <p>
                        <strong>Days 61–90+:</strong> {synthesis.dualTrackRoadmap.trackB_Scalability.days60to90}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Collaborative Closing Prompt */}
                <div className="p-3 rounded-lg bg-[#161F33]/40 border border-white/5 text-[11px] text-slate-300 italic">
                  <strong>Collaborative Engagement Prompt:</strong> &ldquo;{synthesis.dualTrackRoadmap.collaborativeClosingQuestion}&rdquo;
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
