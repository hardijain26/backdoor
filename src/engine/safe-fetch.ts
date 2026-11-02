/**
 * Subsystem 4: SSRF-Safe Fetch & Metadata Extractor (Runbook §4.4, Rule R6)
 * Blocks SSRF private/internal network access and extracts JSON-LD / OpenGraph job metadata.
 */

import { isSafeUrl } from './scraper';

export interface IngestedJobMetadata {
  title: string;
  company: string;
  location: string;
  salary?: string;
  description: string;
  applyUrl: string;
  source: string;
}

/**
 * Validates and fetches a URL safely, enforcing SSRF guards and a 5-second timeout.
 */
export async function safeFetchHtml(rawUrl: string, timeoutMs = 5000): Promise<{ ok: boolean; html?: string; error?: string }> {
  if (!isSafeUrl(rawUrl)) {
    return {
      ok: false,
      error: 'Security Exception (Rule R6): URL targets restricted or private network.'
    };
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(rawUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (Backdoor/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return { ok: false, error: `Remote server responded with status: ${response.status} ${response.statusText}` };
    }

    const html = await response.text();
    return { ok: true, html };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes('aborted')) {
      return { ok: false, error: 'Ingestion request timed out after 5 seconds.' };
    }
    return { ok: false, error: `Failed to fetch URL: ${errorMsg}` };
  }
}

/**
 * Extracts structured job metadata from HTML using JSON-LD or OpenGraph.
 */
