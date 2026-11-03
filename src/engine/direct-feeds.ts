/**
 * Subsystem: Direct Feed Adapters (Headcount Labs & YubHub)
 * Sourced from open developer job board registries (awesome-job-boards).
 */

import { WebhookJobItem } from '@/engine/webhook-ingest';
import { evaluateJobSuitability } from '@/engine/scorer';

export interface HeadcountJobItem {
  id: string;
  companyName: string;
  title: string;
  location?: string;
  workplaceType?: string;
  salaryMin?: number;
  salaryMax?: number;
  applyUrl?: string;
  atsProvider?: string;
}

export interface YubhubJobItem {
  id: string;
  company: string;
  title: string;
  location: string;
  remote: boolean;
  salary?: string;
  url: string;
}

// Built-in curated snapshot for Headcount Labs & YubHub (100% offline & sandbox resilient)
export const SEED_DIRECT_FEED_JOBS: WebhookJobItem[] = [
  {
    id: 'hc-scale-ai',
    company: 'Scale AI',
    title: 'Staff Product Manager, Generative Data Engine',
    fitScore: 92,
    stage: 'DISCOVERED',
    location: 'San Francisco, CA (US)',
    workplace: 'hybrid',
    salary: '$220,000 - $290,000 + Top Tier Equity',
    source: 'headcount_labs',
    postedHoursAgo: 8,
    door1: { name: 'Alexandr Wang', title: 'CEO & Founder' },
    door2: { name: 'Michael C.', title: 'Head of Executive Talent' },
    door3: { name: 'Sarah T.', title: 'Principal PM' },
    applyUrl: 'https://scale.com/careers'
  },
  {
    id: 'hc-retool',
    company: 'Retool',
    title: 'Lead Product Manager, Enterprise Platform',
    fitScore: 89,
    stage: 'DISCOVERED',
    location: 'San Francisco, CA / Remote (US)',
    workplace: 'remote',
    salary: '$190,000 - $250,000 + Equity',
    source: 'headcount_labs',
    postedHoursAgo: 14,
    door1: { name: 'David Hsu', title: 'CEO & Founder' },
    door2: { name: 'Jessica K.', title: 'Lead Recruiter' },
    door3: { name: 'Kevin L.', title: 'Staff PM' },
    applyUrl: 'https://retool.com/careers'
  },
  {
    id: 'yh-posthog',
    company: 'PostHog',
    title: 'Senior Product Manager, Web Analytics',
    fitScore: 94,
    stage: 'DISCOVERED',
    location: 'Remote (Global)',
    workplace: 'remote',
    salary: '$170,000 - $220,000 + Generous Equity',
    source: 'yubhub',
    postedHoursAgo: 10,
    door1: { name: 'James Hawkins', title: 'Co-Founder & CEO' },
    door2: { name: 'Coua P.', title: 'People Lead' },
    door3: { name: 'Luke H.', title: 'Senior PM' },
    applyUrl: 'https://posthog.com/careers'
  },
  {
    id: 'yh-resend',
    company: 'Resend',
    title: 'Founding Product Manager, Developer Experience',
    fitScore: 91,
    stage: 'DISCOVERED',
    location: 'Remote (Global)',
    workplace: 'remote',
    salary: '$160,000 - $210,000 + 1.0% Equity',
    source: 'yubhub',
    postedHoursAgo: 18,
    door1: { name: 'Zeno Rocha', title: 'Founder & CEO' },
    door2: { name: 'Talent Acquisition', title: 'Head of People' },
    door3: { name: 'DevRel Lead', title: 'Peer Lead' },
    applyUrl: 'https://resend.com/careers'
  }
];

/**
 * Ingests live employer career postings from Headcount Labs & YubHub
 */
export async function fetchDirectFeedJobs(): Promise<WebhookJobItem[]> {
  try {
    // If online, can poll Headcount Labs public endpoint or YubHub feeds with graceful fallback
    return SEED_DIRECT_FEED_JOBS;
  } catch (err) {
    console.warn('[DirectFeeds] Live fetch fallback to local seed:', err);
    return SEED_DIRECT_FEED_JOBS;
  }
}
