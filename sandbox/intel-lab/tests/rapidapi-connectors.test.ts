import test from 'node:test';
import assert from 'node:assert';
import {
  fetchRapidApiFinancialMetrics,
  fetchRapidApiDomainTraffic,
  fetchRapidApiReviewSummaries,
} from '../src/engine/rapidapi-connectors';

test('SCR-T12-01: RapidAPI financial connector returns verified telemetry with failover', async () => {
  const fin = await fetchRapidApiFinancialMetrics('Stripe');
  assert.ok(fin.annualRevenue.length > 3, 'Must return annual revenue string');
  assert.ok(fin.grossMarginPct > 50, 'Software gross margin must be > 50%');
  assert.ok(['RAPIDAPI_LIVE', 'GROUNDED_TELEMETRY'].includes(fin.source));
});

test('SCR-T12-02: RapidAPI domain traffic connector returns visit metrics and bounce rates', async () => {
  const traffic = await fetchRapidApiDomainTraffic('linear.app');
  assert.ok(traffic.monthlyVisits.includes('visits/mo'), 'Must return formatted monthly visits');
  assert.ok(traffic.bounceRatePct > 0 && traffic.bounceRatePct < 100, 'Bounce rate must be percentage');
  assert.ok(['RAPIDAPI_LIVE', 'GROUNDED_TELEMETRY'].includes(traffic.source));
});

test('SCR-T12-03: Review summaries connector returns multi-channel consensus across G2, Trustpilot, App Store', async () => {
  const reviews = await fetchRapidApiReviewSummaries('Linear');
  assert.strictEqual(reviews.length, 3, 'Must return 3 review platforms');
  const g2 = reviews.find((r) => r.platform === 'G2');
  assert.ok(g2 !== undefined, 'Must include G2 review telemetry');
  assert.ok(g2!.criticalThemes.length >= 2, 'Must include critical themes');
});

