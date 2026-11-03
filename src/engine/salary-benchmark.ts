/**
 * Subsystem: Automated Salary Percentile Benchmarking
 * Maps compensation telemetry into market percentiles (P25, P50, P75, P90)
 * Across US, Global Remote, and India Tech Hubs.
 */

export interface SalaryBenchmarkResult {
  rawSalary: string;
  currency: 'USD' | 'INR' | 'GBP' | 'EUR';
  minCompensation: number;
  maxCompensation: number;
  midpoint: number;
  seniorityTier: 'SENIOR' | 'STAFF_LEAD' | 'PRINCIPAL' | 'DIRECTOR_EXEC';
  percentile: 'P25' | 'P50' | 'P75' | 'P90';
  percentileScore: number; // 0 - 100
  badgeLabel: string; // e.g. "P75 · Top 25% Market Pay"
  isAboveMarketMedian: boolean;
}

/**
 * Normalizes title into seniority tier
 */
export function detectSeniorityTier(title: string): 'SENIOR' | 'STAFF_LEAD' | 'PRINCIPAL' | 'DIRECTOR_EXEC' {
  const lower = (title || '').toLowerCase();
  if (lower.includes('vp') || lower.includes('director') || lower.includes('head of product')) {
    return 'DIRECTOR_EXEC';
  }
  if (lower.includes('principal') || lower.includes('group pm')) {
    return 'PRINCIPAL';
  }
  if (lower.includes('staff') || lower.includes('lead')) {
    return 'STAFF_LEAD';
  }
  return 'SENIOR';
}

/**
 * Parses numeric currency values from diverse salary string representations
 */
export function parseSalaryNumbers(salaryStr: string): { min: number; max: number; currency: 'USD' | 'INR' | 'GBP' | 'EUR' } {
  const raw = (salaryStr || '').trim();
  const lower = raw.toLowerCase();

  // Detect Currency
  let currency: 'USD' | 'INR' | 'GBP' | 'EUR' = 'USD';
  if (raw.includes('₹') || lower.includes('inr') || lower.includes('lpa') || lower.includes('cr') || lower.includes('.0l')) {
    currency = 'INR';
  } else if (raw.includes('£') || lower.includes('gbp')) {
    currency = 'GBP';
  } else if (raw.includes('€') || lower.includes('eur')) {
    currency = 'EUR';
  }

  // Handle INR Lakhs (e.g., ₹45.0L - ₹65.0L)
  if (currency === 'INR') {
    const lpaMatches = raw.match(/(\d+(?:\.\d+)?)\s*(?:l|lakh|cr)/gi);
    if (lpaMatches && lpaMatches.length >= 2) {
      const v1 = parseFloat(lpaMatches[0]);
      const v2 = parseFloat(lpaMatches[1]);
      const minL = lpaMatches[0].toLowerCase().includes('cr') ? v1 * 100 : v1;
      const maxL = lpaMatches[1].toLowerCase().includes('cr') ? v2 * 100 : v2;
      return { min: minL * 100000, max: maxL * 100000, currency: 'INR' };
    }
  }

  // Handle standard USD/GBP/EUR e.g. $165,000 - $210,000 or $165K - $210K
  const clean = raw.replace(/,/g, '');
  const matches = clean.match(/(\d+(?:\.\d+)?)\s*(?:k|000)?/gi);

  if (matches && matches.length >= 2) {
    let min = parseFloat(matches[0]);
    let max = parseFloat(matches[1]);

    if (min < 1000) min *= 1000;
    if (max < 1000) max *= 1000;

    return { min, max, currency };
  }

  if (matches && matches.length === 1) {
    let single = parseFloat(matches[0]);
    if (single < 1000) single *= 1000;
    return { min: single, max: single, currency };
  }

  // Default fallback baseline if missing
  return { min: 160000, max: 210000, currency: 'USD' };
}

/**
 * Computes market salary percentile based on seniority and regional tiers
 */
export function benchmarkSalary(salaryStr: string, jobTitle: string): SalaryBenchmarkResult {
  const { min, max, currency } = parseSalaryNumbers(salaryStr);
  const midpoint = Math.round((min + max) / 2);
  const seniorityTier = detectSeniorityTier(jobTitle);

  // US Benchmark Grid (USD)
  const US_BENCHMARKS = {
    SENIOR: { p25: 140000, p50: 165000, p75: 195000, p90: 230000 },
    STAFF_LEAD: { p25: 175000, p50: 210000, p75: 245000, p90: 285000 },
    PRINCIPAL: { p25: 215000, p50: 250000, p75: 290000, p90: 345000 },
    DIRECTOR_EXEC: { p25: 240000, p50: 280000, p75: 335000, p90: 410000 }
  };

  // India Benchmark Grid (INR)
  const INR_BENCHMARKS = {
    SENIOR: { p25: 3200000, p50: 4200000, p75: 5500000, p90: 6800000 },
    STAFF_LEAD: { p25: 4800000, p50: 6500000, p75: 8000000, p90: 9500000 },
    PRINCIPAL: { p25: 6500000, p50: 8500000, p75: 11000000, p90: 13500000 },
    DIRECTOR_EXEC: { p25: 8500000, p50: 12000000, p75: 16000000, p90: 22000000 }
  };

  const grid = currency === 'INR' ? INR_BENCHMARKS[seniorityTier] : US_BENCHMARKS[seniorityTier];

  let percentile: 'P25' | 'P50' | 'P75' | 'P90' = 'P50';
  let badgeLabel = 'P50 · Market Median';
  let percentileScore = 50;

  if (midpoint >= grid.p90) {
    percentile = 'P90';
    badgeLabel = 'P90 · Top 10% Market Pay';
    percentileScore = 92;
  } else if (midpoint >= grid.p75) {
    percentile = 'P75';
    badgeLabel = 'P75 · Top 25% Market Pay';
    percentileScore = 78;
  } else if (midpoint >= grid.p50) {
    percentile = 'P50';
    badgeLabel = 'P50 · Market Median';
    percentileScore = 55;
  } else {
    percentile = 'P25';
    badgeLabel = 'P25 · Competitive Base';
    percentileScore = 35;
  }

  return {
    rawSalary: salaryStr,
    currency,
    minCompensation: min,
    maxCompensation: max,
    midpoint,
    seniorityTier,
    percentile,
    percentileScore,
    badgeLabel,
    isAboveMarketMedian: midpoint >= grid.p50
  };
}
