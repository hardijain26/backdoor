'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ThreeDoorsChips } from '@/components/ThreeDoorsChips';
import { DossierDrawer, DossierJobData } from '@/components/dossier/DossierDrawer';

interface PipelineJob extends DossierJobData {
  stage: 'DISCOVERED' | 'CHOSEN' | 'OUTREACH_STAGED' | 'APPLIED';
}

const SAMPLE_PIPELINE: PipelineJob[] = [
  {
    id: 'pipe-1',
    company: 'Stripe',
    title: 'Staff AI Product Manager',
    fitScore: 94,
    stage: 'CHOSEN',
    location: 'Remote (US/EU)',
    workplace: 'remote',
    source: 'greenhouse',
    postedHoursAgo: 2,
    salary: '$210k - $265k + Equity',
    door1: { name: 'David S.', title: 'Head of Product' },
    door2: { name: 'Sarah L.', title: 'Lead Recruiter' },
    door3: { name: 'Alex M.', title: 'Staff PM' }
  },
  {
    id: 'pipe-2',
    company: 'Linear',
    title: 'Lead Product Manager, Workflows',
    fitScore: 88,
    stage: 'CHOSEN',
    location: 'Remote (Global)',
    workplace: 'remote',
    source: 'ashby',
    postedHoursAgo: 4,
    salary: '$190k - $230k + Top Tier Equity',
    door1: { name: 'Karri S.', title: 'Co-Founder' },
    door2: { name: 'Elena R.', title: 'Talent Lead' }
  },
  {
    id: 'pipe-3',
    company: 'OpenAI',
    title: 'Product Manager, Applied Research',
    fitScore: 84,
    stage: 'OUTREACH_STAGED',
    location: 'San Francisco, CA',
    workplace: 'hybrid',
    source: 'greenhouse',
    postedHoursAgo: 6,
    salary: '$225k - $290k + Equity',
    door1: { name: 'Peter W.', title: 'VP Product' },
    door2: { name: 'Marcus K.', title: 'Staff Recruiter' },
    door3: { name: 'Nadia T.', title: 'Senior PM' }
  },
  {
    id: 'pipe-4',
    company: 'Figma',
    title: 'Senior Product Manager, Systems',
    fitScore: 82,
    stage: 'DISCOVERED',
    location: 'Remote (US)',
    workplace: 'remote',
    source: 'lever',
    postedHoursAgo: 8,
    salary: '$185k - $225k + Equity',
    door1: { name: 'Sho K.', title: 'Director of PM' },
    door2: { name: 'Jessica V.', title: 'Talent Partner' }
  }
];

export default function JobsPage() {
  const [pipelineJobs, setPipelineJobs] = useState<PipelineJob[]>(SAMPLE_PIPELINE);
  const [selectedDrawerId, setSelectedDrawerId] = useState<string | null>(null);

  const selectedJob = pipelineJobs.find((j) => j.id === selectedDrawerId) || null;

  const stages: Array<{ key: PipelineJob['stage']; label: string; count: number }> = [
    { key: 'DISCOVERED', label: '1. Discovered', count: pipelineJobs.filter((j) => j.stage === 'DISCOVERED').length },
    { key: 'CHOSEN', label: '2. Chosen for Action', count: pipelineJobs.filter((j) => j.stage === 'CHOSEN').length },
    { key: 'OUTREACH_STAGED', label: '3. Outreach Staged', count: pipelineJobs.filter((j) => j.stage === 'OUTREACH_STAGED').length },
    { key: 'APPLIED', label: '4. Applied / In Flight', count: pipelineJobs.filter((j) => j.stage === 'APPLIED').length }
  ];

  return (
    <div className="min-h-screen bg-[#080B11] text-[#F8FAFC] p-6 lg:p-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#F8FAFC]">
            Opportunity Pipeline
          </h1>
          <p className="text-sm text-[#94A3B8] mt-1">
            Active application lifecycle tracking from initial radar triage to executive outreach.
          </p>
        </div>

        <Link
          href="/radar"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm transition-colors"
        >
          <span>&larr; Morning Radar</span>
        </Link>
      </div>

      {/* 4 Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {stages.map((stage) => {
          const stageJobs = pipelineJobs.filter((j) => j.stage === stage.key);
          return (
            <div
              key={stage.key}
              className="bg-[#0F1523] border border-white/10 rounded-lg p-4 flex flex-col gap-3 min-h-[480px]"
            >
              <div className="flex items-center justify-between border-b border-white/8 pb-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  {stage.label}
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400">
                  {stage.count}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageJobs.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-500 border border-dashed border-white/8 rounded-lg">
                    No roles in this stage
                  </div>
                ) : (
                  stageJobs.map((job) => (
                    <div
                      key={job.id}
                      onClick={() => setSelectedDrawerId(job.id)}
                      className="bg-[#161F33] border border-white/8 hover:border-white/20 p-3.5 rounded-lg cursor-pointer transition-all shadow-sm space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-medium text-slate-400 uppercase">
                          {job.company}
                        </span>
                        <span className="text-[11px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                          {job.fitScore}%
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-white line-clamp-1">
                        {job.title}
                      </div>
                      <div className="text-xs text-slate-400">
                        {job.location} &bull; <span className="capitalize">{job.workplace}</span>
                      </div>
                      <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                        <ThreeDoorsChips door1={job.door1} door2={job.door2} door3={job.door3} />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDrawerId(job.id);
                          }}
                          className="text-[11px] text-[#2563EB] hover:underline font-medium"
                        >
                          Dossier &rarr;
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Dossier Drawer */}
      <DossierDrawer
        job={selectedJob}
        isOpen={Boolean(selectedDrawerId && selectedJob)}
        onClose={() => setSelectedDrawerId(null)}
      />
    </div>
  );
}
