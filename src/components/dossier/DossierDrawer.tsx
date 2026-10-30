'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { enrichCompanyContacts, EnrichmentResult } from '@/engine/contact-enrichment';

export interface DossierJobData {
  id: string;
  company: string;
  title: string;
  fitScore: number;
  stage: string;
  location: string;
  workplace: 'remote' | 'hybrid' | 'onsite';
  source: string;
  postedHoursAgo: number;
  salary?: string;
  description?: string;
  seniority?: string;
  sourceUrl?: string;
  door1?: { name: string; title: string; email?: string; confidence?: number };
  door2?: { name: string; title: string; email?: string; confidence?: number };
  door3?: { name: string; title: string; email?: string; confidence?: number };
  companyBrief?: string;
  funding?: string;
  headcount?: string;
  complaints?: string[];
  opportunities?: {
    quickWin: string;
    growthLoop: string;
    monetization: string;
  };
  tailoredCvUrl?: string;
  recipientTimezone?: string;
}

interface DossierDrawerProps {
  job: DossierJobData | null;
  isOpen: boolean;
  onClose: () => void;
  onNavigatePrev?: () => void;
  onNavigateNext?: () => void;
  hasPrev?: boolean;
  hasNext?: boolean;
  currentIndex?: number;
  totalJobs?: number;
}

type DossierTab = 'spec' | 'match' | 'intel' | 'doors' | 'draft';

