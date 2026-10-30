/**
 * Subsystem 4: Autonomous Ingestion & Polite Scraping Engine (@ingest/scout M2)
 * Ingestion across 35 verified sources with SSRF prevention (Rule R6) and negative filters.
 */

export interface SourceDefinition {
  id: string;
  name: string;
  category: 'ATS_DIRECT' | 'COMPANY_DIRECT' | 'REMOTE_PM_BOARDS' | 'CURATED_COMMUNITIES' | 'INBOUND_CLIPPERS' | 'BYOK_AGGREGATORS';
  requiresKey: boolean;
  rateLimitMs: number;
}

export const VERIFIED_SOURCES: SourceDefinition[] = [
  // 1. ATS Direct (8 Sources)
  { id: 'greenhouse', name: 'Greenhouse ATS', category: 'ATS_DIRECT', requiresKey: false, rateLimitMs: 500 },
  { id: 'lever', name: 'Lever ATS', category: 'ATS_DIRECT', requiresKey: false, rateLimitMs: 500 },
  { id: 'ashby', name: 'Ashby ATS', category: 'ATS_DIRECT', requiresKey: false, rateLimitMs: 500 },
  { id: 'workable', name: 'Workable ATS', category: 'ATS_DIRECT', requiresKey: false, rateLimitMs: 500 },
  { id: 'smartrecruiters', name: 'SmartRecruiters', category: 'ATS_DIRECT', requiresKey: false, rateLimitMs: 500 },
  { id: 'bamboohr', name: 'BambooHR', category: 'ATS_DIRECT', requiresKey: false, rateLimitMs: 500 },
  { id: 'rippling', name: 'Rippling', category: 'ATS_DIRECT', requiresKey: false, rateLimitMs: 500 },
  { id: 'recruitee', name: 'Recruitee', category: 'ATS_DIRECT', requiresKey: false, rateLimitMs: 500 },

  // 2. Company Direct (1 Source)
  { id: 'careers_jsonld', name: 'Careers JSON-LD Crawler', category: 'COMPANY_DIRECT', requiresKey: false, rateLimitMs: 1000 },

  // 3. Remote PM Boards (7 Sources)
  { id: 'remotive', name: 'Remotive', category: 'REMOTE_PM_BOARDS', requiresKey: false, rateLimitMs: 500 },
  { id: 'remoteok', name: 'RemoteOK', category: 'REMOTE_PM_BOARDS', requiresKey: false, rateLimitMs: 500 },
  { id: 'weworkremotely', name: 'We Work Remotely', category: 'REMOTE_PM_BOARDS', requiresKey: false, rateLimitMs: 500 },
  { id: 'jobspresso', name: 'Jobspresso', category: 'REMOTE_PM_BOARDS', requiresKey: false, rateLimitMs: 500 },
  { id: 'wellfound', name: 'Wellfound (AngelList)', category: 'REMOTE_PM_BOARDS', requiresKey: false, rateLimitMs: 500 },
  { id: 'himalayas', name: 'Himalayas', category: 'REMOTE_PM_BOARDS', requiresKey: false, rateLimitMs: 500 },
  { id: 'justremote', name: 'JustRemote', category: 'REMOTE_PM_BOARDS', requiresKey: false, rateLimitMs: 500 },

  // 4. Curated Tech Communities (10 Sources)
  { id: 'yc_startup', name: 'YC Work at a Startup', category: 'CURATED_COMMUNITIES', requiresKey: false, rateLimitMs: 500 },
  { id: 'hn_hiring', name: 'Hacker News "Who is Hiring"', category: 'CURATED_COMMUNITIES', requiresKey: false, rateLimitMs: 500 },
  { id: 'product_hunt', name: 'Product Hunt Jobs', category: 'CURATED_COMMUNITIES', requiresKey: false, rateLimitMs: 500 },
  { id: 'lennys_jobs', name: "Lenny's Newsletter Job Board", category: 'CURATED_COMMUNITIES', requiresKey: false, rateLimitMs: 500 },
  { id: 'mind_the_product', name: 'Mind the Product', category: 'CURATED_COMMUNITIES', requiresKey: false, rateLimitMs: 500 },
  { id: 'mindstone', name: 'Mindstone', category: 'CURATED_COMMUNITIES', requiresKey: false, rateLimitMs: 500 },
  { id: 'otta', name: 'Otta', category: 'CURATED_COMMUNITIES', requiresKey: false, rateLimitMs: 500 },
  { id: 'levels_fyi', name: 'Levels.fyi', category: 'CURATED_COMMUNITIES', requiresKey: false, rateLimitMs: 500 },
  { id: 'builtin', name: 'BuiltIn', category: 'CURATED_COMMUNITIES', requiresKey: false, rateLimitMs: 500 },
  { id: 'the_muse', name: 'The Muse', category: 'CURATED_COMMUNITIES', requiresKey: false, rateLimitMs: 500 },

  // 5. Direct Inbound & Clippers (3 Sources)
  { id: 'google_alerts', name: 'Google Alerts Inbound Webhook', category: 'INBOUND_CLIPPERS', requiresKey: false, rateLimitMs: 0 },
  { id: 'naukri_webhook', name: 'Naukri Forwarder Webhook', category: 'INBOUND_CLIPPERS', requiresKey: false, rateLimitMs: 0 },
  { id: 'chrome_clipper', name: 'Chrome Clipper Extension', category: 'INBOUND_CLIPPERS', requiresKey: false, rateLimitMs: 0 },

  // 6. BYOK Aggregators (6 Sources)
  { id: 'apify_greenhouse', name: 'Apify Greenhouse Actor', category: 'BYOK_AGGREGATORS', requiresKey: true, rateLimitMs: 1000 },
  { id: 'apify_linkedin', name: 'Apify LinkedIn Actor', category: 'BYOK_AGGREGATORS', requiresKey: true, rateLimitMs: 1000 },
  { id: 'rapidapi_jsearch', name: 'RapidAPI JSearch', category: 'BYOK_AGGREGATORS', requiresKey: true, rateLimitMs: 1000 },
  { id: 'apollo_jobs', name: 'Apollo Jobs API', category: 'BYOK_AGGREGATORS', requiresKey: true, rateLimitMs: 1000 },
  { id: 'hunter_leads', name: 'Hunter Tech Leads', category: 'BYOK_AGGREGATORS', requiresKey: true, rateLimitMs: 1000 },
  { id: 'serpapi_jobs', name: 'SerpApi Google Jobs', category: 'BYOK_AGGREGATORS', requiresKey: true, rateLimitMs: 1000 }
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

export const USER_AGENT = 'ThreeDoorsBot/1.0 (+https://threedoors.app/bot)';

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
 * - Title matches: /(marketing|engineering manager|tpm|scrum|recruiter)/i
 * - Company or description matches: /(fintech|payments|crypto|web3|neo-?bank|lending|p2p)/i
 */
export function passesNegativeFilters(job: { title: string; company: string; descriptionText?: string }): {
  passed: boolean;
  reason?: string;
} {
  const BANNED_TITLE_REGEX = /(marketing|engineering manager|tpm|scrum|recruiter)/i;
  const BANNED_INDUSTRY_REGEX = /(fintech|payments|crypto|web3|neo-?bank|lending|p2p)/i;

  if (BANNED_TITLE_REGEX.test(job.title)) {
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
 * Runner stub for source crawlers
 */
export async function runScraper(sourceId: string): Promise<ScrapedJob[]> {
  const source = VERIFIED_SOURCES.find((s) => s.id === sourceId);
  if (!source) {
    throw new Error(`Unknown source: ${sourceId}`);
  }
  // Source runner returns parsed records passing negative filters
  return [];
}
