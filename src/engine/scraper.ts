/**
 * Subsystem 4: Autonomous Ingestion & Polite Scraping Engine (@ingest/scout M2)
 * Ingestion across 35 verified sources with SSRF prevention (Rule R6) and negative filters.
 */

export type SourceSection = 'ATS' | 'PLATFORM_API' | 'SOCIAL_INBOUND';
export type SourceRole = 'all' | 'product' | 'engineering' | 'design' | 'legal' | 'finance';
export type PlatformCategory = 'remote' | 'startup' | 'product_dynamic' | 'aggregator';

export interface SourceDefinition {
  id: string;
  name: string;
  category: 'ATS_DIRECT' | 'COMPANY_DIRECT' | 'REMOTE_PM_BOARDS' | 'CURATED_COMMUNITIES' | 'INBOUND_CLIPPERS' | 'BYOK_AGGREGATORS';
  section: SourceSection;
  platformCategory?: PlatformCategory;
  applicableRoles: SourceRole[];
  requiresKey: boolean;
  rateLimitMs: number;
}

export const VERIFIED_SOURCES: SourceDefinition[] = [
  // 1. ATS Direct (8 Sources) — Section: ATS
  { id: 'greenhouse', name: 'Greenhouse ATS', category: 'ATS_DIRECT', section: 'ATS', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 500 },
  { id: 'lever', name: 'Lever ATS', category: 'ATS_DIRECT', section: 'ATS', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 500 },
  { id: 'ashby', name: 'Ashby ATS', category: 'ATS_DIRECT', section: 'ATS', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 500 },
  { id: 'workable', name: 'Workable ATS', category: 'ATS_DIRECT', section: 'ATS', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 500 },
  { id: 'smartrecruiters', name: 'SmartRecruiters', category: 'ATS_DIRECT', section: 'ATS', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 500 },
  { id: 'bamboohr', name: 'BambooHR', category: 'ATS_DIRECT', section: 'ATS', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 500 },
  { id: 'rippling', name: 'Rippling', category: 'ATS_DIRECT', section: 'ATS', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 500 },
  { id: 'recruitee', name: 'Recruitee', category: 'ATS_DIRECT', section: 'ATS', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 500 },

  // 2. Company Direct (1 Source) — Section: ATS
  { id: 'careers_jsonld', name: 'Careers JSON-LD Crawler', category: 'COMPANY_DIRECT', section: 'ATS', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 1000 },

  // 3. Remote PM Boards (6 Sources) — Section: PLATFORM_API (Category: remote)
  { id: 'remotive', name: 'Remotive', category: 'REMOTE_PM_BOARDS', section: 'PLATFORM_API', platformCategory: 'remote', applicableRoles: ['product', 'engineering', 'design'], requiresKey: false, rateLimitMs: 500 },
  { id: 'remoteok', name: 'RemoteOK', category: 'REMOTE_PM_BOARDS', section: 'PLATFORM_API', platformCategory: 'remote', applicableRoles: ['product', 'engineering', 'design', 'finance'], requiresKey: false, rateLimitMs: 500 },
  { id: 'weworkremotely', name: 'We Work Remotely', category: 'REMOTE_PM_BOARDS', section: 'PLATFORM_API', platformCategory: 'remote', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 500 },
  { id: 'jobspresso', name: 'Jobspresso', category: 'REMOTE_PM_BOARDS', section: 'PLATFORM_API', platformCategory: 'remote', applicableRoles: ['product', 'design', 'engineering'], requiresKey: false, rateLimitMs: 500 },
  { id: 'himalayas', name: 'Himalayas', category: 'REMOTE_PM_BOARDS', section: 'PLATFORM_API', platformCategory: 'remote', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 500 },
  { id: 'justremote', name: 'JustRemote', category: 'REMOTE_PM_BOARDS', section: 'PLATFORM_API', platformCategory: 'remote', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 500 },

  // 4. Startup Ecosystem Hubs (4 Sources) — Section: PLATFORM_API (Category: startup)
  { id: 'yc_startup', name: 'YC Work at a Startup', category: 'CURATED_COMMUNITIES', section: 'PLATFORM_API', platformCategory: 'startup', applicableRoles: ['engineering', 'product', 'design'], requiresKey: false, rateLimitMs: 500 },
  { id: 'wellfound', name: 'Wellfound (AngelList)', category: 'REMOTE_PM_BOARDS', section: 'PLATFORM_API', platformCategory: 'startup', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 500 },
  { id: 'hn_hiring', name: 'Hacker News "Who is Hiring"', category: 'CURATED_COMMUNITIES', section: 'PLATFORM_API', platformCategory: 'startup', applicableRoles: ['engineering', 'product'], requiresKey: false, rateLimitMs: 500 },
  { id: 'product_hunt', name: 'Product Hunt Jobs', category: 'CURATED_COMMUNITIES', section: 'PLATFORM_API', platformCategory: 'startup', applicableRoles: ['product', 'design'], requiresKey: false, rateLimitMs: 500 },

  // 5. Product Management & Curated Networks (7 Sources) — Section: PLATFORM_API (Category: product_dynamic)
  { id: 'lennys_jobs', name: "Lenny's Newsletter Job Board", category: 'CURATED_COMMUNITIES', section: 'PLATFORM_API', platformCategory: 'product_dynamic', applicableRoles: ['product', 'engineering'], requiresKey: false, rateLimitMs: 500 },
  { id: 'mind_the_product', name: 'Mind the Product', category: 'CURATED_COMMUNITIES', section: 'PLATFORM_API', platformCategory: 'product_dynamic', applicableRoles: ['product'], requiresKey: false, rateLimitMs: 500 },
  { id: 'mindstone', name: 'Mindstone', category: 'CURATED_COMMUNITIES', section: 'PLATFORM_API', platformCategory: 'product_dynamic', applicableRoles: ['product', 'engineering'], requiresKey: false, rateLimitMs: 500 },
  { id: 'otta', name: 'Otta', category: 'CURATED_COMMUNITIES', section: 'PLATFORM_API', platformCategory: 'product_dynamic', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 500 },
  { id: 'levels_fyi', name: 'Levels.fyi', category: 'CURATED_COMMUNITIES', section: 'PLATFORM_API', platformCategory: 'product_dynamic', applicableRoles: ['engineering', 'product', 'design', 'finance', 'legal'], requiresKey: false, rateLimitMs: 500 },
  { id: 'builtin', name: 'BuiltIn', category: 'CURATED_COMMUNITIES', section: 'PLATFORM_API', platformCategory: 'product_dynamic', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 500 },
  { id: 'the_muse', name: 'The Muse', category: 'CURATED_COMMUNITIES', section: 'PLATFORM_API', platformCategory: 'product_dynamic', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 500 },

  // 6. Direct Inbound & Clippers (3 Sources) — Section: SOCIAL_INBOUND
  { id: 'google_alerts', name: 'Google Alerts Inbound Webhook', category: 'INBOUND_CLIPPERS', section: 'SOCIAL_INBOUND', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 0 },
  { id: 'naukri_webhook', name: 'Naukri Forwarder Webhook', category: 'INBOUND_CLIPPERS', section: 'SOCIAL_INBOUND', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 0 },
  { id: 'chrome_clipper', name: 'Chrome Clipper Extension', category: 'INBOUND_CLIPPERS', section: 'SOCIAL_INBOUND', applicableRoles: ['all'], requiresKey: false, rateLimitMs: 0 },

  // 7. BYOK Aggregators (6 Sources) — Section: PLATFORM_API (Category: aggregator)
  { id: 'apify_greenhouse', name: 'Apify Greenhouse Actor', category: 'BYOK_AGGREGATORS', section: 'PLATFORM_API', platformCategory: 'aggregator', applicableRoles: ['all'], requiresKey: true, rateLimitMs: 1000 },
  { id: 'apify_linkedin', name: 'Apify LinkedIn Actor', category: 'BYOK_AGGREGATORS', section: 'PLATFORM_API', platformCategory: 'aggregator', applicableRoles: ['all'], requiresKey: true, rateLimitMs: 1000 },
  { id: 'rapidapi_jsearch', name: 'RapidAPI JSearch', category: 'BYOK_AGGREGATORS', section: 'PLATFORM_API', platformCategory: 'aggregator', applicableRoles: ['all'], requiresKey: true, rateLimitMs: 1000 },
  { id: 'apollo_jobs', name: 'Apollo Jobs API', category: 'BYOK_AGGREGATORS', section: 'PLATFORM_API', platformCategory: 'aggregator', applicableRoles: ['all'], requiresKey: true, rateLimitMs: 1000 },
  { id: 'hunter_leads', name: 'Hunter Tech Leads', category: 'BYOK_AGGREGATORS', section: 'PLATFORM_API', platformCategory: 'aggregator', applicableRoles: ['all'], requiresKey: true, rateLimitMs: 1000 },
  { id: 'serpapi_jobs', name: 'SerpApi Google Jobs', category: 'BYOK_AGGREGATORS', section: 'PLATFORM_API', platformCategory: 'aggregator', applicableRoles: ['all'], requiresKey: true, rateLimitMs: 1000 }
];

