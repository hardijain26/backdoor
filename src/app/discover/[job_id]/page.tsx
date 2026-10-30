'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { DossierDrawer, DossierJobData } from '@/components/dossier/DossierDrawer';

// Mock catalog for standalone direct route loads
const SAMPLE_JOBS: Record<string, DossierJobData> = {
  'job-1': {
    id: 'job-1',
    company: 'Stripe',
    title: 'Staff Product Manager, Global Payouts',
    fitScore: 94,
    stage: 'DISCOVERED',
    location: 'San Francisco, CA',
    workplace: 'hybrid',
    source: 'greenhouse',
    postedHoursAgo: 2,
    salary: '$210,000 - $265,000 + Equity',
    seniority: 'Staff (L6+)',
    door1: { name: 'Claire H.', title: 'Head of Global Money Movement', confidence: 96 },
    door2: { name: 'David M.', title: 'Lead Tech Recruiter', confidence: 91 },
    door3: { name: 'Erica L.', title: 'Staff PM, Billing Core', confidence: 85 }
  },
  'job-2': {
    id: 'job-2',
    company: 'Linear',
    title: 'Product Lead, Insights & Workflows',
    fitScore: 88,
    stage: 'DISCOVERED',
    location: 'Remote (US/EU)',
    workplace: 'remote',
    source: 'ashby',
    postedHoursAgo: 4,
    salary: '$190,000 - $230,000 + Top Tier Equity',
    seniority: 'Principal / Lead',
    door1: { name: 'Karri S.', title: 'Head of Product', confidence: 94 },
    door2: { name: 'Tuomas A.', title: 'Co-Founder & CEO', confidence: 89 }
  }
};

export default function StandaloneDossierPage({
  params
}: {
  params: Promise<{ job_id: string }>;
}) {
  const unwrappedParams = use(params);
  const jobId = unwrappedParams.job_id;
  const job = SAMPLE_JOBS[jobId] || {
    id: jobId,
    company: 'Technology Leader',
    title: 'Principal Product Manager',
    fitScore: 85,
    stage: 'DISCOVERED',
    location: 'Remote',
    workplace: 'remote' as const,
    source: 'direct',
    postedHoursAgo: 3
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-[#F8FAFC] p-6 flex flex-col">
      <div className="max-w-4xl mx-auto w-full">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/radar"
            className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-white transition-colors"
          >
            &larr; Back to Morning Radar
          </Link>
          <span className="text-xs font-mono text-slate-400">
            Route: /discover/{jobId}
          </span>
        </div>

        {/* Embedded Full Dossier */}
        <div className="bg-[#161F33] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <DossierDrawer
            job={job}
            isOpen={true}
            onClose={() => {
              window.location.href = '/radar';
            }}
          />
        </div>
      </div>
    </div>
  );
}

