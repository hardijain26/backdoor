/**
 * Backdoor Unified Ingestion & Normalization Engine (@ingest/pipeline)
 * 
 * Provides a single, role-agnostic ingestion pipeline across all channels:
 * - Universal (URL, Raw Text, Chrome Clipper, Manual)
 * - Inbound Webhooks (Browse.ai, Apify, Zapier)
 * - Autonomous Crawlers (YC, Hacker News, Direct Feeds)
 * - Bulk File Uploads (CSV, XLSX)
 * - Inbound Email Digests (Gmail, LinkedIn, Naukri)
 * 
 * Invariants:
 * 1. Role-Agnostic: Adapts to any candidate track (Engineering, Product, Design, Data, Operations).
 * 2. Canonical Deduplication: Normalizes company and title keys to eliminate cross-source duplicates.
 * 3. Dynamic Functional Doors: Generates Door 1, 2, and 3 contacts aligned with the job's domain.
 * 4. Single Source of Truth: Centralized store and decision logging.
 */

import { generateDedupMatchKey } from './dedup';
import { evaluateJobSuitability, CandidateTrack, DEFAULT_TRACK } from './scorer';
import { logDecisionEvent } from './sheet-mirror';
import { addWebhookIngestedJob, WebhookJobItem } from './webhook-ingest';
import { isSafeUrl } from './scraper';

export interface RawJobInput {
  title?: string;
  company?: string;
  location?: string;
  workplace?: 'remote' | 'hybrid' | 'onsite';
  salary?: string;
  description?: string;
  applyUrl?: string;
  source?: string;
  externalId?: string;
  door1?: { name: string; title: string; confidence?: number };
  door2?: { name: string; title: string; confidence?: number };
  door3?: { name: string; title: string; confidence?: number };
  track?: string;
}

export interface UnifiedJob {
  id: string;
  company: string;
  title: string;
  fitScore: number;
  stage: 'DISCOVERED' | 'CHOSEN' | 'SKIPPED';
  location: string;
  workplace: 'remote' | 'hybrid' | 'onsite';
  salary: string;
  description: string;
  source: string;
  sourceUrl: string;
  applyUrl: string;
  postedHoursAgo: number;
  door1: { name: string; title: string; confidence: number };
  door2: { name: string; title: string; confidence: number };
  door3: { name: string; title: string; confidence: number };
  dedupMatchKey: string;
  track: string;
  createdAt: string;
}

export interface IngestionBatchResult {
  success: boolean;
  total: number;
  imported: number;
  deduplicated: number;
  jobs: UnifiedJob[];
  message?: string;
}

// In-Memory Catalog Store for unified deduplication across sessions
const UNIFIED_CATALOG_STORE = new Map<string, UnifiedJob>();

/**
 * Normalizes workplace type from location or explicit input
 */
export function normalizeWorkplace(location?: string, rawWorkplace?: string): 'remote' | 'hybrid' | 'onsite' {
  if (rawWorkplace && ['remote', 'hybrid', 'onsite'].includes(rawWorkplace.toLowerCase())) {
    return rawWorkplace.toLowerCase() as 'remote' | 'hybrid' | 'onsite';
  }
  const loc = (location || '').toLowerCase();
  if (loc.includes('remote') || loc.includes('anywhere') || loc.includes('distributed')) {
    return 'remote';
  }
  if (loc.includes('hybrid')) {
    return 'hybrid';
  }
  return 'onsite';
}

/**
 * Normalizes location strings with country metro tagging
 */
export function normalizeLocation(rawLocation?: string): string {
  const loc = (rawLocation || '').trim();
  if (!loc) return 'Remote (Global)';

  const lower = loc.toLowerCase();
  const usMetros = ['san francisco', 'sf', 'new york', 'nyc', 'austin', 'seattle', 'boston', 'los angeles', 'chicago', 'denver', 'palo alto'];
  const isUsMetro = usMetros.some((m) => new RegExp(`\\b${m}\\b`, 'i').test(lower));

  const hasCountryTag = /\b(us|usa|united states)\b/i.test(lower);
  if (isUsMetro && !hasCountryTag) {
    return `${loc} (US)`;
  }
  return loc;
}

/**
 * Normalizes compensation string or provides sensible fallback
 */
