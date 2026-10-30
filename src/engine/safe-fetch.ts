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
  const lines = rawText.split('\n').map((l) => l.trim()).filter(Boolean);

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

  // Company keyword detection
  const atCompanyRegex = /(?:at|@)\s+([A-Z][A-Za-z0-9&]+)/;
  let company = 'Target Company';
  for (const line of lines) {
    const match = line.match(atCompanyRegex);
    if (match && match[1]) {
      company = match[1].trim();
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

