/**
 * Test Suite: tests/review-scraper.test.ts
 * Verifies SCR-T02: Multi-Channel Review Auditor
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  enforcePoliteDomainBackoff,
  calculateSentimentDistribution,
  auditCompanyReviews,
} from '../src/engine/review-scraper';

test('SCR-T02-01: Polite crawler enforces >= 500ms backoff between requests to same domain', async () => {
  const domain = `test-polite-${Date.now()}.com`;

  // First request should have 0 delay
  const delay1 = await enforcePoliteDomainBackoff(domain, 500);
  assert.strictEqual(delay1, 0, 'First request to domain should proceed immediately');

  // Immediate second request should be throttled by roughly 500ms
  const start = Date.now();
  const delay2 = await enforcePoliteDomainBackoff(domain, 500);
  const elapsed = Date.now() - start;

  assert.ok(delay2 > 350, `Expected backoff delay > 350ms, got ${delay2}ms`);
  assert.ok(elapsed >= 350, `Actual elapsed time must reflect backoff >= 350ms, got ${elapsed}ms`);
});

test('SCR-T02-02: Sentiment distribution calculation properly weights critical, neutral, and positive reviews', () => {
  // Heavy critical
  const critResult = calculateSentimentDistribution(['critical', 'critical', 'critical', 'neutral']);
  assert.ok(critResult.score < 50, `Expected score < 50 for mostly critical reviews, got ${critResult.score}`);
  assert.strictEqual(critResult.criticalPercent, 75);
  assert.strictEqual(critResult.neutralPercent, 25);
  assert.strictEqual(critResult.positivePercent, 0);

  // Heavy positive
  const posResult = calculateSentimentDistribution(['positive', 'positive', 'positive', 'positive', 'neutral']);
  assert.ok(posResult.score >= 75, `Expected score >= 75 for positive reviews, got ${posResult.score}`);
  assert.strictEqual(posResult.positivePercent, 80);
  assert.strictEqual(posResult.neutralPercent, 20);
  assert.strictEqual(posResult.criticalPercent, 0);
});

test('SCR-T02-03: Multi-channel review auditor extracts top 5 friction points with verbatim quotes', async () => {
  const report = await auditCompanyReviews({
    companyName: 'Notion',
    scopedProduct: 'Notion AI',
  });

  assert.strictEqual(report.companyName, 'Notion');
  assert.strictEqual(report.scopedProduct, 'Notion AI');
  assert.ok(report.sentimentMeter.score >= 0 && report.sentimentMeter.score <= 100);
  assert.strictEqual(report.frictionPoints.length, 5, 'Must extract exactly 5 friction points');

  for (const fp of report.frictionPoints) {
    assert.ok(fp.id.length > 3, 'Friction point must have an ID');
    assert.ok(fp.title.length > 5, 'Friction point must have a title');
    assert.match(fp.quote, /^"[\s\S]+"$/, 'Quote must be wrapped in quotation marks');
    assert.ok(
      ['reddit', 'app_store', 'play_store', 'g2', 'trustpilot', 'capterra', 'pissed_consumer'].includes(fp.sourceBadge),
      `Invalid source badge: ${fp.sourceBadge}`
    );
    assert.ok(fp.verificationIndicator.length > 3, 'Must have verification indicator');
    assert.ok(fp.frequencyIndicator.length > 3, 'Must have frequency indicator');
    assert.match(fp.timestamp, /^\d{4}-\d{2}-\d{2}/, 'Timestamp must be YYYY-MM-DD');
  }

  assert.ok(report.sourcesAudited.length >= 5, 'Must audit at least 5 review sources');
  assert.ok(report.discrepancyStatement.length > 20, 'Discrepancy statement must be generated');
});

test('SCR-T02-04: Mock fetch handles external API failure gracefully without crashing', async () => {
  // Mock fetch that simulates 500 error or network exception
  const failingFetch = async () => {
    throw new Error('503 Service Unavailable');
  };

  const report = await auditCompanyReviews({
    companyName: 'Acme Corp',
    scopedProduct: 'Acme Cloud',
    fetchFn: failingFetch as unknown as typeof fetch,
  });

  assert.strictEqual(report.frictionPoints.length, 5, 'Fallback synthesizer must supply 5 friction points');
  assert.strictEqual(report.sourcesAudited[0].status, 'FALLBACK');
  assert.ok(report.discrepancyStatement.includes('Acme Corp'));
});