export function normalizeSalary(rawSalary?: string, title?: string): string {
  const sal = (rawSalary || '').trim();
  if (sal && sal.length > 3 && sal !== ',' && sal !== ',000') {
    return sal;
  }

  const t = (title || '').toLowerCase();
  if (t.includes('staff') || t.includes('principal') || t.includes('director') || t.includes('head') || t.includes('vp')) {
    return '$200,000 - $280,000 + Equity';
  }
  if (t.includes('senior') || t.includes('lead')) {
    return '$170,000 - $230,000 + Equity';
  }
  return '$140,000 - $190,000 + Equity';
}

/**
 * Dynamically synthesizes functional outreach doors based on the role domain
 */
export function generateFunctionalDoors(company: string, roleTitle: string): {
  door1: { name: string; title: string; confidence: number };
  door2: { name: string; title: string; confidence: number };
  door3: { name: string; title: string; confidence: number };
} {
  const titleLower = (roleTitle || '').toLowerCase();

  // Engineering & Architecture
  if (
    titleLower.includes('engineer') ||
    titleLower.includes('developer') ||
    titleLower.includes('architect') ||
    titleLower.includes('devops') ||
    titleLower.includes('frontend') ||
    titleLower.includes('backend') ||
    titleLower.includes('full stack')
  ) {
    return {
      door1: { name: `${company} VP of Engineering`, title: 'VP / Head of Engineering', confidence: 92 },
      door2: { name: 'Technical Talent Partner', title: 'Lead Technical Recruiter', confidence: 88 },
      door3: { name: 'Staff Software Engineer', title: 'Senior Engineering Peer', confidence: 84 },
    };
  }

  // Design & UX
  if (titleLower.includes('design') || titleLower.includes('ux') || titleLower.includes('ui') || titleLower.includes('creative')) {
    return {
      door1: { name: `${company} Head of Design`, title: 'VP / Head of Product Design', confidence: 92 },
      door2: { name: 'Design Talent Partner', title: 'Lead Design Recruiter', confidence: 88 },
      door3: { name: 'Staff Product Designer', title: 'Senior Design Peer', confidence: 84 },
    };
  }

  // Data & Machine Learning / AI
  if (titleLower.includes('data') || titleLower.includes('machine learning') || titleLower.includes('ml') || titleLower.includes('ai researcher')) {
    return {
      door1: { name: `${company} Head of Data & AI`, title: 'VP / Head of AI & Data', confidence: 92 },
      door2: { name: 'AI/ML Talent Partner', title: 'Lead Technical Recruiter', confidence: 88 },
      door3: { name: 'Staff Data Scientist / ML Engineer', title: 'Senior AI Peer', confidence: 84 },
    };
  }

  // Product Management
  if (titleLower.includes('product') || titleLower.includes('pm')) {
    return {
      door1: { name: `${company} VP of Product`, title: 'VP / Head of Product', confidence: 92 },
      door2: { name: 'Lead Talent Partner', title: 'Product Talent Lead', confidence: 88 },
      door3: { name: 'Staff Product Manager', title: 'Senior Product Peer', confidence: 84 },
    };
  }

  // General Executive / Domain Fallback
  return {
    door1: { name: `${company} Executive Leader`, title: 'Hiring Executive / Department Head', confidence: 92 },
    door2: { name: 'Talent Acquisition Lead', title: 'Senior Talent Partner', confidence: 88 },
    door3: { name: 'Staff Practitioner', title: 'Senior Domain Peer', confidence: 84 },
  };
}

/**
 * Normalizes description text with sensible fallback
 */
export function normalizeDescription(title: string, company: string, rawDesc?: string): string {
  const clean = (rawDesc || '').trim();
  if (clean.length >= 40) {
    return clean;
  }
  return `${title} at ${company}. Drive domain strategy, execution, cross-functional collaboration, and high-velocity platform initiatives. Partner directly with team leadership to scale business impact.`;
}

/**
 * Ingests and standardizes a single opportunity through the canonical pipeline
 */
