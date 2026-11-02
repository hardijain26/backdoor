/**
 * Test Suite: tests/teardown-persistence.test.ts
 * Verifies SCR-T06: Zero-Migration Database Persistence Service
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  isCompanyBriefCacheValid,
  getOrFetchCompanyDataProduct,
  persistGoogleDocUrl,
  invalidateCompanyBriefCache,
  getOrGenerateRoleTeardown,
} from '../src/engine/teardown';

test('SCR-T06-01: Verifies 30-day TTL cache expiration logic', () => {
  const now = new Date().toISOString();
  assert.strictEqual(isCompanyBriefCacheValid(now, 30), true, 'Current date must be within 30-day TTL');

  const twentyNineDaysAgo = new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString();
  assert.strictEqual(isCompanyBriefCacheValid(twentyNineDaysAgo, 30), true, '29-day record must be valid');

  const thirtyOneDaysAgo = new Date(Date.now() - 31 * 24 * 60 * 60 * 1000).toISOString();
  assert.strictEqual(isCompanyBriefCacheValid(thirtyOneDaysAgo, 30), false, '31-day record must be expired');

  assert.strictEqual(isCompanyBriefCacheValid(undefined), false, 'Undefined date must be invalid');
});

test('SCR-T06-02: Company Data Product is cached in company_briefs.recent_news (JSONB) with 30-day TTL', async () => {
  const companyId = 'comp-persist-01';

  // First fetch: Fresh generation
  const res1 = await getOrFetchCompanyDataProduct({
    companyId,
    companyName: 'Notion',
    scopedProduct: 'Notion AI',
  });

  assert.strictEqual(res1.fromCache, false, 'First fetch must generate fresh product');
  assert.strictEqual(res1.briefRecord.company_id, companyId);
  assert.ok(res1.briefRecord.recent_news.vocAnswers.length === 8);
  assert.ok(res1.briefRecord.one_sentence_summary.length > 10);
  assert.ok(res1.briefRecord.fetched_at.length > 10);

  // Second fetch: Cache hit
  const res2 = await getOrFetchCompanyDataProduct({
    companyId,
    companyName: 'Notion',
  });

  assert.strictEqual(res2.fromCache, true, 'Second fetch within TTL must hit cache');
  assert.strictEqual(res2.dataProduct.companyName, 'Notion');
});

test('SCR-T06-03: Google Doc URL persists into public.company_briefs.funding_details', async () => {
  const companyId = 'comp-persist-02';
  const testDocUrl = 'https://docs.google.com/document/d/1a2b3c4d5e/edit';

  const persisted = persistGoogleDocUrl(companyId, testDocUrl);
  assert.strictEqual(persisted, true);

  const res = await getOrFetchCompanyDataProduct({
    companyId,
    companyName: 'Stripe',
  });

  assert.strictEqual(res.briefRecord.funding_details, testDocUrl);
});

test('SCR-T06-04: Role teardown persists into public.evaluations JSONB columns without migrations', async () => {
  const proofPoints = [
    { id: 'pp-ai-01', metricText: '42% query latency reduction' },
    { id: 'pp-ai-02', metricText: '94.6% retrieval precision' },
  ];

  const res1 = await getOrGenerateRoleTeardown({
    userId: 'user-001',
    jobId: 'job-001',
    companyId: 'comp-persist-03',
    companyName: 'Figma',
    roleTitle: 'Staff Product Manager, AI Canvas',
    candidateProofPoints: proofPoints,
  });

  assert.strictEqual(res1.fromCache, false);
  assert.ok(res1.evalRecord.strategic_positioning_angle.length > 10);
  assert.strictEqual(res1.evalRecord.tier2_breakdown.length, 3); // 3 diagnostic questions
  assert.ok(res1.evalRecord.why_you_excel.trackA_Velocity); // Dual-track roadmap
  assert.ok(res1.evalRecord.score_booster_gaps.call1_ProblemValidation); // Conversation ladder

  // Second call must return from evaluations cache
  const res2 = await getOrGenerateRoleTeardown({
    userId: 'user-001',
    jobId: 'job-001',
    companyId: 'comp-persist-03',
    companyName: 'Figma',
    roleTitle: 'Staff Product Manager, AI Canvas',
    candidateProofPoints: proofPoints,
  });

  assert.strictEqual(res2.fromCache, true);
});

test('SCR-T06-05: Invalidate cache triggers re-crawl on next request', async () => {
  const companyId = 'comp-persist-04';

  await getOrFetchCompanyDataProduct({
    companyId,
    companyName: 'Datadog',
  });

  // User reports: "Fixed 6 months ago"
  invalidateCompanyBriefCache(companyId);

  const res = await getOrFetchCompanyDataProduct({
    companyId,
    companyName: 'Datadog',
  });

  assert.strictEqual(res.fromCache, false, 'Must re-fetch when cache was invalidated');
});

