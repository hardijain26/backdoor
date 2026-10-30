/**
 * BACKDOOR v1.0 - 35-SOURCE FLEET HEALTH UNIT TESTS
 * Test Suite: tests/fleet-health.test.ts
 * Authoritative: Runbook §5.2, §5.5 & PRD M9-FR9
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  getFleetHealthSummary,
  testSourceRunner,
  toggleSourceEnabled,
  resetFleetHealthStore,
} from '../src/engine/fleet-health';

test('UT-HEALTH-01: 35 sources completeness audit across all 6 categories', () => {
  resetFleetHealthStore();
  const summary = getFleetHealthSummary();

  assert.strictEqual(summary.totalSources, 35, 'Fleet must contain exactly 35 verified sources');
  assert.ok(summary.healthyCount >= 25, 'Majority of sources must be healthy by default');
  assert.ok(summary.overallUptimePercent >= 90, 'Uptime percentage must be >= 90%');
  assert.ok(summary.totalJobsScraped24h > 100, 'Total 24h jobs scraped must be positive');

  // Verify categories
  const categories = new Set(summary.sources.map((s) => s.category));
  assert.ok(categories.has('ATS_DIRECT'));
  assert.ok(categories.has('REMOTE_PM_BOARDS'));
  assert.ok(categories.has('CURATED_COMMUNITIES'));
  assert.ok(categories.has('BYOK_AGGREGATORS'));
  assert.ok(categories.has('INBOUND_CLIPPERS'));
  assert.ok(categories.has('COMPANY_DIRECT'));
});

test('UT-HEALTH-02: Degraded source anomaly detection and diagnostic error logging', () => {
  resetFleetHealthStore();
  const summary = getFleetHealthSummary();

  const degraded = summary.sources.find((s) => s.status === 'DEGRADED');
  assert.ok(degraded, 'Must detect at least 1 degraded source for diagnostic testing');
  assert.ok(degraded.consecutiveFailures >= 2, 'Degraded source must have consecutive failure count');
  assert.ok(degraded.errorTrace && degraded.errorTrace.length > 10, 'Must record error trace');
});

test('UT-HEALTH-03: On-demand testSourceRunner updates source to HEALTHY and records latency', async () => {
  resetFleetHealthStore();

  const testRes = await testSourceRunner('greenhouse');
  assert.strictEqual(testRes.success, true);
  assert.strictEqual(testRes.sourceId, 'greenhouse');
  assert.strictEqual(testRes.status, 'HEALTHY');
  assert.ok(testRes.latencyMs > 0, 'Latency must be recorded');
  assert.ok(testRes.jobsFound > 0, 'Jobs found must be positive');

  // Verify updated in summary
  const summary = getFleetHealthSummary();
  const gh = summary.sources.find((s) => s.id === 'greenhouse')!;
  assert.strictEqual(gh.status, 'HEALTHY');
  assert.ok(gh.lastRunAt && gh.lastRunAt.includes('T'), 'lastRunAt should be updated with ISO timestamp');
});

test('UT-HEALTH-04: Testing BYOK source without key returns SKIPPED_NO_KEY gracefully', async () => {
  resetFleetHealthStore();

  // Test Apify without API key
  const testRes = await testSourceRunner('apify_linkedin');
  assert.strictEqual(testRes.success, false);
  assert.strictEqual(testRes.status, 'SKIPPED_NO_KEY');
  assert.match(testRes.error || '', /Missing API key/);
});

test('UT-HEALTH-05: toggleSourceEnabled toggles active status in fleet store', () => {
  resetFleetHealthStore();

  const resDisable = toggleSourceEnabled('lever', false);
  assert.strictEqual(resDisable.success, true);
  assert.strictEqual(resDisable.source?.isEnabled, false);
  assert.strictEqual(resDisable.source?.status, 'SKIPPED_NO_KEY');

  const resEnable = toggleSourceEnabled('lever', true);
  assert.strictEqual(resEnable.success, true);
  assert.strictEqual(resEnable.source?.isEnabled, true);
  assert.strictEqual(resEnable.source?.status, 'HEALTHY');
});
