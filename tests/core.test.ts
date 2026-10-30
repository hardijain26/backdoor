import test from 'node:test';
import assert from 'node:assert';
import { generateDedupMatchKey, cleanCompany, cleanTitle, deduplicateJobs } from '../src/engine/dedup.ts';
import { VERIFIED_SOURCES, isSafeUrl, passesNegativeFilters } from '../src/engine/scraper.ts';
import { evaluateTier1, evaluateTier2, evaluateJobSuitability } from '../src/engine/scorer.ts';

// ============================================================================
// DEDUPLICATION & CANONICAL MATCH KEY (UT-DB-04)
// ============================================================================

test('UT-DB-04: Canonical normalization "Google, Inc." + "Sr. PM" -> "google:senior_product_manager"', () => {
  const company = 'Google, Inc.';
  const title = 'Sr. PM';

  assert.strictEqual(cleanCompany(company), 'google');
  assert.strictEqual(cleanTitle(title), 'senior_product_manager');

  const matchKey = generateDedupMatchKey(company, title);
  assert.strictEqual(
    matchKey,
    'google:senior_product_manager',
    'dedup_match_key must match canonical format "google:senior_product_manager"'
  );
});

test('UT-DB-04: Deduplication engine strips corporate suffixes and normalizes abbreviations', () => {
  assert.strictEqual(cleanCompany('Stripe LLC'), 'stripe');
  assert.strictEqual(cleanCompany('Linear Technologies Corp'), 'linear');
  assert.strictEqual(cleanCompany('Acme Co.'), 'acme');

  assert.strictEqual(cleanTitle('VP of Product'), 'vice_president_of_product');
  assert.strictEqual(cleanTitle('Lead PM'), 'lead_product_manager');
  assert.strictEqual(cleanTitle('Junior PM'), 'junior_product_manager');
});

test('UT-DB-04: Multi-city job postings merge into single canonical record with combined locations[]', () => {
  const rawJobs = [
    {
      id: '1',
      company: 'Linear',
      title: 'Senior Product Manager',
      locations: ['San Francisco, CA']
    },
    {
      id: '2',
      company: 'Linear, Inc.',
      title: 'Sr. PM',
      locations: ['New York, NY', 'Remote']
    }
  ];

  const deduped = deduplicateJobs(rawJobs);
  assert.strictEqual(deduped.length, 1, 'Duplicate postings must collapse into a single record');
  assert.strictEqual(deduped[0].dedup_match_key, 'linear:senior_product_manager');
  assert.strictEqual(deduped[0].locations.length, 3, 'All unique cities must merge into locations[]');
  assert.ok(deduped[0].locations.includes('San Francisco, CA'));
  assert.ok(deduped[0].locations.includes('New York, NY'));
  assert.ok(deduped[0].locations.includes('Remote'));
});

// ============================================================================
// 35-SOURCE INGESTION & SSRF GUARD (Rule R6)
// ============================================================================

test('Scout Engine: 35 verified ingestion sources categorized across 6 groups', () => {
  assert.strictEqual(VERIFIED_SOURCES.length, 35, 'Must maintain exactly 35 verified ingestion sources');

  const counts: Record<string, number> = {};
  for (const s of VERIFIED_SOURCES) {
    counts[s.category] = (counts[s.category] || 0) + 1;
  }

  assert.strictEqual(counts['ATS_DIRECT'], 8, 'Must have 8 ATS Direct sources');
  assert.strictEqual(counts['COMPANY_DIRECT'], 1, 'Must have 1 Company Direct source');
  assert.strictEqual(counts['REMOTE_PM_BOARDS'], 7, 'Must have 7 Remote PM Boards');
  assert.strictEqual(counts['CURATED_COMMUNITIES'], 10, 'Must have 10 Curated Tech Communities');
  assert.strictEqual(counts['INBOUND_CLIPPERS'], 3, 'Must have 3 Inbound / Clipper sources');
  assert.strictEqual(counts['BYOK_AGGREGATORS'], 6, 'Must have 6 BYOK Aggregator sources');
});

test('Scout Engine: SSRF Safe URL Validator (Rule R6)', () => {
  // Disallowed Loopback and private ranges
  assert.strictEqual(isSafeUrl('http://localhost:8080/jobs'), false);
  assert.strictEqual(isSafeUrl('http://127.0.0.1/api'), false);
  assert.strictEqual(isSafeUrl('http://169.254.169.254/latest/meta-data'), false);
  assert.strictEqual(isSafeUrl('http://10.0.0.1/internal'), false);
  assert.strictEqual(isSafeUrl('http://192.168.1.1/router'), false);
  assert.strictEqual(isSafeUrl('http://172.20.0.5/admin'), false);
  assert.strictEqual(isSafeUrl('file:///etc/passwd'), false);
  assert.strictEqual(isSafeUrl('ftp://example.com'), false);

  // Allowed public URLs
  assert.strictEqual(isSafeUrl('https://boards.greenhouse.io/stripe/jobs/123'), true);
  assert.strictEqual(isSafeUrl('https://jobs.lever.co/linear/456'), true);
  assert.strictEqual(isSafeUrl('https://jobs.ashbyhq.com/openai/789'), true);
});

