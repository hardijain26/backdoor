/**
 * Test Suite: tests/swot-voc.test.ts
 * Verifies SCR-T04: Product-Scoped Competitor SWOT & VoC Synthesizer
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  synthesizeVocQuestions,
  synthesizeCompetitorSwot,
  synthesizeDiscrepancy,
  buildCompanyDataProduct,
} from '../src/engine/swot-voc-synthesizer';

test('SCR-T04-01: Synthesizes direct answers to all 8 Voice-of-Customer questions with quotes', () => {
  const voc = synthesizeVocQuestions('Notion', 'Notion AI');
  assert.strictEqual(voc.length, 8, 'Must synthesize exactly 8 VoC questions');

  const expectedIds = [
    'voc-01-core-pain',
    'voc-02-activation-blocker',
    'voc-03-magic-moment',
    'voc-04-primary-friction',
    'voc-05-missing-features',
    'voc-06-switching-triggers',
    'voc-07-support-sentiment',
    'voc-08-pricing-perception',
  ];

  for (let i = 0; i < 8; i++) {
    const item = voc[i];
    assert.strictEqual(item.questionId, expectedIds[i]);
    assert.ok(item.question.length > 10, 'Question must be formulated');
    assert.ok(item.summary.length > 15, 'Summary must be detailed');
    assert.match(item.verbatimQuote, /^"[\s\S]+"$/, 'Verbatim quote must be wrapped in quotation marks');
    assert.ok(item.sourceBadge.length > 1, 'Source badge required');
  }
});

test('SCR-T04-02: Resolves top 3 product-scoped rivals and generates 16-point SWOT grid', () => {
  const swot = synthesizeCompetitorSwot('Uber', 'Uber Freight');
  assert.strictEqual(swot.length, 3, 'Must resolve top 3 direct product rivals');

  // Verify domain-scoped rival resolution (Logistics / Freight rivals for Uber Freight)
  const names = swot.map((s) => s.competitorName).join(' ');
  assert.match(names, /Flexport|Robinson|Transfix/i);

  for (const rival of swot) {
    assert.ok(rival.competitorName.length > 2);
    assert.ok(rival.productLine.length > 2);
    assert.strictEqual(rival.strengths.length, 4, 'Must contain 4 strengths');
    assert.strictEqual(rival.weaknesses.length, 4, 'Must contain 4 weaknesses');
    assert.strictEqual(rival.opportunities.length, 4, 'Must contain 4 opportunities');
    assert.strictEqual(rival.threats.length, 4, 'Must contain 4 threats');
    assert.ok(rival.differentiationAngle.length > 20, 'Must have differentiation angle');
  }
});

test('SCR-T04-03: Discrepancy Engine contrasts Layer 1 vs Layer 2', () => {
  const discrepancy = synthesizeDiscrepancy('HubSpot', 'HubSpot Service Hub');
  assert.match(discrepancy.layer1StatedIntent, /HubSpot Service Hub/);
  assert.match(discrepancy.layer1StatedIntent, /effortless|seamless/i);
  assert.match(discrepancy.layer2GroundTruth, /G2|Reddit|Trustpilot/i);
  assert.ok(discrepancy.discrepancyDelta.length > 25);
});

test('SCR-T04-04: Assembles complete CompanyDataProduct entity payload', async () => {
  const product = await buildCompanyDataProduct({
    companyName: 'Figma',
    scopedProduct: 'Figma FigJam',
    isPublic: false,
  });

  assert.strictEqual(product.companyName, 'Figma');
  assert.strictEqual(product.scopedProduct, 'Figma FigJam');
  assert.strictEqual(product.vocAnswers.length, 8);
  assert.strictEqual(product.topFrictionPoints.length, 5);
  assert.strictEqual(product.competitorSwot.length, 3);
  assert.ok(product.financialTranslation.companyName === 'Figma');
  assert.ok(product.discrepancy.layer1StatedIntent.length > 10);
  assert.ok(product.sentimentMeter.score >= 0 && product.sentimentMeter.score <= 100);
});