export interface ScrapedJob {
  source: string;
  externalId: string;
  title: string;
  company: string;
  locations: string[];
  region: string;
  workplace: 'remote' | 'hybrid' | 'onsite';
  applyUrl: string;
  salaryRaw?: string;
  descriptionText: string;
  postedAt?: string;
}

export const USER_AGENT = 'BackdoorBot/1.0 (+https://backdoor.app/bot)';

/**
 * SSRF Safe URL Validator (Rule R6)
 * Blocks private subnets, loopback, link-local, and dangerous protocol schemes.
 */
export function isSafeUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Loopback / localhost checks
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.localhost') ||
      hostname.endsWith('.local')
    ) {
      return false;
    }

    // Link-local address (e.g. AWS metadata 169.254.169.254)
    if (hostname === '169.254.169.254' || hostname.startsWith('169.254.')) {
      return false;
    }

    // IPv4 private ranges (RFC 1918)
    const ipv4Match = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (ipv4Match) {
      const b0 = parseInt(ipv4Match[1], 10);
      const b1 = parseInt(ipv4Match[2], 10);

      // 10.0.0.0/8
      if (b0 === 10) return false;
      // 172.16.0.0/12 (172.16 - 172.31)
      if (b0 === 172 && b1 >= 16 && b1 <= 31) return false;
      // 192.168.0.0/16
      if (b0 === 192 && b1 === 168) return false;
      // 0.0.0.0
      if (b0 === 0) return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Pre-Storage Negative Filters (Runbook §5.2)
 * Drops postings if:
 * - Title matches: dynamic regex from customExcludedTitlePatterns or default /(marketing|engineering manager|tpm|scrum|recruiter)/i
 * - Company or description matches: /(fintech|payments|crypto|web3|neo-?bank|lending|p2p)/i
 */
export function passesNegativeFilters(
  job: { title: string; company: string; descriptionText?: string },
  customExcludedTitlePatterns?: string[]
): {
  passed: boolean;
  reason?: string;
} {
  let bannedTitleRegex: RegExp;
  if (customExcludedTitlePatterns && customExcludedTitlePatterns.length > 0) {
    const escaped = customExcludedTitlePatterns
      .map((p) => p.trim())
      .filter(Boolean)
      .map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    bannedTitleRegex = escaped.length > 0 ? new RegExp(`(${escaped.join('|')})`, 'i') : /(marketing|engineering manager|tpm|scrum|recruiter)/i;
  } else {
    bannedTitleRegex = /(marketing|engineering manager|tpm|scrum|recruiter)/i;
  }

  const BANNED_INDUSTRY_REGEX = /(fintech|payments|crypto|web3|neo-?bank|lending|p2p)/i;

  if (bannedTitleRegex.test(job.title)) {
    return { passed: false, reason: `Excluded title keyword in: "${job.title}"` };
  }

  if (BANNED_INDUSTRY_REGEX.test(job.company)) {
    return { passed: false, reason: `Excluded industry keyword in company name: "${job.company}"` };
  }

  if (job.descriptionText && BANNED_INDUSTRY_REGEX.test(job.descriptionText)) {
    return { passed: false, reason: `Excluded industry keyword in job description` };
  }

  return { passed: true };
}

/**
 * Dynamic Track Query Interpolation for BYOK Aggregators (JSearch, SerpApi Google Jobs, Apollo Jobs)
 * Passes candidate's active dynamic target titles across multi-role tracks (UX, Legal, Accounting, Engineering, Product).
 */
export function buildAggregatorQuery(
  sourceId: string,
  targetTitles: string[] = ['Product Manager'],
  location = 'Remote'
): { query: string; params: Record<string, string> } {
  const titles = targetTitles.length > 0 ? targetTitles : ['Product Manager'];
  const formattedTitles = titles.map((t) => `"${t}"`).join(' OR ');

  switch (sourceId) {
    case 'rapidapi_jsearch':
      return {
        query: `${formattedTitles} ${location}`,
        params: {
          query: `${formattedTitles} in ${location}`,
          page: '1',
          num_pages: '1',
          date_posted: 'today',
        },
      };
    case 'serpapi_jobs':
      return {
        query: `${formattedTitles} ${location}`,
        params: {
          engine: 'google_jobs',
          q: `${formattedTitles} ${location}`,
          chips: 'date_posted:today',
        },
      };
    case 'apollo_jobs':
      return {
        query: `${formattedTitles}`,
        params: {
          job_titles: titles.join(','),
          person_locations: location,
        },
      };
    default:
      return {
        query: `${formattedTitles} ${location}`,
        params: { q: `${formattedTitles} ${location}` },
      };
  }
}

/**
 * Crawl Window Configuration (M2-FR1 Onboarding / Daily Incremental)
 * First-time users look back 15 days (360 hours) across all 35 sources.
 * Daily scheduled cron runs incrementally for the past 24 hours.
 */
export interface CrawlWindowConfig {
  isFirstTimeUser: boolean;
  lookbackDays: number; // 15 for first-time onboarding, 1 for daily incremental
  lookbackHours: number; // 360 vs 24
  sinceTimestamp: Date;
}

export function getCrawlWindow(isFirstTimeUser: boolean, lastCrawledAt?: Date | string | null): CrawlWindowConfig {
  const now = new Date();
  if (isFirstTimeUser || !lastCrawledAt) {
    const fifteenDaysAgo = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    return {
      isFirstTimeUser: true,
      lookbackDays: 15,
      lookbackHours: 360,
      sinceTimestamp: fifteenDaysAgo
    };
  }
  const lastCrawl = new Date(lastCrawledAt);
  const hoursSinceLast = Math.max(1, Math.round((now.getTime() - lastCrawl.getTime()) / (1000 * 60 * 60)));
  return {
    isFirstTimeUser: false,
    lookbackDays: Math.ceil(hoursSinceLast / 24),
    lookbackHours: Math.min(hoursSinceLast, 24),
    sinceTimestamp: lastCrawl
  };
}

/**
 * Runner stub for source crawlers
 */
export async function runScraper(sourceId: string, crawlConfig?: CrawlWindowConfig): Promise<ScrapedJob[]> {
  const source = VERIFIED_SOURCES.find((s) => s.id === sourceId);
  if (!source) {
    throw new Error(`Unknown source: ${sourceId}`);
  }
  // Source runner returns parsed records passing negative filters
  return [];
}
