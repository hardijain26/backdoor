'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useTableKeyboardNav } from '@/components/useTableKeyboardNav';
import { ThreeDoorsChips } from '@/components/ThreeDoorsChips';
import { DossierDrawer, DossierJobData } from '@/components/dossier/DossierDrawer';
import { UniversalIngestModal } from '@/components/ingest/UniversalIngestModal';
import { ImportModal } from '@/components/ingest/ImportModal';
import { formatSourceLabel } from '@/engine/gmail-ingest';
import { useDataMode, DataModeToggle } from '@/components/DataModeToggle';
import { getLiveJobs, saveLiveJobs } from '@/engine/data-mode';

export interface RadarJobItem {
  id: string;
  company: string;
  title: string;
  fitScore: number;
  stage: 'DISCOVERED' | 'CHOSEN' | 'SKIPPED';
  location: string;
  workplace: 'remote' | 'hybrid' | 'onsite';
  salary?: string;
  source: string;
  postedHoursAgo: number;
  door1?: { name: string; title: string };
  door2?: { name: string; title: string };
  door3?: { name: string; title: string };
}

const INITIAL_RADAR_JOBS: RadarJobItem[] = [
  // --- Past 24 Hours (Daily Crawl Opportunities) ---
  {
    id: 'job-1',
    company: 'Stripe',
    title: 'Staff AI Product Manager',
    fitScore: 94,
    stage: 'DISCOVERED',
    location: 'Remote (US/EU)',
    workplace: 'remote',
    salary: '$165,000 - $210,000 + Equity',
    source: 'greenhouse',
    postedHoursAgo: 2,
    door1: { name: 'David S.', title: 'Head of Product' },
    door2: { name: 'Sarah L.', title: 'Lead Recruiter' },
    door3: { name: 'Alex M.', title: 'Staff PM' }
  },
  {
    id: 'job-12',
    company: 'Anthropic',
    title: 'Safety & Frontier Model Alignment PM',
    fitScore: 92,
    stage: 'DISCOVERED',
    location: 'San Francisco, CA',
    workplace: 'hybrid',
    salary: '$205,000 - $285,000 + Top Tier Equity',
    source: 'lever',
    postedHoursAgo: 3,
    door1: { name: 'Daniela A.', title: 'VP Safety' },
    door2: { name: 'Maya B.', title: 'Talent Lead' },
    door3: { name: 'Jared K.', title: 'Research PM' }
  },
  {
    id: 'job-2',
    company: 'Linear',
    title: 'Lead Product Manager, Workflows',
    fitScore: 88,
    stage: 'DISCOVERED',
    location: 'Remote (Global)',
    workplace: 'remote',
    salary: '$150,000 - $195,000 + Equity',
    source: 'ashby',
    postedHoursAgo: 4,
    door1: { name: 'Karri S.', title: 'Co-Founder' },
    door2: { name: 'Elena R.', title: 'Talent Lead' }
  },
  {
    id: 'job-9',
    company: 'Datadog',
    title: 'Staff PM, Observability Intelligence',
    fitScore: 89,
    stage: 'DISCOVERED',
    location: 'Remote (US)',
    workplace: 'remote',
    salary: '$180,000 - $230,000 + Equity',
    source: 'greenhouse',
    postedHoursAgo: 5,
    door1: { name: 'Olivier P.', title: 'VP Product' },
    door2: { name: 'Chloe T.', title: 'Lead Recruiter' },
    door3: { name: 'Sam K.', title: 'Staff PM' }
  },
  {
    id: 'job-3',
    company: 'OpenAI',
    title: 'Product Manager, Applied Research',
    fitScore: 84,
    stage: 'DISCOVERED',
    location: 'San Francisco, CA',
    workplace: 'hybrid',
    salary: '$200,000 - $275,000 + Equity',
    source: 'greenhouse',
    postedHoursAgo: 6,
    door1: { name: 'Peter W.', title: 'VP Product' },
    door2: { name: 'Marcus K.', title: 'Staff Recruiter' },
    door3: { name: 'Nadia T.', title: 'Senior PM' }
  },
  {
    id: 'job-10',
    company: 'Snowflake',
    title: 'Principal PM, Cloud AI Platform',
    fitScore: 86,
    stage: 'DISCOVERED',
    location: 'San Mateo, CA',
    workplace: 'hybrid',
    salary: '$210,000 - $280,000 + Top Tier Equity',
    source: 'workday',
    postedHoursAgo: 7,
    door1: { name: 'Benoit D.', title: 'Fellow / Exec' },
    door2: { name: 'Tara M.', title: 'Director Talent' },
    door3: { name: 'Ryan L.', title: 'Principal PM' }
  },
  {
    id: 'job-4',
    company: 'Figma',
    title: 'Senior Product Manager, Systems',
    fitScore: 82,
    stage: 'DISCOVERED',
    location: 'Remote (US)',
    workplace: 'remote',
    salary: '$170,000 - $220,000 + Equity',
    source: 'lever',
    postedHoursAgo: 8,
    door1: { name: 'Sho K.', title: 'Director of PM' },
    door2: { name: 'Jessica V.', title: 'Talent Partner' }
  },
  {
    id: 'job-11',
    company: 'Cloudflare',
    title: 'Senior PM, Developer Workflows',
    fitScore: 83,
    stage: 'DISCOVERED',
    location: 'Remote (Global)',
    workplace: 'remote',
    salary: '$175,000 - $225,000 + Equity',
    source: 'lever',
    postedHoursAgo: 9,
    door1: { name: 'Matthew P.', title: 'CEO' },
    door2: { name: 'Jordan B.', title: 'Talent Partner' }
  },
  {
    id: 'job-5',
    company: 'Vercel',
    title: 'Senior PM, Developer Experience',
    fitScore: 79,
    stage: 'DISCOVERED',
    location: 'Remote (Global)',
    workplace: 'remote',
    salary: '$160,000 - $205,000 + Equity',
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
    salary: '$155,000 - $200,000 + Equity',
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
    salary: '$145,000 - $185,000 + Equity',
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
    salary: '$190,000 - $260,000 + Equity',
    source: 'lever',
    postedHoursAgo: 18,
    door1: { name: 'Dario A.', title: 'CEO' },
    door2: { name: 'Maya B.', title: 'Talent Lead' },
    door3: { name: 'Chris O.', title: 'Research Lead' }
  },

  // --- Past 15 Days Backfill (Initial Onboarding Crawl) ---
  {
    id: 'job-13',
    company: 'Cursor / Anysphere',
    title: 'Founding AI Product Lead',
    fitScore: 95,
    stage: 'DISCOVERED',
    location: 'San Francisco, CA',
    workplace: 'onsite',
    salary: '$220,000 - $300,000 + High Equity',
    source: 'yc_startup',
    postedHoursAgo: 36, // 1.5 days ago
    door1: { name: 'Michael T.', title: 'Co-Founder & CEO' },
    door2: { name: 'Aman S.', title: 'Co-Founder' }
  },
  {
    id: 'job-14',
    company: 'GitHub',
    title: 'Principal PM, Copilot Core Platform',
    fitScore: 91,
    stage: 'DISCOVERED',
    location: 'Remote (US)',
    workplace: 'remote',
    salary: '$195,000 - $250,000 + Bonus',
    source: 'greenhouse',
    postedHoursAgo: 48, // 2 days ago
    door1: { name: 'Thomas D.', title: 'CEO' },
    door2: { name: 'Erika V.', title: 'Director Talent' },
    door3: { name: 'Kyle N.', title: 'Staff PM' }
  },
  {
    id: 'job-15',
    company: 'Figma',
    title: 'Group Product Manager, Developer Ecosystem',
    fitScore: 87,
    stage: 'DISCOVERED',
    location: 'San Francisco, CA',
    workplace: 'hybrid',
    salary: '$210,000 - $270,000 + Equity',
    source: 'lever',
    postedHoursAgo: 72, // 3 days ago
    door1: { name: 'Dylan F.', title: 'CEO' },
    door2: { name: 'Jessica V.', title: 'Talent Partner' }
  },
  {
    id: 'job-16',
    company: 'Vercel',
    title: 'Staff PM, AI Gateway & v0 Edge',
    fitScore: 85,
    stage: 'DISCOVERED',
    location: 'Remote (Global)',
    workplace: 'remote',
    salary: '$180,000 - $240,000 + Equity',
    source: 'workable',
    postedHoursAgo: 120, // 5 days ago
    door1: { name: 'Guillermo R.', title: 'CEO' },
    door2: { name: 'Malte U.', title: 'VP Engineering' }
  },
  {
    id: 'job-17',
    company: 'Warp',
    title: 'Lead Product Manager, Developer Terminal',
    fitScore: 81,
    stage: 'DISCOVERED',
    location: 'New York, NY',
    workplace: 'hybrid',
    salary: '$170,000 - $215,000 + Equity',
    source: 'ashby',
    postedHoursAgo: 168, // 7 days ago
    door1: { name: 'Zach L.', title: 'Founder & CEO' },
    door2: { name: 'Claire H.', title: 'Head of People' }
  },
  {
    id: 'job-18',
    company: 'Retool',
    title: 'Senior PM, AI Workflows & Agents',
    fitScore: 78,
    stage: 'DISCOVERED',
    location: 'San Francisco, CA',
    workplace: 'hybrid',
    salary: '$165,000 - $210,000 + Equity',
    source: 'remotive',
    postedHoursAgo: 240, // 10 days ago
    door1: { name: 'David H.', title: 'CEO' },
    door2: { name: 'Pooja S.', title: 'Lead Recruiter' }
  },
  {
    id: 'job-19',
    company: 'Canva',
    title: 'Lead AI Platform PM',
    fitScore: 75,
    stage: 'DISCOVERED',
    location: 'Remote (US/Australia)',
    workplace: 'remote',
    salary: '$160,000 - $200,000 + Equity',
    source: 'remoteok',
    postedHoursAgo: 312, // 13 days ago
    door1: { name: 'Cameron A.', title: 'Co-Founder' },
    door2: { name: 'Mia R.', title: 'Talent Director' }
  },
  {
    id: 'job-20',
    company: 'Postman',
    title: 'Principal PM, Public API Network',
    fitScore: 77,
    stage: 'DISCOVERED',
    location: 'Remote (India/US)',
    workplace: 'remote',
    salary: '$150,000 - $190,000 + Stock',
    source: 'greenhouse',
    postedHoursAgo: 348, // 14.5 days ago
    door1: { name: 'Abhinav A.', title: 'CEO' },
    door2: { name: 'Siddhartha B.', title: 'VP Product' }
  },
  {
    id: 'job-21',
    company: 'Brex',
    title: 'Lead Product Manager, Corporate Treasury',
    fitScore: 89,
    stage: 'DISCOVERED',
    location: 'Remote (US)',
    workplace: 'remote',
    salary: '$185,000 - $240,000 + Equity',
    source: 'smartrecruiters',
    postedHoursAgo: 96, // 4 days ago
    door1: { name: 'Henrique D.', title: 'Co-CEO' },
    door2: { name: 'Lucas F.', title: 'Director of Talent' },
    door3: { name: 'Marco V.', title: 'Staff PM' }
  },
  {
    id: 'job-22',
    company: 'GitLab',
    title: 'Senior PM, Cloud Governance & DevSecOps',
    fitScore: 86,
    stage: 'DISCOVERED',
    location: 'Remote (Global)',
    workplace: 'remote',
    salary: '$175,000 - $220,000 + Equity',
    source: 'bamboohr',
    postedHoursAgo: 144, // 6 days ago
    door1: { name: 'Sid S.', title: 'CEO' },
    door2: { name: 'Tanya B.', title: 'Head of People' },
    door3: { name: 'David M.', title: 'Senior PM' }
  },
  {
    id: 'job-23',
    company: 'Ramp',
    title: 'Staff PM, Financial Intelligence & Spend',
    fitScore: 91,
    stage: 'DISCOVERED',
    location: 'New York, NY',
    workplace: 'hybrid',
    salary: '$200,000 - $265,000 + Top Tier Equity',
    source: 'rippling',
    postedHoursAgo: 192, // 8 days ago
    door1: { name: 'Eric G.', title: 'CEO' },
    door2: { name: 'Ashley K.', title: 'Talent Acquisition' },
    door3: { name: 'Colin M.', title: 'Lead PM' }
  },
  {
    id: 'job-24',
    company: 'Miro',
    title: 'Principal PM, Visual Workflows & AI Canvas',
    fitScore: 83,
    stage: 'DISCOVERED',
    location: 'Amsterdam / Remote (EU)',
    workplace: 'remote',
    salary: '€140,000 - €185,000 + RSUs',
    source: 'recruitee',
    postedHoursAgo: 216, // 9 days ago
    door1: { name: 'Andrey K.', title: 'CEO' },
    door2: { name: 'Elena D.', title: 'Talent Partner' },
    door3: { name: 'Paul N.', title: 'Product Director' }
  },
  {
    id: 'job-25',
    company: 'Spotify',
    title: 'Group PM, Audio Platform & Recommendations',
    fitScore: 88,
    stage: 'DISCOVERED',
    location: 'Stockholm / Remote (EU/US)',
    workplace: 'remote',
    salary: '$190,000 - $245,000 + RSUs',
    source: 'careers_jsonld',
    postedHoursAgo: 288, // 12 days ago
    door1: { name: 'Daniel E.', title: 'CEO' },
    door2: { name: 'Gustav S.', title: 'VP Product' },
    door3: { name: 'Astrid L.', title: 'Talent Lead' }
  },
  {
    id: 'job-26',
    company: 'LangChain',
    title: 'Staff Product Manager, Agents & Ecosystem',
    fitScore: 93,
    stage: 'DISCOVERED',
    location: 'Remote (US/Global)',
    workplace: 'remote',
    salary: '$180,000 - $240,000 + Top Tier Equity',
    source: 'yc_startup',
    postedHoursAgo: 20, // within 24h
    door1: { name: 'Harrison C.', title: 'Co-Founder & CEO' },
    door2: { name: 'Ankush G.', title: 'Co-Founder & CTO' },
    door3: { name: 'Erick F.', title: 'Founding PM' }
  },
  {
    id: 'job-27',
    company: 'PostHog',
    title: 'Product Lead, Web & Product Analytics',
    fitScore: 89,
    stage: 'DISCOVERED',
    location: 'Remote (Global)',
    workplace: 'remote',
    salary: '$165,000 - $215,000 + Equity',
    source: 'yc_startup',
    postedHoursAgo: 40, // 1.6 days ago
    door1: { name: 'James H.', title: 'Co-Founder & CEO' },
    door2: { name: 'Tim G.', title: 'Co-Founder & CTO' },
    door3: { name: 'Coua P.', title: 'People Lead' }
  },
  {
    id: 'job-28',
    company: 'Resend',
    title: 'Lead Product Manager, Developer Platform',
    fitScore: 91,
    stage: 'DISCOVERED',
    location: 'Remote (Global)',
    workplace: 'remote',
    salary: '$175,000 - $230,000 + Equity',
    source: 'yc_startup',
    postedHoursAgo: 60, // 2.5 days ago
    door1: { name: 'Zeno R.', title: 'Founder & CEO' },
    door2: { name: 'Bu K.', title: 'Founding Designer' },
    door3: { name: 'Matheus A.', title: 'Head of Growth' }
  },
  {
    id: 'job-29',
    company: 'Modal Labs',
    title: 'AI Infrastructure Product Lead',
    fitScore: 92,
    stage: 'DISCOVERED',
    location: 'New York, NY / San Francisco, CA',
    workplace: 'hybrid',
    salary: '$195,000 - $260,000 + High Equity',
    source: 'yc_startup',
    postedHoursAgo: 110, // 4.5 days ago
    door1: { name: 'Erik B.', title: 'CEO & Co-Founder' },
    door2: { name: 'Akshat B.', title: 'Co-Founder' },
    door3: { name: 'Nate T.', title: 'Head of Talent' }
  },
  {
    id: 'job-30',
    company: 'Cognition (Devin)',
    title: 'Product Lead, Autonomous Code Agents',
    fitScore: 96,
    stage: 'DISCOVERED',
    location: 'San Francisco, CA',
    workplace: 'onsite',
    salary: '$220,000 - $320,000 + Top Tier Equity',
    source: 'yc_startup',
    postedHoursAgo: 160, // 6.6 days ago
    door1: { name: 'Scott W.', title: 'Co-Founder & CEO' },
    door2: { name: 'Walden Y.', title: 'Co-Founder & Chief Product' },
    door3: { name: 'Steven H.', title: 'Founding Member' }
  },
  {
    id: 'job-31',
    company: 'Vellum AI',
    title: 'Founding PM, Enterprise Prompt & Evaluation Engine',
    fitScore: 87,
    stage: 'DISCOVERED',
    location: 'Remote (US/EU)',
    workplace: 'remote',
    salary: '$160,000 - $210,000 + Meaningful Equity',
    source: 'yc_startup',
    postedHoursAgo: 210, // 8.7 days ago
    door1: { name: 'Akash S.', title: 'Co-Founder & CEO' },
    door2: { name: 'Noomi G.', title: 'Co-Founder & CTO' },
    door3: { name: 'Siddharth T.', title: 'Co-Founder' }
  },
  {
    id: 'job-32',
    company: 'Perplexity',
    title: 'Lead Search & Reasoning Product Manager',
    fitScore: 94,
    stage: 'DISCOVERED',
    location: 'San Francisco, CA',
    workplace: 'hybrid',
    salary: '$210,000 - $285,000 + Equity',
    source: 'yc_startup',
    postedHoursAgo: 280, // 11.6 days ago
    door1: { name: 'Aravind S.', title: 'CEO & Co-Founder' },
    door2: { name: 'Denis Y.', title: 'CTO & Co-Founder' },
    door3: { name: 'Johnny H.', title: 'VP Product' }
  }
];