export function extractJobMetadataFromHtml(html: string, originalUrl: string): IngestedJobMetadata {
  let title = '';
  let company = '';
  let location = 'Remote / Unspecified';
  let salary: string | undefined = undefined;
  let description = '';

  // 1. Try JSON-LD Schema (JobPosting)
  const jsonLdMatches = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
  if (jsonLdMatches) {
    for (const tag of jsonLdMatches) {
      try {
        const jsonContent = tag.replace(/<script[^>]*>|<\/script>/gi, '').trim();
        const parsed = JSON.parse(jsonContent);

        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          if (item['@type'] === 'JobPosting') {
            if (item.title) title = item.title;
            if (item.hiringOrganization?.name) company = item.hiringOrganization.name;
            if (item.description) description = item.description.replace(/<[^>]+>/g, ' ').slice(0, 2000);
            if (item.jobLocation?.address?.addressLocality) {
              location = item.jobLocation.address.addressLocality;
            }
            if (item.baseSalary?.value?.value) {
              salary = `$${item.baseSalary.value.value} ${item.baseSalary.currency || 'USD'}`;
            }
            break;
          }
        }
      } catch {
        // Continue to fallback
      }
      if (title && company) break;
    }
  }

  // 2. OpenGraph Meta Tags Fallback
  if (!title) {
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
                         html.match(/<meta[^>]*name=["']title["'][^>]*content=["']([^"']+)["']/i);
    if (ogTitleMatch) {
      title = ogTitleMatch[1].trim();
    }
  }

  if (!description) {
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    if (ogDescMatch) {
      description = ogDescMatch[1].trim();
    }
  }

  // 3. Fallback: Parse Title tag
  if (!title) {
    const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleTagMatch) {
      const rawTitle = titleTagMatch[1].trim();
      const parts = rawTitle.split(/[-–—|•]/);
      if (parts.length >= 2) {
        title = parts[0].trim();
        if (!company) company = parts[1].trim();
      } else {
        title = rawTitle;
      }
    }
  }

  // 4. Fallback: Infer company from domain
  if (!company) {
    try {
      const parsedUrl = new URL(originalUrl);
      const hostParts = parsedUrl.hostname.split('.');
      if (hostParts.length >= 2) {
        const domainName = hostParts[hostParts.length - 2];
        company = domainName.charAt(0).toUpperCase() + domainName.slice(1);
      }
    } catch {
      company = 'Direct Company';
    }
  }

  // Determine source domain
  let source = 'direct';
  try {
    const urlObj = new URL(originalUrl);
    if (urlObj.hostname.includes('greenhouse')) source = 'greenhouse';
    else if (urlObj.hostname.includes('lever')) source = 'lever';
    else if (urlObj.hostname.includes('ashby')) source = 'ashby';
    else if (urlObj.hostname.includes('workable')) source = 'workable';
    else if (urlObj.hostname.includes('linkedin')) source = 'linkedin';
    else source = urlObj.hostname.replace('www.', '');
  } catch {
    source = 'universal_ingest';
  }

  return {
    title: title || 'Product Manager',
    company: company || 'Technology Company',
    location: location || 'Remote',
    salary,
    description: description || 'Role ingested via Universal Ingest Engine.',
    applyUrl: originalUrl,
    source
  };
}

/**
 * Extracts job information from pasted raw message text (Slack, Twitter, Email).
 */
export function extractJobFromRawText(rawText: string): IngestedJobMetadata {
  const cleanHtml = rawText.replace(/<[^>]+>/g, ' ');
  const lines = cleanHtml.split('\n').map((l) => l.trim()).filter(Boolean);

  // Common title keywords
  const titleRegex = /(?:Senior|Staff|Principal|Lead|Head of|VP|Associate)?\s*(?:AI\s+|Technical\s+|Growth\s+|Platform\s+)?Product\s+Manager(?:\s*,\s*[\w\s]+)?/i;
  let title = 'Product Manager';
  for (const line of lines) {
    const match = line.match(titleRegex);
    if (match) {
      title = match[0].trim();
      break;
    }
  }

  // Company keyword detection (handles "at Company", "@Company", and "Company · Location")
  const atCompanyRegex = /(?:at\s+|@\s*)([A-Z][A-Za-z0-9&]+)/;
  const dotCompanyRegex = /^\s*([A-Z][A-Za-z0-9&]+(?:\s+[A-Z][A-Za-z0-9&]+)?)\s*(?:[·•|])/;
  let company = 'Target Company';
  for (const line of lines) {
    const match = line.match(atCompanyRegex);
    if (match && match[1]) {
      company = match[1].trim();
      break;
    }
    const dotMatch = line.match(dotCompanyRegex);
    if (dotMatch && dotMatch[1] && !['Job', 'Posted', 'View', 'Remote', 'Hybrid', 'Location', 'Staff', 'Principal', 'Senior', 'Lead', 'Head'].includes(dotMatch[1])) {
      company = dotMatch[1].trim();
      break;
    }
  }

  // Salary range detection
  const salaryRegex = /\$[\d,]+k?\s*[-–—]\s*\$[\d,]+k?/i;
  const salaryMatch = rawText.match(salaryRegex);
  const salary = salaryMatch ? salaryMatch[0] : undefined;

  // URL detection
  const urlMatch = rawText.match(/https?:\/\/[^\s]+/i);
  const applyUrl = urlMatch ? urlMatch[0] : '';

  return {
    title,
    company,
    location: rawText.toLowerCase().includes('remote') ? 'Remote (US/Global)' : 'San Francisco, CA',
    salary,
    description: rawText.slice(0, 2000),
    applyUrl: applyUrl || 'https://backdoor.app/ingest',
    source: 'pasted_text'
  };
}

/**
 * Unwraps and sanitizes LinkedIn job URLs, stripping marketing and tracking redirects.
 * e.g. https://www.linkedin.com/jobs/view/3920192831/?trk=eml-job-alert-member-&refId=...
 * -> https://www.linkedin.com/jobs/view/3920192831
 */
export function unwrapLinkedInJobUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const viewMatch = parsed.pathname.match(/\/jobs\/view\/(\d+)/i);
    if (viewMatch) {
      return `https://www.linkedin.com/jobs/view/${viewMatch[1]}`;
    }
    // Strip common tracking query params
    const trackingParams = ['trk', 'trkInfo', 'refId', 'trackingId', 'midToken', 'midSig', 'trkEmail', 'otpToken'];
    trackingParams.forEach((param) => parsed.searchParams.delete(param));
    return parsed.toString();
  } catch {
    return rawUrl;
  }
}

/**
 * Parses individual job cards from LinkedIn Email Digest notifications.
 */
