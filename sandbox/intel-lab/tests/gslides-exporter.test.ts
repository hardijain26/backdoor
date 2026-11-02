import test from 'node:test';
import assert from 'node:assert';
import { buildExecutiveSlidesDeck } from '../src/engine/gslides-exporter';
import { buildResearchWorkbook } from '../src/engine/gsheets-exporter';
import { buildCompanyDataProduct } from '../src/engine/swot-voc-synthesizer';
import { synthesizeDeterministicRoleTeardown } from '../src/engine/prompt-builder';

test('S4-T03-01: Google Slides Exporter builds canonical 6-slide executive presentation', async () => {
  const dataProduct = await buildCompanyDataProduct({
    companyName: 'Linear',
    scopedProduct: 'Linear Workflows',
  });

  const synthesis = synthesizeDeterministicRoleTeardown({
    roleTitle: 'Lead Product Manager',
    archetype: 'PRODUCT_MANAGEMENT',
    companyName: 'Linear',
    scopedProduct: 'Linear Workflows',
    candidateProofPoints: [
      { id: 'pp-1', metricText: 'Scaled platform ingestion pipeline' },
      { id: 'pp-2', metricText: 'Reduced support escalations by 40%' },
    ],
  });

  const deck = buildExecutiveSlidesDeck({
    companyName: 'Linear',
    roleTitle: 'Lead Product Manager',
    scopedProduct: 'Linear Workflows',
    dataProduct,
    synthesis,
  });

  assert.strictEqual(deck.slides.length, 6, 'Must generate exactly 6 slides');
  assert.strictEqual(deck.slides[0].slideNumber, 1);
  assert.ok(deck.slides[0].slideTitle.includes('Executive Value Teardown'));
  assert.strictEqual(deck.slides[1].slideNumber, 2);
  assert.ok(deck.slides[1].slideTitle.includes('The Discrepancy Hook'));
  assert.strictEqual(deck.slides[3].slideNumber, 4);
  assert.ok(deck.slides[3].slideTitle.includes('Dual-Track'));
  assert.strictEqual(deck.slides[4].slideNumber, 5);
  assert.ok(deck.slides[4].slideTitle.includes('Three Diagnostic Questions'));
});

test('S4-T03-02: Google Sheets Exporter builds canonical 3-tab research workbook', async () => {
  const dataProduct = await buildCompanyDataProduct({
    companyName: 'Linear',
    scopedProduct: 'Linear Workflows',
  });

  const synthesis = synthesizeDeterministicRoleTeardown({
    roleTitle: 'Lead Product Manager',
    archetype: 'PRODUCT_MANAGEMENT',
    companyName: 'Linear',
    scopedProduct: 'Linear Workflows',
    candidateProofPoints: [
      { id: 'pp-1', metricText: 'Scaled platform ingestion pipeline' },
      { id: 'pp-2', metricText: 'Reduced support escalations by 40%' },
    ],
  });

  const workbook = buildResearchWorkbook({
    companyName: 'Linear',
    roleTitle: 'Lead Product Manager',
    scopedProduct: 'Linear Workflows',
    dataProduct,
    synthesis,
  });

  assert.strictEqual(workbook.tabs.length, 3, 'Must generate exactly 3 tabs');
  assert.strictEqual(workbook.tabs[0].tabName, 'Pillars Reference');
  assert.strictEqual(workbook.tabs[1].tabName, 'Company Teardown Tracker');
  assert.strictEqual(workbook.tabs[2].tabName, 'RapidAPI Integrations');
  assert.ok(workbook.tabs[0].rows.length >= 7, 'Must map all 7 Pillars in reference tab');
  assert.ok(workbook.tabs[1].rows.length >= 8, 'Must map findings in tracker tab');
  assert.strictEqual(workbook.tabs[2].rows.length, 4, 'Must list 4 RapidAPI integrations');
});

test('S4-T03-03: Rule R7 Color Blacklist AST Scanner across Slides and Sheets pages', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const files = [
    path.join(__dirname, '..', 'src', 'app', 'intel', 'teardown', 'slides', 'page.tsx'),
    path.join(__dirname, '..', 'src', 'app', 'intel', 'teardown', 'sheets', 'page.tsx'),
    path.join(__dirname, '..', 'src', 'engine', 'gslides-exporter.ts'),
    path.join(__dirname, '..', 'src', 'engine', 'gsheets-exporter.ts'),
  ];

  const bannedKeywords = [
    /\bindigo\b/i,
    /\bviolet\b/i,
    /\borange\b/i,
    /\bamber\b/i,
    /\bterracotta\b/i,
    /#6366f1/i,
    /#f97316/i,
    /#f59e0b/i,
  ];

  for (const file of files) {
    assert.strictEqual(fs.existsSync(file), true, `File must exist: ${file}`);
    const content = fs.readFileSync(file, 'utf8');
    for (const regex of bannedKeywords) {
      const match = content.match(regex);
      assert.strictEqual(match, null, `Rule R7 Violation: Forbidden token "${match?.[0]}" found in ${file}`);
    }
  }
});