export default function MorningRadarPage() {
  const { mode, isLive, toggleMode, mounted } = useDataMode();
  const [jobs, setJobs] = useState<RadarJobItem[]>(INITIAL_RADAR_JOBS);
  const [viewMode, setViewMode] = useState<'bento' | 'table'>('bento');
  
  // Status View Tabs: Active (Default) | Skipped (Review/Restore) | All (Complete Pool)
  const [statusTab, setStatusTab] = useState<'active' | 'skipped' | 'all'>('active');
  
  // Time Crawl Scope: 15-Day Backfill (First-Time User) vs 24-Hour Daily Incremental Crawl
  const [timeWindow, setTimeWindow] = useState<'15_days' | '24_hours'>('15_days');
  
  // Dual-View Source Filter (S6-T09)
  const [sourceFilter, setSourceFilter] = useState<string>('ALL');
  const [isSyncingGmail, setIsSyncingGmail] = useState<boolean>(false);
  const [isSyncingYc, setIsSyncingYc] = useState<boolean>(false);

  // Quick Filters
  const [filterCategory, setFilterCategory] = useState<'all' | 'high_fit' | 'remote' | 'chosen'>('all');
  const [batchLimit, setBatchLimit] = useState<'12' | 'all'>('all');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDrawerId, setSelectedDrawerId] = useState<string | null>(null);
  const [isIngestModalOpen, setIsIngestModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [bulkToast, setBulkToast] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Source settings state (tracks enabled sources from Settings & Vault)
  const [enabledSourceIds, setEnabledSourceIds] = useState<Set<string> | null>(null);

  // Load enabled sources from settings
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings?.sources) {
          const enabled = new Set<string>(
            data.settings.sources.filter((s: any) => s.enabled).map((s: any) => s.id.toLowerCase())
          );
          setEnabledSourceIds(enabled);
        }
      })
      .catch(() => {});
  }, []);

  // Compute unified job pool combining 15-day onboarding crawl jobs from enabled sources + live ingested jobs
  useEffect(() => {
    if (!mounted) return;

    // Filter 15-day onboarding crawl jobs by enabled sources in Settings
    const activeCrawlJobs = INITIAL_RADAR_JOBS.filter((j) => {
      if (!enabledSourceIds) return true; // before settings resolve, keep all active
      const src = (j.source || '').toLowerCase();
      return enabledSourceIds.has(src);
    });

    if (isLive) {
      // In Live Mode: merge live ingested jobs (Gmail alerts, Clipper, Bulk upload)
      // with active 15-day discovery crawl jobs from enabled sources
      const live = getLiveJobs<RadarJobItem>();
      const seen = new Set<string>();
      const merged: RadarJobItem[] = [];

      // Prioritize live ingested roles
      for (const j of live) {
        const key = `${j.company.toLowerCase()}:${j.title.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(j);
        }
      }

      // Merge active 15-day onboarding crawl roles from enabled sources
      for (const j of activeCrawlJobs) {
        const key = `${j.company.toLowerCase()}:${j.title.toLowerCase()}`;
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(j);
        }
      }

      setJobs(merged);
    } else {
      setJobs(activeCrawlJobs);
    }
  }, [isLive, mounted, enabledSourceIds]);

  // On mount: fetch any existing backend Gmail alert jobs from store
  useEffect(() => {
    fetch('/api/ingest/gmail-sync')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.jobs && data.jobs.length > 0) {
          setJobs((prev) => {
            const existingKeys = new Set(prev.map((j) => `${j.company.toLowerCase()}:${j.title.toLowerCase()}`));
            const newItems: RadarJobItem[] = data.jobs
              .filter((j: any) => !existingKeys.has(`${j.company.toLowerCase()}:${j.title.toLowerCase()}`))
              .map((j: any) => ({
                id: j.id,
                company: j.company,
                title: j.title,
                fitScore: j.fitScore,
                stage: 'DISCOVERED',
                location: j.location,
                workplace: j.workplace,
                salary: j.salary,
                source: j.source,
                postedHoursAgo: j.postedHoursAgo || 2,
                door1: j.door1,
                door2: j.door2,
                door3: j.door3,
              }));
            if (newItems.length === 0) return prev;
            const updated = [...newItems, ...prev];
            if (isLive) {
              const liveOnly = updated.filter(
                (j) =>
                  j.id.startsWith('gmail-') ||
                  j.id.startsWith('ingest-') ||
                  j.id.startsWith('bulk-') ||
                  j.source === 'linkedin_alert' ||
                  j.source === 'naukri_alert'
              );
              saveLiveJobs(liveOnly);
            }
            return updated;
          });
        }
      })
      .catch(() => {});
  }, [isLive]);

  // On mount: fetch any existing backend webhook jobs from store (Browse.ai, Apify)
  useEffect(() => {
    fetch('/api/ingest/webhook')
      .then((res) => res.json())
      .then((data) => {
        if (data.jobs && data.jobs.length > 0) {
          setJobs((prev) => {
            const existingKeys = new Set(prev.map((j) => `${j.company.toLowerCase()}:${j.title.toLowerCase()}`));
            const newItems: RadarJobItem[] = data.jobs.filter(
              (j: any) => !existingKeys.has(`${j.company.toLowerCase()}:${j.title.toLowerCase()}`)
            );
            if (newItems.length === 0) return prev;
            return [...newItems, ...prev];
          });
        }
      })
      .catch(() => {});
  }, [isLive]);

  // On mount: fetch autonomous YC Startup roles from crawler cache
  useEffect(() => {
    fetch('/api/ingest/yc')
      .then((res) => res.json())
      .then((data) => {
        if (data.jobs && data.jobs.length > 0) {
          setJobs((prev) => {
            const existingKeys = new Set(prev.map((j) => `${j.company.toLowerCase()}:${j.title.toLowerCase()}`));
            const newItems: RadarJobItem[] = data.jobs.filter(
              (j: any) => !existingKeys.has(`${j.company.toLowerCase()}:${j.title.toLowerCase()}`)
            );
            if (newItems.length === 0) return prev;
            return [...newItems, ...prev];
          });
        }
      })
      .catch(() => {});
  }, [isLive]);

  // Global Shift + I listener for Universal Ingest Modal (Runbook §4.4)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.key === 'I' || e.key === 'i')) {
        const activeEl = document.activeElement;
        const isInput =
          activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            (activeEl as HTMLElement).isContentEditable);
        if (!isInput) {
          e.preventDefault();
          setIsIngestModalOpen(true);
        }
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Compute live counts across status tabs and crawl windows
  const counts = useMemo(() => {
    // Current time window pool
    const inWindow = jobs.filter((j) => {
      if (j.id.startsWith('ingest-') || j.id.startsWith('bulk-')) return true;
      if (timeWindow === '24_hours') return j.postedHoursAgo <= 24;
      return j.postedHoursAgo <= 360; // 15 days = 360 hours
    });

    return {
      active: inWindow.filter((j) => j.stage !== 'SKIPPED').length,
      skipped: inWindow.filter((j) => j.stage === 'SKIPPED').length,
      allTotal: inWindow.length,
      highFit: inWindow.filter((j) => j.fitScore >= 80 && (statusTab === 'skipped' ? j.stage === 'SKIPPED' : statusTab === 'active' ? j.stage !== 'SKIPPED' : true)).length,
      remote: inWindow.filter((j) => j.workplace === 'remote' && (statusTab === 'skipped' ? j.stage === 'SKIPPED' : statusTab === 'active' ? j.stage !== 'SKIPPED' : true)).length,
      chosen: inWindow.filter((j) => j.stage === 'CHOSEN').length,
      within24h: jobs.filter((j) => j.postedHoursAgo <= 24 || j.id.startsWith('ingest-') || j.id.startsWith('bulk-')).length,
      within15d: jobs.length,
    };
  }, [jobs, timeWindow, statusTab]);

  // Dynamically compute all distinct sources present in the pool (S6-T09)
  const availableSources = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => {
      if (j.source) set.add(j.source);
    });
    return ['ALL', ...Array.from(set).sort()];
  }, [jobs]);

  // Master Visible Roles Filter: time window -> status tab -> source filter -> search -> category -> sorted descending by score
  const visibleJobs = useMemo(() => {
    // 1. Time Window Filter (15-Day Backfill vs 24h Daily Crawl)
    let list = jobs.filter((j) => {
      if (j.id.startsWith('ingest-') || j.id.startsWith('bulk-')) return true;
      if (timeWindow === '24_hours') return j.postedHoursAgo <= 24;
      return j.postedHoursAgo <= 360; // 15 days
    });

    // 2. Status Tab Filter (Active vs Skipped vs All)
    if (statusTab === 'active') {
      list = list.filter((j) => j.stage !== 'SKIPPED');
    } else if (statusTab === 'skipped') {
      list = list.filter((j) => j.stage === 'SKIPPED');
    }
    // 'all' keeps both active, chosen, and skipped roles

    // 3. Dual-View Source Filter (S6-T09)
    if (sourceFilter !== 'ALL') {
      list = list.filter((j) => {
        if (sourceFilter === 'linkedin_alert') return j.source === 'linkedin_alert' || j.source === 'linkedin_digest';
        if (sourceFilter === 'naukri_alert') return j.source === 'naukri_alert' || j.source === 'naukri_webhook';
        return j.source.toLowerCase() === sourceFilter.toLowerCase();
      });
    }

    // 4. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (j) => j.company.toLowerCase().includes(q) || j.title.toLowerCase().includes(q)
      );
    }

    // 5. Quick Category Filter Chips
    if (filterCategory === 'high_fit') {
      list = list.filter((j) => j.fitScore >= 80);
    } else if (filterCategory === 'remote') {
      list = list.filter((j) => j.workplace === 'remote');
    } else if (filterCategory === 'chosen') {
      list = list.filter((j) => j.stage === 'CHOSEN');
    }

    // 6. Continuous Score Ranking (Highest Match First; Pinned Ingests at top)
    list.sort((a, b) => {
      const aIngested = a.id.startsWith('ingest-') || a.id.startsWith('bulk-');
      const bIngested = b.id.startsWith('ingest-') || b.id.startsWith('bulk-');
      if (aIngested && !bIngested) return -1;
      if (!aIngested && bIngested) return 1;
      return b.fitScore - a.fitScore;
    });

    // 7. Batch Focus Slice (Top 12 Focus vs All available)
    if (batchLimit === '12') {
      return list.slice(0, 12);
    }

    return list;
  }, [jobs, timeWindow, statusTab, sourceFilter, searchQuery, filterCategory, batchLimit]);

  const handleSyncGmailAlerts = async () => {
    setIsSyncingGmail(true);
    try {
      const res = await fetch('/api/ingest/gmail-sync', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.jobs && data.jobs.length > 0) {
        setJobs((prev) => {
          const existingKeys = new Set(prev.map((j) => `${j.company.toLowerCase()}:${j.title.toLowerCase()}`));
          const newItems: RadarJobItem[] = data.jobs
            .filter((j: any) => !existingKeys.has(`${j.company.toLowerCase()}:${j.title.toLowerCase()}`))
            .map((j: any) => ({
              id: j.id,
              company: j.company,
              title: j.title,
              fitScore: j.fitScore,
              stage: 'DISCOVERED',
              location: j.location,
              workplace: j.workplace,
              salary: j.salary,
              source: j.source,
              postedHoursAgo: j.postedHoursAgo || 2,
              door1: j.door1,
              door2: j.door2,
              door3: j.door3,
            }));
          const updated = [...newItems, ...prev];
          if (isLive) {
            const liveOnly = updated.filter(
              (j) =>
                j.id.startsWith('gmail-') ||
                j.id.startsWith('ingest-') ||
                j.id.startsWith('bulk-') ||
                j.source === 'linkedin_alert' ||
                j.source === 'naukri_alert'
            );
            saveLiveJobs(liveOnly);
          }
          return updated;
        });
        setBulkToast(`✓ Ingested ${data.count} roles from LinkedIn & Naukri alert digests`);
        setTimeout(() => setBulkToast(null), 4000);
      } else {
        setBulkToast('Gmail inbox scanned: 0 new alerts found (all deduplicated).');
        setTimeout(() => setBulkToast(null), 3000);
      }
    } catch (err) {
      console.error('Failed to sync gmail alerts:', err);
    } finally {
      setIsSyncingGmail(false);
    }
  };

  const handleSyncYcStartups = async () => {
    setIsSyncingYc(true);
    try {
      const res = await fetch('/api/ingest/yc', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.jobs && data.jobs.length > 0) {
        setJobs((prev) => {
          const existingKeys = new Set(prev.map((j) => `${j.company.toLowerCase()}:${j.title.toLowerCase()}`));
          const newItems: RadarJobItem[] = data.jobs
            .filter((j: any) => !existingKeys.has(`${j.company.toLowerCase()}:${j.title.toLowerCase()}`))
            .map((j: any) => ({
              id: j.id,
              company: j.company,
              title: j.title,
              fitScore: j.fitScore,
              stage: 'DISCOVERED',
              location: j.location,
              workplace: j.workplace,
              salary: j.salary,
              source: 'yc_startup',
              postedHoursAgo: j.postedHoursAgo || 6,
              door1: j.door1,
              door2: j.door2,
              door3: j.door3,
            }));
          const updated = [...newItems, ...prev];
          if (isLive) {
            const liveOnly = updated.filter(
              (j) =>
                j.id.startsWith('gmail-') ||
                j.id.startsWith('ingest-') ||
                j.id.startsWith('bulk-') ||
                j.id.startsWith('yc-') ||
                j.source === 'yc_startup' ||
                j.source === 'linkedin_alert' ||
                j.source === 'naukri_alert'
            );
            saveLiveJobs(liveOnly);
          }
          return updated;
        });
        setBulkToast(`⚡ Autonomous agent ingested ${data.count} live YC Product roles!`);
        setTimeout(() => setBulkToast(null), 4000);
      } else {
        setBulkToast('YC mirror checked: all roles already synced & deduplicated.');
        setTimeout(() => setBulkToast(null), 3000);
      }
    } catch (err) {
      console.error('Failed to sync YC roles:', err);
      setBulkToast('Failed to sync YC roles. Please verify network connectivity.');
      setTimeout(() => setBulkToast(null), 4000);
    } finally {
      setIsSyncingYc(false);
    }
  };

  // Hook for single-key keyboard navigation engine
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
        prev.map((j) =>
          j.id === rowId
            ? { ...j, stage: j.stage === 'CHOSEN' ? 'DISCOVERED' : 'CHOSEN' }
            : j
        )
      );
    },
    isModalOpen: isIngestModalOpen,
    onCloseModal: () => setIsIngestModalOpen(false),
    isDrawerOpen: Boolean(selectedDrawerId),
    onCloseDrawer: () => setSelectedDrawerId(null),
    searchInputRef
  });

  // In-Drawer Rapid Candidate Cycling (Runbook §4.3)
  const selectedJobIndex = visibleJobs.findIndex((j) => j.id === selectedDrawerId);
  const selectedJob =
    (selectedJobIndex !== -1 ? visibleJobs[selectedJobIndex] : null) ||
    jobs.find((j) => j.id === selectedDrawerId) ||
    null;

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

  const handleJobIngested = (newJob: DossierJobData) => {
    const radarItem: RadarJobItem = {
      id: newJob.id,
      company: newJob.company,
      title: newJob.title,
      fitScore: newJob.fitScore,
      stage: 'DISCOVERED',
      location: newJob.location,
      workplace: newJob.workplace,
      salary: newJob.salary,
      source: newJob.source,
      postedHoursAgo: 0,
      door1: newJob.door1,
      door2: newJob.door2,
      door3: newJob.door3
    };
    setJobs((prev) => {
      const updated = [radarItem, ...prev];
      if (isLive) {
        const liveOnly = updated.filter(
          (j) =>
            j.id.startsWith('gmail-') ||
            j.id.startsWith('ingest-') ||
            j.id.startsWith('bulk-') ||
            j.source === 'linkedin_alert' ||
            j.source === 'naukri_alert'
        );
        saveLiveJobs(liveOnly);
      }
      return updated;
    });
    setSelectedDrawerId(newJob.id);
    setSelectedIndex(0);
  };

  const handleBulkImportSuccess = (importedJobs: any[], toastMsg: string) => {
    setBulkToast(toastMsg);
    if (importedJobs.length > 0) {
      const mapped: RadarJobItem[] = importedJobs.map((j) => ({
        id: j.id,
        company: j.company,
        title: j.title,
        fitScore: j.fitScore,
        stage: 'DISCOVERED',
        location: j.location,
        workplace: j.workplace,
        salary: j.salary,
        source: j.source,
        postedHoursAgo: 0,
        door1: j.door1,
        door2: j.door2,
        door3: j.door3,
      }));
      setJobs((prev) => {
        const updated = [...mapped, ...prev];
        if (isLive) {
          const liveOnly = updated.filter(
            (j) =>
              j.id.startsWith('gmail-') ||
              j.id.startsWith('ingest-') ||
              j.id.startsWith('bulk-') ||
              j.source === 'linkedin_alert' ||
              j.source === 'naukri_alert'
          );
          saveLiveJobs(liveOnly);
        }
        return updated;
      });
      if (mapped.length > 0) {
        setSelectedDrawerId(mapped[0].id);
        setSelectedIndex(0);
      }
    }
    setTimeout(() => setBulkToast(null), 5000);
  };

  const handleRestoreRole = (jobId: string) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, stage: 'DISCOVERED' } : j))
    );
  };

  return (
    <div className="min-h-screen bg-[#080B11] text-[#F8FAFC] p-6 lg:p-8 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-semibold tracking-tight text-[#F8FAFC]">
              Morning Radar
            </h1>
            {isLive ? (
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Radar ({jobs.length} Opportunities &bull; 35 Sources)
              </span>
            ) : (
              <span className="text-xs font-mono text-[#38BDF8] bg-[#2563EB]/15 border border-[#2563EB]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]"></span>
                Demo Showcase ({jobs.length} Opportunities)
              </span>
            )}
          </div>
          <p className="text-sm text-[#94A3B8] mt-1">
            Autonomous market surveillance across 35 sources (Free ATS, direct crawler, and curated boards).
          </p>
        </div>

        {/* View Switcher, Ingest & Search */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Quick Search */}
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search roles (/)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#0F1523] border border-white/10 rounded-md px-3 py-1.5 text-sm text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 w-48 md:w-60"
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

          {/* Data Mode Toggle (Live vs Demo Showcase) */}
          <DataModeToggle />

          {/* Inbound Bulk Import Trigger */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#0F1523] hover:bg-[#161F33] text-sky-400 border border-sky-500/30 shadow-sm flex items-center gap-1.5 transition-colors"
            title="Import opportunities via CSV or XLSX"
          >
            <span>📥 Import</span>
          </button>

          {/* Direct Gmail Alert Sync Trigger (S6-T09) */}
          <button
            onClick={handleSyncGmailAlerts}
            disabled={isSyncingGmail}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#0F1523] hover:bg-[#161F33] text-emerald-400 border border-emerald-500/30 shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Scan Gmail inbox for LinkedIn & Naukri alert digests"
          >
            {isSyncingGmail ? (
              <>
                <div className="w-3 h-3 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <span>⚡ Sync Gmail</span>
            )}
          </button>

          {/* Autonomous YC Startup Sync Trigger (Free Native Agent) */}
          <button
            onClick={handleSyncYcStartups}
            disabled={isSyncingYc}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#0F1523] hover:bg-[#161F33] text-[#8da693] border border-[#8da693]/40 shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
            title="Autonomous Free Agent: Sync 200+ YC Product Manager roles directly from Work at a Startup"
          >
            {isSyncingYc ? (
              <>
                <div className="w-3 h-3 border-2 border-[#8da693] border-t-transparent rounded-full animate-spin" />
                <span>Syncing YC...</span>
              </>
            ) : (
              <span>⚡ Sync YC Startups</span>
            )}
          </button>

          {/* Universal Ingest Trigger */}
          <button
            onClick={() => setIsIngestModalOpen(true)}
            className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-sm flex items-center gap-1.5 transition-colors"
          >
            <span>+ Add Job</span>
            <span className="text-[10px] opacity-75 font-mono bg-white/20 px-1 py-0.5 rounded">Shift+I</span>
          </button>
        </div>
      </div>

      {/* Crawl Scope & First-Time User Ingestion Banner */}
      <div className="bg-[#0F1523] border border-white/10 rounded-xl p-4 mb-5 space-y-3.5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Crawl Scope Toggle (15-Day Backfill vs 24h Daily Crawl) */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="text-xs font-mono text-slate-400">Crawl Scope:</span>
            <div className="inline-flex bg-[#161F33] border border-white/10 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setTimeWindow('15_days')}
                className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  timeWindow === '15_days'
                    ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="First-time user onboarding crawl fetches past 15 days of opportunities"
              >
                <span>⚡ 15-Day Discovery (First Login)</span>
                <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.2 rounded">{counts.within15d}</span>
              </button>
              <button
                onClick={() => setTimeWindow('24_hours')}
                className={`px-3 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                  timeWindow === '24_hours'
                    ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Daily 04:00 AM crawler adding new 24h opportunities"
              >
                <span>Past 24 Hours (Daily Crawl)</span>
                <span className="text-[10px] font-mono bg-white/20 px-1.5 py-0.2 rounded">{counts.within24h}</span>
              </button>
            </div>
          </div>

          {/* Density Batch Slicing & Traversal Keys */}
          <div className="flex items-center gap-3 self-end lg:self-auto flex-wrap">
            {/* Dual-View Source Filter Dropdown (S6-T09) */}
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono text-slate-400">Filter by Source:</span>
              <select
                value={sourceFilter}
                onChange={(e) => {
                  setSourceFilter(e.target.value);
                  setSelectedIndex(0);
                }}
                aria-label="Filter by Source"
                className="bg-[#161F33] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-[#2563EB] font-medium"
              >
                <option value="ALL">All Sources ({jobs.length})</option>
                {availableSources
                  .filter((s) => s !== 'ALL')
                  .map((src) => {
                    const count = jobs.filter((j) => j.source === src).length;
                    return (
                      <option key={src} value={src}>
                        {formatSourceLabel(src)} ({count})
                      </option>
                    );
                  })}
              </select>
            </div>

            <div className="inline-flex bg-[#161F33] border border-white/10 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setBatchLimit('12')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  batchLimit === '12'
                    ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="View top 12 focused opportunities upfront"
              >
                Top 12 Focus
              </button>
              <button
                onClick={() => setBatchLimit('all')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                  batchLimit === 'all'
                    ? 'bg-[#2563EB] text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title={`View all ${counts.allTotal} opportunities`}
              >
                All Opportunities ({counts.allTotal})
              </button>
            </div>

            <div className="hidden lg:flex text-xs text-[#94A3B8] items-center gap-1.5">
              <span>Keys:</span>
              <kbd className="bg-[#161F33] border border-white/10 px-1 py-0.5 rounded text-[10px] font-mono">j</kbd>
              <kbd className="bg-[#161F33] border border-white/10 px-1 py-0.5 rounded text-[10px] font-mono">k</kbd> navigate
              <kbd className="bg-[#161F33] border border-white/10 px-1 py-0.5 rounded text-[10px] font-mono">s</kbd> skip
              <kbd className="bg-[#161F33] border border-white/10 px-1 py-0.5 rounded text-[10px] font-mono">c</kbd> choose
            </div>
          </div>
        </div>

        {/* View Status Tabs (Active | Skipped | All Opportunities) */}
        <div className="flex items-center justify-between border-t border-white/8 pt-3 flex-wrap gap-2">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setStatusTab('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                statusTab === 'active'
                  ? 'bg-[#2563EB] text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Active Roles</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/20">{counts.active}</span>
            </button>
            <button
              onClick={() => setStatusTab('skipped')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                statusTab === 'skipped'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Skipped Roles</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-300">{counts.skipped}</span>
            </button>
            <button
              onClick={() => setStatusTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                statusTab === 'all'
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>All Scored Pool</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-white/10">{counts.allTotal}</span>
            </button>
          </div>

          {/* Quick Signal Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium whitespace-nowrap ${
                filterCategory === 'all'
                  ? 'bg-white/15 text-white font-semibold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
            >
              All Signals
            </button>
            <button
              onClick={() => setFilterCategory('high_fit')}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium whitespace-nowrap flex items-center gap-1.5 ${
                filterCategory === 'high_fit'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              High Fit &ge;80% ({counts.highFit})
            </button>
            <button
              onClick={() => setFilterCategory('remote')}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium whitespace-nowrap ${
                filterCategory === 'remote'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40 font-semibold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
            >
              Remote ({counts.remote})
            </button>
            <button
              onClick={() => setFilterCategory('chosen')}
              className={`px-2.5 py-1 rounded-md transition-colors font-medium whitespace-nowrap ${
                filterCategory === 'chosen'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-semibold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400'
              }`}
            >
              Chosen ({counts.chosen})
            </button>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      {visibleJobs.length === 0 ? (
        isLive && jobs.length === 0 ? (
          <div className="bg-[#0F1523] border border-white/10 rounded-xl p-10 text-center max-w-xl mx-auto my-12 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-2xl flex items-center justify-center mx-auto mb-4">
              📡
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Live Radar Clean Slate</h3>
            <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed">
              You are in <span className="text-emerald-400 font-mono font-medium">Live Testing Mode</span> with mock data removed. Ingest real opportunities to run algorithmic suitability scoring, generate executive dossiers, and triangulate Door 1/2/3 contacts.
            </p>
            <div className="flex flex-wrap justify-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsIngestModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-blue-600 text-white text-xs font-semibold shadow-md flex items-center gap-2 transition-colors"
              >
                <span>📥 Ingest Role (URL / Text)</span>
              </button>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(true)}
                className="px-4 py-2 rounded-lg bg-[#161F33] hover:bg-white/10 border border-white/10 text-[#38BDF8] text-xs font-semibold transition-colors flex items-center gap-2"
              >
                <span>📄 Upload CSV Batch</span>
              </button>
              <button
                type="button"
                onClick={toggleMode}
                className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-2"
              >
                <span>🧪 Switch to Demo Mode</span>
              </button>
            </div>
            <div className="mt-6 pt-5 border-t border-white/5 text-[11px] font-mono text-slate-500">
              💡 Tip: Clip any live job from LinkedIn, Greenhouse, or Lever using the Chrome Extension.
            </div>
          </div>
        ) : (
          <div className="bg-[#0F1523] border border-white/10 rounded-lg p-12 text-center text-[#94A3B8]">
            <p className="text-base font-medium text-white">
              {statusTab === 'skipped' ? 'No Skipped Roles' : 'All Caught Up'}
            </p>
            <p className="text-sm mt-1">
              {statusTab === 'skipped'
                ? 'You have not skipped any roles yet. Roles skipped in Active tab will appear here.'
                : 'No opportunities match your current filters. Try switching the crawl scope or expanding filters.'}
            </p>
          </div>
        )
      ) : viewMode === 'bento' ? (
        /* Responsive Bento Cards Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3.5">
          {visibleJobs.map((job, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div
                key={job.id}
                onClick={() => {
                  setSelectedIndex(idx);
                  setSelectedDrawerId(job.id);
                }}
                className={`bg-[#0F1523] border rounded-xl p-3.5 flex flex-col justify-between transition-all duration-150 cursor-pointer shadow-sm hover:shadow-md ${
                  isSelected
                    ? 'ring-2 ring-[#2563EB] border-transparent shadow-lg shadow-blue-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Top Section: Company, Stage & Score Badge */}
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-mono font-medium text-[#94A3B8] uppercase tracking-wider truncate">
                      {job.company}
                    </span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {job.stage === 'CHOSEN' && (
                        <span className="text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          ✓ CHOSEN
                        </span>
                      )}
                      {job.stage === 'SKIPPED' && (
                        <span className="text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          SKIPPED
                        </span>
                      )}
                      <span
                        className={`text-[11px] font-mono font-semibold px-1.5 py-0.5 rounded ${
                          job.fitScore >= 70
                            ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                            : 'bg-sky-500/15 text-sky-400 border border-sky-500/20'
                        }`}
                      >
                        {job.fitScore}% FIT
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-[#F8FAFC] mt-1.5 line-clamp-1" title={job.title}>
                    {job.title}
                  </h3>
                </div>

                {/* Middle Section: Compact Structured Telemetry Box */}
                <div className="grid grid-cols-2 gap-x-2.5 gap-y-1.5 p-2.5 rounded-lg bg-[#161F33]/50 border border-white/8 my-2 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-mono tracking-wider mb-0.5">
                      Location
                    </span>
                    <span className="font-medium text-white block truncate text-xs" title={job.location}>
                      {job.location}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-mono tracking-wider mb-0.5">
                      Workplace Policy
                    </span>
                    <span className="font-medium text-white block uppercase tracking-wider text-xs">
                      {job.workplace}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-mono tracking-wider mb-0.5">
                      Salary Telemetry
                    </span>
                    <span
                      className="font-medium text-emerald-400 block truncate text-xs"
                      title={job.salary || '$165,000 - $210,000 + Equity'}
                    >
                      {job.salary || '$165,000 - $210,000 + Equity'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-mono tracking-wider mb-0.5">
                      Source &amp; Provenance
                    </span>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className={`inline-flex items-center text-[10px] font-mono px-2 py-0.5 rounded border font-medium ${
                        job.source === 'linkedin_alert' || job.source === 'linkedin_digest'
                          ? 'bg-sky-500/15 text-[#38BDF8] border-sky-500/30'
                          : job.source === 'naukri_alert' || job.source === 'naukri_webhook'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : job.source.includes('greenhouse') || job.source.includes('lever') || job.source.includes('ashby')
                          ? 'bg-[#2563EB]/15 text-[#38BDF8] border-[#2563EB]/30'
                          : 'bg-white/5 text-slate-300 border-white/10'
                      }`}>
                        {formatSourceLabel(job.source)}
                      </span>
                      <span className="text-slate-500 text-[10px]">&bull;</span>
                      <span className="text-slate-400 text-[11px] font-mono">
                        {job.postedHoursAgo < 24 ? `${job.postedHoursAgo}h` : `${Math.round(job.postedHoursAgo / 24)}d`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Three Doors & Dynamic Actions */}
                <div className="pt-2 border-t border-white/5 space-y-2">
                  <ThreeDoorsChips door1={job.door1} door2={job.door2} door3={job.door3} />

                  <div className="flex items-center justify-between text-xs text-[#94A3B8] pt-0.5">
                    <span className="font-mono text-[10px]">
                      {job.postedHoursAgo < 24 ? `${job.postedHoursAgo}h ago` : `${Math.round(job.postedHoursAgo / 24)}d ago`}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIndex(idx);
                          setSelectedDrawerId(job.id);
                        }}
                        className="px-2 py-0.5 text-xs bg-[#161F33] hover:bg-[#2563EB] hover:text-white text-slate-200 rounded font-medium border border-white/10 transition-colors"
                      >
                        Dossier &rarr;
                      </button>

                      {job.stage === 'SKIPPED' ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRestoreRole(job.id);
                          }}
                          className="px-2 py-0.5 text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded font-medium transition-colors"
                          title="Restore role back to active radar"
                        >
                          Restore ↺
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setJobs((prev) =>
                                prev.map((j) => (j.id === job.id ? { ...j, stage: 'SKIPPED' } : j))
                              );
                            }}
                            className="px-1.5 py-0.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                          >
                            Skip
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setJobs((prev) =>
                                prev.map((j) =>
                                  j.id === job.id
                                    ? { ...j, stage: j.stage === 'CHOSEN' ? 'DISCOVERED' : 'CHOSEN' }
                                    : j
                                )
                              );
                            }}
                            className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${
                              job.stage === 'CHOSEN'
                                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                : 'bg-[#2563EB] hover:bg-blue-600 text-white'
                            }`}
                          >
                            {job.stage === 'CHOSEN' ? 'Chosen ✓' : 'Choose'}
                          </button>
                        </>
                      )}
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
                <th className="py-2.5 px-3">Backdoor</th>
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
                      <div className="flex items-center gap-1.5">
                        <span>{job.company}</span>
                        {job.stage === 'SKIPPED' && (
                          <span className="text-[9px] font-mono px-1 rounded bg-rose-500/20 text-rose-300">
                            SKIPPED
                          </span>
                        )}
                        {job.stage === 'CHOSEN' && (
                          <span className="text-[9px] font-mono px-1 rounded bg-emerald-500/20 text-emerald-400">
                            CHOSEN
                          </span>
                        )}
                      </div>
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
                    <td className="py-2 px-3 text-xs">
                      <span className={`inline-flex items-center font-mono text-[11px] px-2 py-0.5 rounded border font-medium ${
                        job.source === 'linkedin_alert' || job.source === 'linkedin_digest'
                          ? 'bg-sky-500/15 text-[#38BDF8] border-sky-500/30'
                          : job.source === 'naukri_alert' || job.source === 'naukri_webhook'
                          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                          : 'bg-[#161F33] text-slate-300 border-white/10'
                      }`}>
                        {formatSourceLabel(job.source)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-xs font-mono text-right text-slate-400">
                      {job.postedHoursAgo < 24 ? `${job.postedHoursAgo}h` : `${Math.round(job.postedHoursAgo / 24)}d`}
                    </td>
                    <td className="py-2 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
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

                        {job.stage === 'SKIPPED' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRestoreRole(job.id);
                            }}
                            className="px-2 py-0.5 text-xs bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded font-medium transition-colors"
                            title="Restore role back to active radar"
                          >
                            Restore ↺
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setJobs((prev) =>
                                  prev.map((j) =>
                                    j.id === job.id
                                      ? { ...j, stage: j.stage === 'CHOSEN' ? 'DISCOVERED' : 'CHOSEN' }
                                      : j
                                  )
                                );
                              }}
                              className={`px-2 py-0.5 text-xs rounded font-medium transition-colors ${
                                job.stage === 'CHOSEN'
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                  : 'bg-blue-600/80 hover:bg-blue-600 text-white'
                              }`}
                            >
                              {job.stage === 'CHOSEN' ? 'Chosen ✓' : 'Choose'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setJobs((prev) =>
                                  prev.map((j) => (j.id === job.id ? { ...j, stage: 'SKIPPED' } : j))
                                );
                              }}
                              className="px-1.5 py-0.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded transition-colors"
                            >
                              Skip
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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

      {/* Universal Ingest Modal (Runbook §4.4) */}
      <UniversalIngestModal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        onJobIngested={handleJobIngested}
      />

      {/* Inbound Bulk Import Modal (M2-FR14 / M9-FR13) */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onUploadSuccess={handleBulkImportSuccess}
      />

      {/* Global Ingestion Toast Notification */}
      {bulkToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-slate-900 border border-sky-500/40 text-sky-400 text-xs font-mono shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="text-base font-bold text-emerald-400">✓</span>
          <span>{bulkToast}</span>
          <button
            onClick={() => setBulkToast(null)}
            className="ml-2 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