export function parseLinkedInEmailDigest(emailHtmlOrText: string): IngestedJobMetadata[] {
  const jobs: IngestedJobMetadata[] = [];

  // Match LinkedIn job links
  const jobLinkRegex = /https:\/\/[a-z]{2,3}\.linkedin\.com\/comm\/jobs\/view\/(\d+)[^\s"'>]*|https:\/\/www\.linkedin\.com\/jobs\/view\/(\d+)[^\s"'>]*/gi;
  const matches = emailHtmlOrText.match(jobLinkRegex) || [];

  const seenIds = new Set<string>();

  for (const rawUrl of matches) {
    const cleanUrl = unwrapLinkedInJobUrl(rawUrl);
    const idMatch = cleanUrl.match(/\/jobs\/view\/(\d+)/);
    const jobId = idMatch ? idMatch[1] : cleanUrl;

    if (seenIds.has(jobId)) continue;
    seenIds.add(jobId);

    // Look for contextual snippet around the match (expanded window to capture verbose email HTML markup)
    const urlIdx = emailHtmlOrText.indexOf(rawUrl);
    const contextSnippet = emailHtmlOrText.slice(Math.max(0, urlIdx - 600), Math.min(emailHtmlOrText.length, urlIdx + 800));

    const parsed = extractJobFromRawText(contextSnippet);
    jobs.push({
      ...parsed,
      applyUrl: cleanUrl,
      source: 'linkedin_digest'
    });
  }

  return jobs;
}

/**
 * Indian Tech Metro Cluster Normalization Map (Naukri Ingestion)
 */
export const INDIAN_METRO_CLUSTERS: Record<string, string> = {
  bengaluru: 'Bengaluru, KA',
  bangalore: 'Bengaluru, KA',
  gurugram: 'Delhi NCR, India',
  gurgaon: 'Delhi NCR, India',
  noida: 'Delhi NCR, India',
  delhi: 'Delhi NCR, India',
  ncr: 'Delhi NCR, India',
  hyderabad: 'Hyderabad, TS',
  secunderabad: 'Hyderabad, TS',
  pune: 'Pune, MH',
  mumbai: 'Mumbai, MH',
  chennai: 'Chennai, TN'
};

export function normalizeIndianMetro(rawLocation: string): string {
  const locLower = rawLocation.toLowerCase();
  for (const [key, normalized] of Object.entries(INDIAN_METRO_CLUSTERS)) {
    if (locLower.includes(key)) {
      return normalized;
    }
  }
  return rawLocation || 'Bengaluru, KA';
}

/**
 * Parses Indian compensation structures in Lacs / LPA (e.g. "₹25 - 40 Lacs P.A.", "30 LPA", "18-25 Lacs")
 */
export function parseIndianCtcCompensation(rawText: string): string | undefined {
  const lpaRegex = /(?:₹|Rs\.?|INR)?\s*(\d+(?:\.\d+)?)\s*(?:L|Lacs?|Lakhs?)?\s*(?:[-–—to ]+)\s*(?:₹|Rs\.?|INR)?\s*(\d+(?:\.\d+)?)\s*(?:Lacs?|Lakhs?|LPA|L)(?:\s*P\.?A\.?)?/i;
  const singleLpaRegex = /(?:₹|Rs\.?|INR)?\s*(\d+(?:\.\d+)?)\s*(?:Lacs?|Lakhs?|LPA|L)(?:\s*P\.?A\.?)?/i;

  const matchRange = rawText.match(lpaRegex);
  if (matchRange) {
    return `₹${matchRange[1]}L - ₹${matchRange[2]}L PA`;
  }

  const matchSingle = rawText.match(singleLpaRegex);
  if (matchSingle) {
    return `₹${matchSingle[1]}L PA`;
  }

  return undefined;
}

export interface NaukriAlertParsedJob extends IngestedJobMetadata {
  recruiterInfo?: {
    name?: string;
    designation?: string;
    company?: string;
  };
}

/**
 * Parses Naukri India Job Alert Inbound Messages & Webhooks
 */
export function parseNaukriJobAlert(alertHtmlOrText: string): NaukriAlertParsedJob[] {
  const jobs: NaukriAlertParsedJob[] = [];

  // Match Naukri job card blocks or URLs
  const naukriUrlRegex = /https:\/\/(?:www\.)?naukri\.com\/job-listings-[^\s"'>]+/gi;
  const urls = alertHtmlOrText.match(naukriUrlRegex) || [];

  const rawBlocks = alertHtmlOrText.split(/(?:Job\s*#?\d+|Posted\s+by|View\s+Job)/i).filter((b) => b.trim().length > 30);

  if (urls.length === 0 && rawBlocks.length > 0) {
    // Process text-based alert
    for (const block of rawBlocks) {
      const parsed = extractJobFromRawText(block);
      const ctc = parseIndianCtcCompensation(block);
      const loc = normalizeIndianMetro(block);

      jobs.push({
        ...parsed,
        location: loc,
        salary: ctc || parsed.salary,
        source: 'naukri_webhook'
      });
    }
    return jobs;
  }

  for (const rawUrl of urls) {
    const urlIdx = alertHtmlOrText.indexOf(rawUrl);
    const snippet = alertHtmlOrText.slice(Math.max(0, urlIdx - 400), Math.min(alertHtmlOrText.length, urlIdx + 800));
    const parsed = extractJobFromRawText(snippet);
    const ctc = parseIndianCtcCompensation(snippet);
    const loc = normalizeIndianMetro(snippet);

    // Extract recruiter attribute if available
    const recMatch = snippet.match(/Recruiter:\s*([A-Za-z\s]+?)(?:\||\n|,|at)/i);
    const recTitleMatch = snippet.match(/(?:HR\s+Manager|Talent\s+Acquisition|Lead\s+Recruiter)/i);

    jobs.push({
      ...parsed,
      applyUrl: rawUrl,
      location: loc,
      salary: ctc || parsed.salary,
      source: 'naukri_webhook',
      recruiterInfo: recMatch ? {
        name: recMatch[1].trim(),
        designation: recTitleMatch ? recTitleMatch[0] : 'Technical Recruiter',
        company: parsed.company
      } : undefined
    });
  }

  return jobs;
}

/**
 * Parses raw messages from connected Slack hiring channels (#jobs, #hiring).
 */
export function parseSlackMessage(
  messageText: string,
  channelName = '#jobs',
  workspace = 'Community Workspace'
): IngestedJobMetadata {
  // Strip Slack markup: <https://url|text> -> https://url
  const cleanedText = messageText
    .replace(/<(https?:\/\/[^|>]+)(?:\|[^>]+)?>/g, '$1')
    .replace(/<@[A-Z0-9]+>/g, '')
    .trim();

  const base = extractJobFromRawText(cleanedText);

  return {
    ...base,
    source: 'slack_community',
    description: `[Slack: ${workspace} ${channelName}]\n${base.description}`
  };
}

/**
 * Extracts structured job data from a public Twitter / X hiring post snippet.
 */
export function extractJobFromSnippet(snippetText: string, authorHandle = '@unknown'): IngestedJobMetadata {
  const base = extractJobFromRawText(snippetText);

  // If company not found, infer from Twitter author handle
  let inferredCompany = base.company;
  if (!inferredCompany || inferredCompany === 'Target Company') {
    inferredCompany = authorHandle.replace(/^@/, '');
    inferredCompany = inferredCompany.charAt(0).toUpperCase() + inferredCompany.slice(1);
  }

  return {
    ...base,
    company: inferredCompany,
    source: 'twitter_x',
    description: `[Twitter / X via ${authorHandle}]\n${snippetText.slice(0, 1500)}`
  };
}

/**
 * Evaluates whether a tweet matches hiring triggers and parses it.
 */
export function parseTwitterHiringTweet(tweetText: string, authorHandle = '@unknown'): IngestedJobMetadata | null {
  const HIRING_TRIGGERS = /(hiring|open role|join our team|we're looking for|we are looking for|apply:|job alert)/i;
  if (!HIRING_TRIGGERS.test(tweetText)) {
    return null;
  }
  return extractJobFromSnippet(tweetText, authorHandle);
}

