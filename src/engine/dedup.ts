/**
 * Subsystem 1 & 4: Deduplication & Canonical Match Key Engine
 * Enforces canonical dedup_match_key = clean_company(company) + ':' + clean_title(title)
 * Verified against UT-DB-04: "Google, Inc." + "Sr. PM" -> "google:senior_product_manager"
 */

/**
 * Normalizes company name:
 * - Lowercase
 * - Removes corporate entity suffixes (Inc, Ltd, LLC, Technologies, Corp, Co)
 * - Strips punctuation and excessive whitespace
 */
export function cleanCompany(company: string): string {
  if (!company) return '';

  let cleaned = company.toLowerCase().trim();

  // Strip punctuation except spaces and alphanumeric
  cleaned = cleaned.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');

  // Remove corporate suffixes as standalone words
  const suffixes = ['inc', 'ltd', 'llc', 'technologies', 'technology', 'tech', 'corp', 'corporation', 'company', 'co'];
  const words = cleaned.split(/\s+/).filter(Boolean);

  const filteredWords = words.filter((w) => !suffixes.includes(w));
  return filteredWords.join('_') || words.join('_');
}

/**
 * Normalizes job title:
 * - Lowercase
 * - Expands standard abbreviations (Sr -> senior, PM -> product_manager, VP -> vice_president)
 * - Strips punctuation and normalizes with underscores
 */
export function cleanTitle(title: string): string {
  if (!title) return '';

  let cleaned = title.toLowerCase().trim();

  // Strip punctuation except spaces
  cleaned = cleaned.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, ' ');

  // Split into tokens
  const tokens = cleaned.split(/\s+/).filter(Boolean);

  // Map known PM title abbreviations
  const mappedTokens = tokens.map((token) => {
    switch (token) {
      case 'sr':
        return 'senior';
      case 'jr':
        return 'junior';
      case 'vp':
        return 'vice_president';
      case 'pm':
        return 'product_manager';
      case 'mgr':
        return 'manager';
      case 'dir':
        return 'director';
      case 'prin':
      case 'princ':
        return 'principal';
      default:
        return token;
    }
  });

  return mappedTokens.join('_');
}

/**
 * Computes canonical dedup_match_key
 * Format: clean_company(company) + ':' + clean_title(title)
 * Example: "Google, Inc." + "Sr. PM" -> "google:senior_product_manager"
 */
export function generateDedupMatchKey(company: string, title: string): string {
  const companyKey = cleanCompany(company);
  const titleKey = cleanTitle(title);
  return `${companyKey}:${titleKey}`;
}

export interface IngestedJobRecord {
  id?: string;
  company: string;
  title: string;
  locations?: string[];
  [key: string]: any;
}

/**
 * In-memory deduplication with multi-city location aggregation (Runbook §5.2)
 * When duplicate postings with identical dedup_match_key are found,
 * merge unique locations into locations[].
 */
export function deduplicateJobs<T extends IngestedJobRecord>(jobs: T[]): (T & { dedup_match_key: string; locations: string[] })[] {
  const map = new Map<string, T & { dedup_match_key: string; locations: string[] }>();

  for (const job of jobs) {
    const key = generateDedupMatchKey(job.company, job.title);
    const existing = map.get(key);

    const incomingLocations = Array.isArray(job.locations) ? job.locations : [];

    if (!existing) {
      map.set(key, {
        ...job,
        dedup_match_key: key,
        locations: [...new Set(incomingLocations)]
      });
    } else {
      // Merge locations preserving uniqueness
      const mergedLocations = Array.from(new Set([...existing.locations, ...incomingLocations]));
      existing.locations = mergedLocations;
    }
  }

  return Array.from(map.values());
}