test('Scout Engine: Pre-Storage Negative Filters drop banned titles and industries', () => {
  // Excluded titles
  assert.strictEqual(passesNegativeFilters({ title: 'Product Marketing Manager', company: 'Linear' }).passed, false);
  assert.strictEqual(passesNegativeFilters({ title: 'Engineering Manager', company: 'Stripe' }).passed, false);
  assert.strictEqual(passesNegativeFilters({ title: 'Technical Program Manager (TPM)', company: 'Figma' }).passed, false);
  assert.strictEqual(passesNegativeFilters({ title: 'Technical Recruiter', company: 'Notion' }).passed, false);

  // Excluded industries (Zero FinTech / Payments invariant)
  assert.strictEqual(passesNegativeFilters({ title: 'Senior PM', company: 'NeoBank Tech' }).passed, false);
  assert.strictEqual(passesNegativeFilters({ title: 'Lead PM', company: 'Crypto Labs' }).passed, false);
  assert.strictEqual(
    passesNegativeFilters({
      title: 'Principal PM',
      company: 'Global Retail',
      descriptionText: 'Building next-generation fintech lending rails and payments.'
    }).passed,
    false
  );

  // Valid target PM role
  const valid = passesNegativeFilters({
    title: 'Senior Product Manager - AI Workflows',
    company: 'Linear',
    descriptionText: 'Designing high-velocity issue tracking and autonomous agent collaboration.'
  });
  assert.strictEqual(valid.passed, true);
});

// ============================================================================
// 3-TIER SUITABILITY ENGINE
// ============================================================================

test('Tier 1: Eligibility gate drops excluded titles, FinTech companies, and out-of-region boundaries', () => {
  // Title exclusion
  const t1Title = evaluateTier1({
    title: 'Scrum Master',
    company: 'Acme Health',
    descriptionText: 'Lead agile ceremonies'
  });
  assert.strictEqual(t1Title.passed, false);

  // Industry exclusion
  const t1Industry = evaluateTier1({
    title: 'Senior Product Manager',
    company: 'Fintech Payments Inc',
    descriptionText: 'Checkout optimization'
  });
  assert.strictEqual(t1Industry.passed, false);

  // Remote US Only boundary
  const t1UsOnly = evaluateTier1({
    title: 'Senior Product Manager',
    company: 'SaaS Labs',
    descriptionText: 'This position is remote (US only). We cannot sponsor visas.',
    usSponsorshipAvailable: false
  });
  assert.strictEqual(t1UsOnly.passed, false);

  // Eligible global role
  const t1Eligible = evaluateTier1({
    title: 'Lead Product Manager',
    company: 'DevTools Co',
    region: 'Global Remote',
    locations: ['Remote'],
    descriptionText: 'Developer tooling and observability platform'
  });
  assert.strictEqual(t1Eligible.passed, true);
});

test('Tier 2: Deterministic 0-100 Mathematical Scoring', () => {
  const result = evaluateTier2({
    title: 'Senior Product Manager',
    company: 'AI Engine',
    descriptionText: 'Looking for a Senior PM with deep skills in product strategy, roadmapping, AI/ML, and SQL.',
    requiredYears: 3,
    seniority: 'senior'
  });

  assert.ok(result.fitScore >= 0 && result.fitScore <= 100, 'Score must be clamped between 0 and 100');
  assert.strictEqual(result.breakdown.experienceScore, 25, '3 years experience matches baseline for 25 points');
  assert.strictEqual(result.breakdown.seniorityScore, 15, 'Senior title matches active track for 15 points');
  assert.ok(result.breakdown.skillMatch > 0, 'Matched skills must contribute up to 60 points');
  assert.ok(result.matchedSkills.includes('product strategy'));
  assert.ok(result.matchedSkills.includes('ai/ml'));
  assert.ok(result.matchedSkills.includes('sql'));
});

test('Suitability Engine: High fit (>= 70) produces status-top badge token', () => {
  const highFit = evaluateJobSuitability({
    title: 'Staff Product Manager, AI Workspaces',
    company: 'Linear',
    region: 'Global Remote',
    locations: ['Remote'],
    descriptionText: 'Lead product strategy, roadmapping, AI/ML, system architecture, analytics, and user research. 3+ years experience.',
    requiredYears: 3,
    seniority: 'staff'
  });

  assert.strictEqual(highFit.tier1Passed, true);
  assert.ok(highFit.fitScore >= 70, `Score ${highFit.fitScore} should be >= 70`);
  assert.strictEqual(highFit.badgeToken, 'status-top');
  assert.strictEqual(highFit.badgeLabel, 'Top Fit');
});