export function ingestSingleJob(input: RawJobInput, track?: CandidateTrack): { isDuplicate: boolean; job: UnifiedJob } {
  const company = (input.company || 'Innovative Venture').trim();
  const title = (input.title || 'Senior Practitioner').trim();
  const location = normalizeLocation(input.location);
  const workplace = normalizeWorkplace(input.location, input.workplace);
  const salary = normalizeSalary(input.salary, title);
  const description = normalizeDescription(title, company, input.description);
  const source = input.source || 'universal_ingest';
  const sourceUrl = input.applyUrl && isSafeUrl(input.applyUrl) ? input.applyUrl : 'https://backdoor.app';

  // Canonical Deduplication Key (UT-DB-04)
  const dedupMatchKey = generateDedupMatchKey(company, title);
  const existing = UNIFIED_CATALOG_STORE.get(dedupMatchKey);

  if (existing) {
    // Append location if new and return existing canonical job
    if (location && !existing.location.includes(location)) {
      existing.location = `${existing.location}, ${location}`;
    }
    return { isDuplicate: true, job: existing };
  }

  // Deterministic Suitability Evaluation
  const evalInput = {
    title,
    company,
    locations: [location],
    descriptionText: description,
  };
  const activeTrack = track || DEFAULT_TRACK;
  const evalResult = evaluateJobSuitability(evalInput, activeTrack);

  // Dynamic Functional Doors
  const functionalDoors = generateFunctionalDoors(company, title);
  const door1 = input.door1 ? { ...functionalDoors.door1, ...input.door1 } : functionalDoors.door1;
  const door2 = input.door2 ? { ...functionalDoors.door2, ...input.door2 } : functionalDoors.door2;
  const door3 = input.door3 ? { ...functionalDoors.door3, ...input.door3 } : functionalDoors.door3;

  const newJob: UnifiedJob = {
    id: input.externalId || `ingest-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    company,
    title,
    fitScore: evalResult.fitScore,
    stage: 'DISCOVERED',
    location,
    workplace,
    salary,
    description,
    source,
    sourceUrl,
    applyUrl: sourceUrl,
    postedHoursAgo: 0,
    door1,
    door2,
    door3,
    dedupMatchKey,
    track: input.track || activeTrack.name,
    createdAt: new Date().toISOString(),
  };

  // Register in unified catalog
  UNIFIED_CATALOG_STORE.set(dedupMatchKey, newJob);

  // Synchronize to webhook store so Morning Radar displays it
  const webhookAdapter: WebhookJobItem = {
    id: newJob.id,
    company: newJob.company,
    title: newJob.title,
    fitScore: newJob.fitScore,
    stage: 'DISCOVERED',
    location: newJob.location,
    workplace: newJob.workplace,
    salary: newJob.salary,
    source: newJob.source,
    postedHoursAgo: newJob.postedHoursAgo,
    door1: newJob.door1,
    door2: newJob.door2,
    door3: newJob.door3,
    applyUrl: newJob.applyUrl,
  };
  addWebhookIngestedJob(webhookAdapter);

  // Log Immutable Decision Event
  logDecisionEvent({
    eventType: 'ROLE_DISCOVERED',
    jobId: newJob.id,
    company: newJob.company,
    actorType: 'SYSTEM',
    details: `Ingested ${newJob.title} at ${newJob.company} (${newJob.fitScore}% FIT) from ${newJob.source}`,
  });

  return { isDuplicate: false, job: newJob };
}

/**
 * Ingests a batch of opportunities through the canonical pipeline
 */
export function ingestBatchJobs(inputs: RawJobInput[], track?: CandidateTrack): IngestionBatchResult {
  let importedCount = 0;
  let deduplicatedCount = 0;
  const processedJobs: UnifiedJob[] = [];

  for (const item of inputs) {
    const { isDuplicate, job } = ingestSingleJob(item, track);
    if (isDuplicate) {
      deduplicatedCount++;
    } else {
      importedCount++;
    }
    processedJobs.push(job);
  }

  return {
    success: true,
    total: inputs.length,
    imported: importedCount,
    deduplicated: deduplicatedCount,
    jobs: processedJobs,
    message: `Processed ${inputs.length} opportunities: ${importedCount} imported, ${deduplicatedCount} merged as duplicates.`,
  };
}

/**
 * Returns all jobs in the unified catalog store
 */
export function getUnifiedCatalogJobs(): UnifiedJob[] {
  return Array.from(UNIFIED_CATALOG_STORE.values());
}

/**
 * Resets the unified catalog store (for clean testing)
 */
export function resetUnifiedCatalogStore(): void {
  UNIFIED_CATALOG_STORE.clear();
}
