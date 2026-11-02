/**
 * Test Suite: tests/financial-translator.test.ts
 * Verifies SCR-T03: Plain-English Financial Translator & Leadership Compass
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  translateMarginTrend,
  translateCapitalAllocation,
  translateRdSpend,
  generateFinancialTranslation,
} from '../src/engine/financial-translator';

test('SCR-T03-01: Translates margin compression into infrastructure and support cost signals', () => {
  // Margin dropped from 78% to 70% (compression of 800 bps)
  const signal = translateMarginTrend(70, 78);
  assert.match(signal, /compressed by 800 bps/);
  assert.match(signal, /infrastructure/i);
  assert.match(signal, /onboarding support costs/i);
});

test('SCR-T03-02: Translates margin expansion into operational leverage signals', () => {
  // Margin grew from 68% to 73% (expansion of 500 bps)
  const signal = translateMarginTrend(73, 68);
  assert.match(signal, /expanded by 500 bps/);
  assert.match(signal, /operational leverage/i);
});

test('SCR-T03-03: Translates growing profit with flat dividends into retained earnings / M&A expansion signals', () => {
  const signal = translateCapitalAllocation(45000000, 120000000, 0);
  assert.match(signal, /liquid cash reserves/i);
  assert.match(signal, /zero dividend distributions/i);
  assert.match(signal, /M&A acquisitions/i);
});

test('SCR-T03-04: Translates R&D spend growth into technological moat signals', () => {
  const signalHigh = translateRdSpend(25);
  assert.match(signalHigh, /\+25% YoY/);
  assert.match(signalHigh, /architectural modernizations/i);

  const signalLow = translateRdSpend(4);
  assert.match(signalLow, /\+4% YoY/);
  assert.match(signalLow, /core product optimization/i);
});

test('SCR-T03-05: Generates comprehensive financial translation report with top 3 CEO strategic priorities', () => {
  const report = generateFinancialTranslation({
    companyName: 'Figma',
    isPublic: false,
    businessModelHint: 'HYBRID_SUBSCRIPTION_USAGE',
    metrics: {
      grossMarginPct: 74,
      priorGrossMarginPct: 79,
      operatingCashFlow: 35000000,
      cashReserves: 80000000,
      dividendsPaid: 0,
      rdSpendYoYGrowthPct: 22,
    },
  });

  assert.strictEqual(report.companyName, 'Figma');
  assert.strictEqual(report.isPublicCompany, false);
  assert.strictEqual(report.businessModel.type, 'HYBRID_SUBSCRIPTION_USAGE');
  assert.match(report.metricsAnalysis.marginTrendSummary, /compressed by 500 bps/);
  assert.match(report.metricsAnalysis.capitalAllocationSignal, /M&A/);
  assert.match(report.metricsAnalysis.rdReinvestmentSignal, /\+22% YoY/);

  // Check top 3 strategic priorities
  assert.ok(report.topStrategicPriorities.length >= 3, 'Must contain at least 3 strategic priorities');
  for (const p of report.topStrategicPriorities) {
    assert.ok(p.id.length > 2);
    assert.ok(p.priorityTitle.length > 5);
    assert.match(p.verbatimQuote, /^"[\s\S]+"$/, 'Quote must be wrapped in quotation marks');
    assert.ok(p.executiveOwner.length > 3);
    assert.ok(p.strategicRationale.length > 10);
  }

  // Check leadership team
  assert.ok(report.leadershipTeam.length >= 3);
  assert.strictEqual(report.leadershipTeam[0].title, 'Chief Executive Officer (CEO)');
});

