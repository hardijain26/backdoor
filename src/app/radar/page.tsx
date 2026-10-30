'use client';

import React, { useState, useMemo, useRef } from 'react';
import { useTableKeyboardNav } from '@/components/useTableKeyboardNav';
import { ThreeDoorsChips } from '@/components/ThreeDoorsChips';
import { DossierDrawer } from '@/components/dossier/DossierDrawer';

export interface RadarJobItem {
  id: string;
  company: string;
  title: string;
  fitScore: number;
  stage: 'DISCOVERED' | 'CHOSEN' | 'SKIPPED';
  location: string;
  workplace: 'remote' | 'hybrid' | 'onsite';
  source: string;
  postedHoursAgo: number;
  door1?: { name: string; title: string };
  door2?: { name: string; title: string };
  door3?: { name: string; title: string };
}

const INITIAL_RADAR_JOBS: RadarJobItem[] = [
  {
    id: 'job-1',
    company: 'Stripe',
    title: 'Staff AI Product Manager',
    fitScore: 94,
    stage: 'DISCOVERED',
    location: 'Remote (US/EU)',
    workplace: 'remote',
    source: 'greenhouse',
    postedHoursAgo: 2,
    door1: { name: 'David S.', title: 'Head of Product' },
    door2: { name: 'Sarah L.', title: 'Lead Recruiter' },
    door3: { name: 'Alex M.', title: 'Staff PM' }
  },
  {
    id: 'job-2',
    company: 'Linear',
    title: 'Lead Product Manager, Workflows',
    fitScore: 88,
    stage: 'DISCOVERED',
    location: 'Remote (Global)',
    workplace: 'remote',
    source: 'ashby',
    postedHoursAgo: 4,
    door1: { name: 'Karri S.', title: 'Co-Founder' },
    door2: { name: 'Elena R.', title: 'Talent Lead' }
  },
  {
    id: 'job-3',
    company: 'OpenAI',
    title: 'Product Manager, Applied Research',
    fitScore: 84,
    stage: 'DISCOVERED',
    location: 'San Francisco, CA',
    workplace: 'hybrid',
    source: 'greenhouse',
    postedHoursAgo: 6,
    door1: { name: 'Peter W.', title: 'VP Product' },
    door2: { name: 'Marcus K.', title: 'Staff Recruiter' },
    door3: { name: 'Nadia T.', title: 'Senior PM' }
  },
  {
    id: 'job-4',
    company: 'Figma',
    title: 'Senior Product Manager, Systems',
    fitScore: 82,
    stage: 'DISCOVERED',
    location: 'Remote (US)',
    workplace: 'remote',
    source: 'lever',
    postedHoursAgo: 8,
    door1: { name: 'Sho K.', title: 'Director of PM' },
    door2: { name: 'Jessica V.', title: 'Talent Partner' }
  },
  {
    id: 'job-5',
    company: 'Vercel',
    title: 'Senior PM, Developer Experience',
    fitScore: 79,
    stage: 'DISCOVERED',
    location: 'Remote (Global)',
    workplace: 'remote',
    source: 'workable',
    postedHoursAgo: 10,
    door1: { name: 'Guillermo R.', title: 'CEO' },
    door3: { name: 'Lee R.', title: 'VP DevRel' }
  },
  {
    id: 'job-6',
    company: 'Notion',
    title: 'AI Workspaces PM',
    fitScore: 76,
    stage: 'DISCOVERED',
    location: 'San Francisco, CA',
    workplace: 'hybrid',
    source: 'greenhouse',
    postedHoursAgo: 12,
    door2: { name: 'Rachel C.', title: 'Senior Recruiter' },
    door3: { name: 'Ivan Z.', title: 'Co-Founder' }
  },
  {
    id: 'job-7',
    company: 'Supabase',
    title: 'Lead Platform PM',
    fitScore: 74,
    stage: 'DISCOVERED',
    location: 'Remote (Global)',
    workplace: 'remote',
    source: 'yc_startup',
    postedHoursAgo: 14,
    door1: { name: 'Paul C.', title: 'CEO' },
    door2: { name: 'Rory W.', title: 'Head of People' }
  },
  {
    id: 'job-8',
    company: 'Anthropic',
    title: 'Product Manager, Core Interface',
    fitScore: 72,
    stage: 'DISCOVERED',
    location: 'San Francisco, CA',
    workplace: 'onsite',
    source: 'lever',
    postedHoursAgo: 18,
    door1: { name: 'Dario A.', title: 'CEO' },
    door2: { name: 'Maya B.', title: 'Talent Lead' },
    door3: { name: 'Chris O.', title: 'Research Lead' }
  }
];