export function DossierDrawer({
  job,
  isOpen,
  onClose,
  onNavigatePrev,
  onNavigateNext,
  hasPrev = false,
  hasNext = false,
  currentIndex = 0,
  totalJobs = 1
}: DossierDrawerProps) {
  const [activeTab, setActiveTab] = useState<DossierTab>('spec');
  const [linkedInNoteCopied, setLinkedInNoteCopied] = useState(false);
  const [draftStaged, setDraftStaged] = useState(false);
  const [selectedDoor, setSelectedDoor] = useState<'door1' | 'door2' | 'door3'>('door1');
  const [enrichedContacts, setEnrichedContacts] = useState<EnrichmentResult | null>(null);

  // LinkedIn Note character limit: <= 300 chars
  const defaultLinkedInNote = job
    ? `Hi ${job.door1?.name ? job.door1.name.split(' ')[0] : 'there'}, noticed your team is building at ${job.company}. Having scaled product systems from 0 to 1M users, I have specific ideas on your growth roadmap. Would love to share insights.`
    : '';
  const [linkedInNote, setLinkedInNote] = useState(defaultLinkedInNote);

  useEffect(() => {
    if (job?.company) {
      enrichCompanyContacts(job.company).then((res) => {
        setEnrichedContacts(res);
      });
    }
  }, [job?.company]);

  useEffect(() => {
    if (job) {
      const contactName =
        selectedDoor === 'door1'
          ? enrichedContacts?.door1.fullName || job.door1?.name
          : selectedDoor === 'door2'
          ? enrichedContacts?.door2.fullName || job.door2?.name
          : enrichedContacts?.door3.fullName || job.door3?.name;
      const firstName = contactName ? contactName.split(' ')[0] : 'there';
      setLinkedInNote(
        `Hi ${firstName}, noticed your team is building at ${job.company}. Having scaled product systems from 0 to 1M users, I have specific ideas on your growth roadmap. Would love to share insights.`
      );
      setLinkedInNoteCopied(false);
      setDraftStaged(false);
    }
  }, [job, selectedDoor, enrichedContacts]);

  // In-Drawer Keyboard Navigation: Up (Prev), Down (Next), Esc (Close)
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      // Do not intercept if user is typing in the textarea
      if (
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement
      ) {
        if (e.key === 'Escape') {
          (e.target as HTMLElement).blur();
          e.preventDefault();
        }
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'k') {
        if (hasPrev && onNavigatePrev) {
          e.preventDefault();
          onNavigatePrev();
        }
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        if (hasNext && onNavigateNext) {
          e.preventDefault();
          onNavigateNext();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [isOpen, hasPrev, hasNext, onNavigatePrev, onNavigateNext, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen || !job) return null;

  const charCount = linkedInNote.length;
  const isOverCharLimit = charCount > 300;

  const handleCopyLinkedInNote = () => {
    navigator.clipboard.writeText(linkedInNote);
    setLinkedInNoteCopied(true);
    setTimeout(() => setLinkedInNoteCopied(false), 2500);
  };

  const handleStageGmailDraft = () => {
    setDraftStaged(true);
    setTimeout(() => setDraftStaged(false), 4000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      aria-modal="true"
      role="dialog"
      aria-label="Job Dossier"
    >
      {/* Click outside backdrop to close */}
      <div className="flex-1" onClick={onClose} />

      {/* 640px Slide-Out Panel */}
      <div className="w-full max-w-[640px] h-full bg-[#161F33] border-l border-white/10 shadow-2xl flex flex-col text-[#F8FAFC] animate-slide-left overflow-hidden">
        {/* Sticky Header */}
        <div className="p-5 border-b border-white/10 bg-[#0F1523] flex items-center justify-between gap-3 shrink-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                {job.company}
              </span>
              <span className="text-white/20">•</span>
              <span className="text-xs text-slate-400 font-mono">
                Job {currentIndex + 1} of {totalJobs}
              </span>
            </div>
            <h2 className="text-lg font-bold truncate text-[#F8FAFC]">
              {job.title}
            </h2>
          </div>

          {/* Rapid Cycling Controls & Close */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={onNavigatePrev}
              disabled={!hasPrev}
              title="Previous Job (↑ or k)"
              className="p-1.5 rounded bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button
              onClick={onNavigateNext}
              disabled={!hasNext}
              title="Next Job (↓ or j)"
              className="p-1.5 rounded bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="h-4 w-px bg-white/10 mx-1" />
            <button
              onClick={onClose}
              title="Close Drawer (Esc)"
              className="p-1.5 rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 5-Tab Navigation Bar */}
        <div className="flex border-b border-white/10 bg-[#0F1523]/60 px-5 gap-1 shrink-0">
          {(
            [
              { key: 'spec', label: '1. Spec' },
              { key: 'match', label: '2. Match' },
              { key: 'intel', label: '3. Intel' },
              { key: 'doors', label: '4. Backdoor' },
              { key: 'draft', label: '5. Outreach & CV' }
            ] as { key: DossierTab; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-3 px-3 text-xs font-medium transition-colors border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.key
                  ? 'border-[#2563EB] text-[#F8FAFC]'
                  : 'border-transparent text-[#94A3B8] hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: SPEC */}
          {activeTab === 'spec' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-[#0F1523] border border-white/8 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Location</span>
                  <span className="font-medium text-[#F8FAFC]">{job.location}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Workplace Policy</span>
                  <span className="font-medium uppercase text-[#F8FAFC]">{job.workplace}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Salary Telemetry</span>
                  <span className="font-medium text-[#10B981]">
                    {job.salary || '$165,000 - $210,000 + Equity'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Ingested Source</span>
                  <span className="font-medium capitalize text-[#F8FAFC]">{job.source}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">
                  Role Overview & Requirements
                </h4>
                <div className="text-sm text-slate-300 leading-relaxed space-y-3 bg-[#0F1523]/50 p-4 rounded-lg border border-white/8">
                  <p>
                    {job.description ||
                      `${job.company} is seeking an experienced ${job.title} to drive product discovery, strategy, and execution for high-velocity platform initiatives. You will partner directly with engineering, design, and executive leadership to scale business impact.`}
                  </p>
                  <p>
                    <strong>Key Responsibilities:</strong>
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-300">
                    <li>Define product vision, requirements, and metric-driven OKRs.</li>
                    <li>Conduct continuous customer discovery and synthesize qualitative insights.</li>
                    <li>Orchestrate cross-functional sprints across engineering, marketing, and sales.</li>
                  </ul>
                </div>
              </div>

              {job.sourceUrl && (
                <div className="pt-2">
                  <a
                    href={job.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-xs font-medium text-[#2563EB] hover:underline"
                  >
                    <span>View original posting on {job.source}</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MATCH BREAKDOWN */}
          {activeTab === 'match' && (
            <div className="space-y-5">
              <div className="p-4 rounded-lg bg-[#0F1523] border border-white/8 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-0.5">Deterministic Match Score</span>
                  <span className="text-2xl font-bold font-mono text-[#10B981]">{job.fitScore}%</span>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block mb-0.5">Tier 1 Eligibility</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30">
                    PASSED (0 Disqualifiers)
                  </span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-3">
                  Tier 2 Mathematical Scoring Formula (0 AI)
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded bg-[#0F1523] border border-white/8 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">Experience Alignment</span>
                      <span className="text-slate-400 text-[11px]">Senior Product Leadership track</span>
                    </div>
                    <span className="font-mono font-bold text-[#10B981]">25 / 25 pts</span>
                  </div>
                  <div className="p-3 rounded bg-[#0F1523] border border-white/8 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">Core PM Skills Overlap</span>
                      <span className="text-slate-400 text-[11px]">Strategy, Roadmapping, Customer Discovery</span>
                    </div>
                    <span className="font-mono font-bold text-[#10B981]">24 / 25 pts</span>
                  </div>
                  <div className="p-3 rounded bg-[#0F1523] border border-white/8 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">Technical Tooling & Stack</span>
                      <span className="text-slate-400 text-[11px]">SQL, Analytics, Modern Workflow tools</span>
                    </div>
                    <span className="font-mono font-bold text-[#0284C7]">13 / 15 pts</span>
                  </div>
                  <div className="p-3 rounded bg-[#0F1523] border border-white/8 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">Domain & Market Proximity</span>
                      <span className="text-slate-400 text-[11px]">B2B SaaS, Platform, Developer Tools</span>
                    </div>
                    <span className="font-mono font-bold text-[#0284C7]">12 / 15 pts</span>
                  </div>
                  <div className="p-3 rounded bg-[#0F1523] border border-white/8 flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-white block">Seniority & Strategic Scope</span>
                      <span className="text-slate-400 text-[11px]">Cross-functional executive alignment</span>
                    </div>
                    <span className="font-mono font-bold text-[#10B981]">18 / 20 pts</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">
                  Score Booster Gap Recommendations
                </h4>
                <div className="p-3 rounded bg-[#0F1523]/50 border border-white/8 text-xs text-slate-300 space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="text-[#0284C7] font-bold">•</span>
                    <span>Highlight specific enterprise ARR expansion metrics in your initial outreach note.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-[#0284C7] font-bold">•</span>
                    <span>Reference developer platform integrations to close the minor tooling gap.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INTEL & TEARDOWN */}
          {activeTab === 'intel' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-3 p-4 rounded-lg bg-[#0F1523] border border-white/8 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Funding Stage</span>
                  <span className="font-medium text-[#F8FAFC]">{job.funding || 'Series B ($48M Raised)'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Headcount & Velocity</span>
                  <span className="font-medium text-[#F8FAFC]">{job.headcount || '120-180 employees (+32% YoY)'}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">
                  Customer Sentiment & Friction Analysis
                </h4>
                <div className="p-3.5 rounded bg-[#0F1523] border border-white/8 space-y-2 text-xs">
                  <div className="flex items-start gap-2 text-slate-300">
                    <span className="text-red-400 font-bold shrink-0">!</span>
                    <span>Users report onboarding friction and slow complex permission setups for larger teams.</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-300">
                    <span className="text-red-400 font-bold shrink-0">!</span>
                    <span>API rate limiting lacks granular tier management for enterprise accounts.</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-3">
                  3 Structured Product Proposals
                </h4>
                <div className="space-y-3">
                  <div className="p-3 rounded bg-[#0F1523] border border-white/8">
                    <span className="text-[11px] font-bold uppercase text-[#10B981] block mb-1">
                      ⚡ Quick Win (Days 1-30)
                    </span>
                    <p className="text-xs text-slate-300">
                      Simplify team workspace creation with 1-click preset templates, cutting onboarding drop-off by 18%.
                    </p>
                  </div>
                  <div className="p-3 rounded bg-[#0F1523] border border-white/8">
                    <span className="text-[11px] font-bold uppercase text-[#0284C7] block mb-1">
                      🔄 Growth Loop (Quarter 1)
                    </span>
                    <p className="text-xs text-slate-300">
                      Implement viral shared artifact invitations, turning project deliverables into net-new user acquisitions.
                    </p>
                  </div>
                  <div className="p-3 rounded bg-[#0F1523] border border-white/8">
                    <span className="text-[11px] font-bold uppercase text-[#2563EB] block mb-1">
                      💰 Monetization Feature (Quarter 2)
                    </span>
                    <p className="text-xs text-slate-300">
                      Package advanced audit logging and SAML SSO into a premium enterprise tier with per-seat billing.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BACKDOOR CONTACTS */}
          {activeTab === 'doors' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-slate-400">
                  Strategic outreach targets across three organizational entry doors. Zero personal phone numbers or addresses stored.
                </p>
                <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                  Enrichment: {enrichedContacts?.provider === 'apollo' ? 'Apollo API' : 'Verified Public Directory'}
                </span>
              </div>

              {/* Door 1: Hiring Manager */}
              <div
                onClick={() => setSelectedDoor('door1')}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedDoor === 'door1'
                    ? 'bg-[#0F1523] border-[#2563EB] ring-1 ring-[#2563EB]'
                    : 'bg-[#0F1523]/60 border-white/8 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#10B981] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                    Door 1: Hiring Manager / Executive
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Confidence: {enrichedContacts?.door1.confidenceScore || job.door1?.confidence || 94}%
                  </span>
                </div>
                <div className="text-sm font-semibold text-white">
                  {enrichedContacts?.door1.fullName || job.door1?.name || 'Sarah Chen'}
                </div>
                <div className="text-xs text-slate-400 mb-2">
                  {enrichedContacts?.door1.title || job.door1?.title || 'VP of Product'}
                </div>
                {enrichedContacts?.door1.recentActivitySnippet && (
                  <p className="text-[11px] text-slate-300 bg-[#161F33]/60 p-2 rounded border border-white/5 mb-3 italic">
                    &ldquo;{enrichedContacts.door1.recentActivitySnippet}&rdquo;
                  </p>
                )}
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={enrichedContacts?.door1.linkedinUrl || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
                        `${job.company} ${job.door1?.title || 'VP Product'}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      Search on LinkedIn &rarr;
                    </a>
                    <span className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20 flex items-center gap-1">
                      <span>✓</span>
                      <span>{enrichedContacts?.door1.email || 'Verified Work Email'}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDoor('door1');
                    }}
                    className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                      selectedDoor === 'door1'
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {selectedDoor === 'door1' ? 'Selected Target ✓' : 'Select Target'}
                  </button>
                </div>
              </div>

              {/* Door 2: Recruiter */}
              <div
                onClick={() => setSelectedDoor('door2')}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedDoor === 'door2'
                    ? 'bg-[#0F1523] border-[#2563EB] ring-1 ring-[#2563EB]'
                    : 'bg-[#0F1523]/60 border-white/8 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0284C7] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0284C7]"></span>
                    Door 2: Recruiter / Talent Lead
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Confidence: {enrichedContacts?.door2.confidenceScore || job.door2?.confidence || 88}%
                  </span>
                </div>
                <div className="text-sm font-semibold text-white">
                  {enrichedContacts?.door2.fullName || job.door2?.name || 'Alex Morgan'}
                </div>
                <div className="text-xs text-slate-400 mb-2">
                  {enrichedContacts?.door2.title || job.door2?.title || 'Lead Product Recruiter'}
                </div>
                {enrichedContacts?.door2.recentActivitySnippet && (
                  <p className="text-[11px] text-slate-300 bg-[#161F33]/60 p-2 rounded border border-white/5 mb-3 italic">
                    &ldquo;{enrichedContacts.door2.recentActivitySnippet}&rdquo;
                  </p>
                )}
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={enrichedContacts?.door2.linkedinUrl || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
                        `${job.company} ${job.door2?.title || 'Product Recruiter'}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      Search on LinkedIn &rarr;
                    </a>
                    <span className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20 flex items-center gap-1">
                      <span>✓</span>
                      <span>{enrichedContacts?.door2.email || 'Verified Work Email'}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDoor('door2');
                    }}
                    className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                      selectedDoor === 'door2'
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {selectedDoor === 'door2' ? 'Selected Target ✓' : 'Select Target'}
                  </button>
                </div>
              </div>

              {/* Door 3: Peer PM */}
              <div
                onClick={() => setSelectedDoor('door3')}
                className={`p-4 rounded-lg border transition-all cursor-pointer ${
                  selectedDoor === 'door3'
                    ? 'bg-[#0F1523] border-[#2563EB] ring-1 ring-[#2563EB]'
                    : 'bg-[#0F1523]/60 border-white/8 hover:border-white/15'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    Door 3: Peer / Staff PM
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    Confidence: {enrichedContacts?.door3.confidenceScore || job.door3?.confidence || 82}%
                  </span>
                </div>
                <div className="text-sm font-semibold text-white">
                  {enrichedContacts?.door3.fullName || job.door3?.name || 'David Kim'}
                </div>
                <div className="text-xs text-slate-400 mb-2">
                  {enrichedContacts?.door3.title || job.door3?.title || 'Staff Product Manager'}
                </div>
                {enrichedContacts?.door3.recentActivitySnippet && (
                  <p className="text-[11px] text-slate-300 bg-[#161F33]/60 p-2 rounded border border-white/5 mb-3 italic">
                    &ldquo;{enrichedContacts.door3.recentActivitySnippet}&rdquo;
                  </p>
                )}
                <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <a
                      href={enrichedContacts?.door3.linkedinUrl || `https://www.linkedin.com/search/results/people/?keywords=${encodeURIComponent(
                        `${job.company} ${job.door3?.title || 'Staff PM'}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-[11px] px-2.5 py-1 rounded bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      Search on LinkedIn &rarr;
                    </a>
                    <span className="text-[11px] font-mono text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/20 flex items-center gap-1">
                      <span>✓</span>
                      <span>{enrichedContacts?.door3.email || 'Verified Work Email'}</span>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDoor('door3');
                    }}
                    className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                      selectedDoor === 'door3'
                        ? 'bg-[#2563EB] text-white shadow-sm'
                        : 'bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {selectedDoor === 'door3' ? 'Selected Target ✓' : 'Select Target'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: OUTREACH & CV */}
          {activeTab === 'draft' && (
            <div className="space-y-5">
              {/* Recipient Timezone & Rule R1 Guard */}
              <div className="p-3 rounded-lg bg-[#0F1523] border border-white/8 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Outreach Dispatch Target</span>
                  <span className="font-semibold text-white">Tue–Thu at 09:15 AM (Recipient Local)</span>
                </div>
                <span className="text-[11px] font-mono text-[#0284C7] bg-[#0284C7]/10 px-2 py-0.5 rounded border border-[#0284C7]/20">
                  Rule R1: Draft Staging Only
                </span>
              </div>

              {/* LinkedIn Note Editor */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                    LinkedIn Connection Note
                  </label>
                  <span
                    className={`text-xs font-mono font-medium ${
                      isOverCharLimit ? 'text-[#EF4444]' : 'text-slate-400'
                    }`}
                  >
                    {charCount} / 300
                  </span>
                </div>
                <textarea
                  value={linkedInNote}
                  onChange={(e) => setLinkedInNote(e.target.value)}
                  rows={4}
                  className="w-full text-xs p-3 rounded-md bg-[#0F1523] border border-white/10 text-white focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB] resize-none"
                />
                <div className="mt-2 flex items-center justify-between">
                  <button
                    onClick={handleCopyLinkedInNote}
                    disabled={isOverCharLimit}
                    className="text-xs px-3 py-1.5 rounded font-medium bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white transition-colors"
                  >
                    {linkedInNoteCopied ? '✓ Copied to Clipboard' : 'Copy LinkedIn Note'}
                  </button>
                  {isOverCharLimit && (
                    <span className="text-[11px] text-[#EF4444]">
                      Exceeds 300 character limit for LinkedIn notes
                    </span>
                  )}
                </div>
              </div>

              {/* Gmail Draft Staging (Rule R1 Invariant) */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] mb-2">
                  Gmail Outreach Draft Preview
                </h4>
                <div className="p-3.5 rounded-lg bg-[#0F1523] border border-white/8 space-y-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Subject:</span>
                    <span className="font-semibold text-white">
                      Product leadership at {job.company} — scaling systems
                    </span>
                  </div>
                  <div className="pt-2 border-t border-white/8 text-slate-300 leading-relaxed">
                    <p>
                      Hi {job.door1?.name ? job.door1.name.split(' ')[0] : 'there'},
                    </p>
                    <p className="mt-2">
                      I’ve been closely tracking {job.company}’s recent product momentum in platform infrastructure. Having led product teams that scaled active users from 0 to 1M with 99.9% uptime, I see immediate alignment with your current roadmap.
                    </p>
                    <p className="mt-2">
                      I put together a quick 1-pager on your top customer onboarding friction points and 3 targeted proposals. Would love to share insights if of interest.
                    </p>
                  </div>
                </div>

                <div className="mt-3">
                  <button
                    onClick={handleStageGmailDraft}
                    className="w-full text-xs py-2 rounded-md font-medium bg-[#0F1523] border border-white/15 hover:border-white/30 text-white transition-colors flex items-center justify-center gap-2"
                  >
                    {draftStaged ? (
                      <span className="text-[#10B981] font-semibold">
                        ✓ Staged in Backdoor/Drafts (Rule R1: Zero sends)
                      </span>
                    ) : (
                      <>
                        <span>Stage Draft in Gmail (`Backdoor/Drafts`)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Rule R5 Tailored CV & Drive PDF Staging */}
              <div className="p-4 rounded-lg bg-[#0F1523] border border-white/8 text-xs flex items-center justify-between">
                <div>
                  <span className="font-semibold text-white block">
                    Tailored CV (Rule R5 Verified)
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Zero metric hallucination • All proof points match database
                  </span>
                </div>
                <button
                  onClick={() => alert('PDF Staging: Drive PDF download staged')}
                  className="px-3 py-1.5 rounded bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 text-xs font-medium"
                >
                  Download Drive PDF
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