export default function MorningRadarPage() {
  const [jobs, setJobs] = useState<RadarJobItem[]>(INITIAL_RADAR_JOBS);
  const [viewMode, setViewMode] = useState<'bento' | 'table'>('bento');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [selectedDrawerId, setSelectedDrawerId] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Filter out SKIPPED roles for active radar display, and match search query
  const visibleJobs = useMemo(() => {
    let list = jobs.filter((j) => j.stage !== 'SKIPPED');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (j) => j.company.toLowerCase().includes(q) || j.title.toLowerCase().includes(q)
      );
    }

    // Sort descending by fit score
    list.sort((a, b) => b.fitScore - a.fitScore);

    // Morning Radar filter: fit_score >= 70 & posted within 24 hours
    const radarHighSignal = list.filter((j) => j.fitScore >= 70 && j.postedHoursAgo <= 24);

    if (!isExpanded) {
      // Top 20 Capped
      return radarHighSignal.slice(0, 20);
    }

    return radarHighSignal;
  }, [jobs, searchQuery, isExpanded]);

  // Hook for single-key keyboard engine
  useTableKeyboardNav({
    rows: visibleJobs,
    selectedIndex,
    setSelectedIndex,
    onOpenDrawer: (rowId) => setSelectedDrawerId(rowId),
    onSkipRole: (rowId) => {
      setJobs((prev) =>
        prev.map((j) => (j.id === rowId ? { ...j, stage: 'SKIPPED' } : j))
      );
    },
    onChooseRole: (rowId) => {
      setJobs((prev) =>
        prev.map((j) => (j.id === rowId ? { ...j, stage: 'CHOSEN' } : j))
      );
    },
    isDrawerOpen: !!selectedDrawerId,
    onCloseDrawer: () => setSelectedDrawerId(null),
    searchInputRef
  });

  // In-Drawer Rapid Candidate Cycling (Runbook §4.3)
  const selectedJobIndex = visibleJobs.findIndex((j) => j.id === selectedDrawerId);
  const selectedJob = selectedJobIndex !== -1 ? visibleJobs[selectedJobIndex] : null;

  const handleNavigatePrev = () => {
    if (selectedJobIndex > 0) {
      const prevJob = visibleJobs[selectedJobIndex - 1];
      setSelectedDrawerId(prevJob.id);
      setSelectedIndex(selectedJobIndex - 1);
    }
  };

  const handleNavigateNext = () => {
    if (selectedJobIndex < visibleJobs.length - 1) {
      const nextJob = visibleJobs[selectedJobIndex + 1];
      setSelectedDrawerId(nextJob.id);
      setSelectedIndex(selectedJobIndex + 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-[#F8FAFC] p-6 lg:p-8 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#F8FAFC]">
            Morning Radar
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Autonomous market surveillance across 35 sources (Top 20 roles, 24h window, Fit &ge; 70%).
          </p>
        </div>

        {/* View Switcher & Search Bar */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search roles (/)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0F1523] border border-white/10 rounded-md px-3 py-1.5 text-sm text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 md:w-64"
            />
          </div>

          {/* Dual View Switcher */}
          <div className="inline-flex bg-[#0F1523] border border-white/10 rounded-md p-0.5">
            <button
              onClick={() => setViewMode('bento')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'bento'
                  ? 'bg-blue-600 text-white'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              1:1 Bento
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'text-[#94A3B8] hover:text-white'
              }`}
            >
              Dense Table
            </button>
          </div>
        </div>
      </div>

      {/* Morning Radar Banner */}
      <div className="bg-[#0F1523] border border-white/10 rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span className="text-blue-500 text-lg">⚡</span>
          <span className="text-sm font-semibold tracking-wide text-[#F8FAFC]">
            MORNING RADAR: {visibleJobs.length} High-Signal Opportunities Discovered Today{' '}
            {!isExpanded && '(Top 20 Capped)'}
          </span>
        </div>
        <div className="text-xs text-[#94A3B8] flex items-center gap-2">
          <span>Shortcuts:</span>
          <kbd className="bg-[#161F33] border border-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono">j</kbd> down
          <kbd className="bg-[#161F33] border border-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono">k</kbd> up
          <kbd className="bg-[#161F33] border border-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono">Enter</kbd> dossier
          <kbd className="bg-[#161F33] border border-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono">s</kbd> skip
          <kbd className="bg-[#161F33] border border-white/10 px-1.5 py-0.5 rounded text-[11px] font-mono">c</kbd> choose
        </div>
      </div>

      {/* Content Rendering */}
      {visibleJobs.length === 0 ? (
        <div className="bg-[#0F1523] border border-white/10 rounded-lg p-12 text-center text-[#94A3B8]">
          <p className="text-base font-medium text-white">All Caught Up</p>
          <p className="text-sm mt-1">
            No new postings &ge; 70% in the last 24 hours. Your pipeline is up to date.
          </p>
        </div>
      ) : viewMode === 'bento' ? (
        /* 1:1 Bento Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {visibleJobs.map((job, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={job.id}
                onClick={() => {
                  setSelectedIndex(idx);
                  setSelectedDrawerId(job.id);
                }}
                className={`bg-[#0F1523] border rounded-lg p-5 flex flex-col justify-between aspect-square transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-blue-500 border-transparent shadow-lg shadow-blue-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Top Section: Company & Score Badge */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider">
                      {job.company}
                    </span>
                    <span
                      className={`text-xs font-mono font-semibold px-2 py-0.5 rounded ${
                        job.fitScore >= 70
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                          : 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                      }`}
                    >
                      {job.fitScore}% FIT
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-[#F8FAFC] mt-2 line-clamp-2">
                    {job.title}
                  </h3>
                  <p className="text-xs text-[#94A3B8] mt-1">
                    {job.location} &bull; <span className="capitalize">{job.workplace}</span>
                  </p>
                </div>

                {/* Bottom Section: Three Doors & Actions */}
                <div className="pt-3 border-t border-white/5 space-y-3">
                  <ThreeDoorsChips door1={job.door1} door2={job.door2} door3={job.door3} />

                  <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-1">
                    <span className="font-mono text-[11px]">{job.postedHoursAgo}h ago</span>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIndex(idx);
                          setSelectedDrawerId(job.id);
                        }}
                        className="px-2 py-0.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded font-medium border border-white/10 transition-colors"
                      >
                        Dossier &rarr;
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setJobs((prev) =>
                            prev.map((j) => (j.id === job.id ? { ...j, stage: 'SKIPPED' } : j))
                          );
                        }}
                        className="px-2 py-0.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded"
                      >
                        Skip
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setJobs((prev) =>
                            prev.map((j) => (j.id === job.id ? { ...j, stage: 'CHOSEN' } : j))
                          );
                        }}
                        className="px-2 py-0.5 text-xs bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
                      >
                        Choose
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dense Command Table */
        <div className="bg-[#0F1523] border border-white/10 rounded-lg overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#161F33] text-xs uppercase font-mono text-[#94A3B8] border-b border-white/10">
              <tr>
                <th className="py-2.5 px-3 w-8">#</th>
                <th className="py-2.5 px-3">Score</th>
                <th className="py-2.5 px-3">Company</th>
                <th className="py-2.5 px-3">Job Title</th>
                <th className="py-2.5 px-3">Location</th>
                <th className="py-2.5 px-3">Three Doors</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3 text-right">Age</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {visibleJobs.map((job, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <tr
                    key={job.id}
                    onClick={() => {
                      setSelectedIndex(idx);
                      setSelectedDrawerId(job.id);
                    }}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600/15 border-l-2 border-l-blue-500'
                        : 'hover:bg-white/[0.02]'
                    }`}
                  >
                    <td className="py-2 px-3 text-xs font-mono text-slate-500">
                      {isSelected ? '▶' : idx + 1}
                    </td>
                    <td className="py-2 px-3">
                      <span
                        className={`text-xs font-mono font-semibold px-1.5 py-0.5 rounded ${
                          job.fitScore >= 70
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-sky-500/15 text-sky-400'
                        }`}
                      >
                        {job.fitScore}%
                      </span>
                    </td>
                    <td className="py-2 px-3 font-semibold text-[#F8FAFC]">
                      {job.company}
                    </td>
                    <td className="py-2 px-3 text-[#F8FAFC]">
                      {job.title}
                    </td>
                    <td className="py-2 px-3 text-xs text-[#94A3B8]">
                      {job.location}
                    </td>
                    <td className="py-2 px-3">
                      <ThreeDoorsChips door1={job.door1} door2={job.door2} door3={job.door3} />
                    </td>
                    <td className="py-2 px-3 text-xs font-mono text-slate-400">
                      {job.source}
                    </td>
                    <td className="py-2 px-3 text-xs font-mono text-right text-slate-400">
                      {job.postedHoursAgo}h
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIndex(idx);
                          setSelectedDrawerId(job.id);
                        }}
                        className="px-2 py-0.5 text-xs bg-white/10 hover:bg-white/20 text-white rounded font-medium border border-white/10 transition-colors"
                      >
                        Dossier &rarr;
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Expand Toggle */}
      {visibleJobs.length >= 20 && !isExpanded && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="bg-[#0F1523] border border-white/10 hover:border-white/20 text-[#F8FAFC] text-sm px-4 py-2 rounded-md font-medium transition-colors"
          >
            See all roles &ge; 70%
          </button>
        </div>
      )}

      {/* 640px Slide-Out Dossier Drawer (Runbook §4.3) */}
      <DossierDrawer
        job={selectedJob}
        isOpen={Boolean(selectedDrawerId && selectedJob)}
        onClose={() => setSelectedDrawerId(null)}
        onNavigatePrev={handleNavigatePrev}
        onNavigateNext={handleNavigateNext}
        hasPrev={selectedJobIndex > 0}
        hasNext={selectedJobIndex < visibleJobs.length - 1}
        currentIndex={selectedJobIndex >= 0 ? selectedJobIndex : 0}
        totalJobs={visibleJobs.length}
      />
    </div>
  );
}
