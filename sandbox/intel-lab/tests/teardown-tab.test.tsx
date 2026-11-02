/**
 * Test Suite: tests/frontend/teardown-tab.test.tsx
 * Verifies SCR-T08 & SCR-T10: Dossier Drawer Tab 3 UI & JIT Interview Gate
 */

import { test } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { TeardownTab } from '../../src/components/dossier/TeardownTab';

test('IT-TEARDOWN-01: TeardownTab renders 4 progressive accordions and primary action CTAs when interview is confirmed', () => {
  const html = renderToString(
    <TeardownTab
      jobId="job-test-01"
      companyName="Notion"
      roleTitle="Staff Product Manager"
      scopedProduct="Notion AI"
      companyId="comp-test-01"
      stage="INTERVIEW_SCHEDULED"
    />
  );

  // Verification badges
  assert.match(html, /PRODUCT-SCOPED/);
  assert.match(html, /VERIFIED: REVIEW CONSENSUS/);
  assert.match(html, /INTERVIEW GATE ACTIVE/);

  // Header CTAs
  assert.match(html, /1-Pager/);
  assert.match(html, /Slides Deck/);
  assert.match(html, /Tracker/);

  // Accordion 1: Snapshot & Financials
  assert.match(html, /Corporate Snapshot &amp; Plain-English Financials/);
  assert.match(html, /Notion AI/);
  assert.match(html, /Business Model/);

  // Accordion 2: Leadership Compass & Priorities
  assert.match(html, /Leadership Compass &amp; Top 3 Strategic Priorities/);

  // Accordion 3: Product-Scoped Competitor SWOT Grid
  assert.match(html, /Product-Scoped Competitor SWOT Matrix/);

  // Accordion 4: Customer Sentiment & Dual-Track Roadmap
  assert.match(html, /Customer Friction Score &amp; Dual-Track 30–60–90 Roadmap/);
});

test('IT-TEARDOWN-02: Rule R7 Color Blacklist AST Scanner on TeardownTab', () => {
  const filePath = path.join(__dirname, '..', '..', 'src', 'components', 'dossier', 'TeardownTab.tsx');
  assert.strictEqual(fs.existsSync(filePath), true, 'TeardownTab.tsx must exist');

  const content = fs.readFileSync(filePath, 'utf8');

  // Rule R7 Banned Tokens: indigo, violet, orange, amber, terracotta
  const bannedKeywords = [
    /\bindigo\b/i,
    /\bviolet\b/i,
    /\borange\b/i,
    /\bamber\b/i,
    /\bterracotta\b/i,
    /#6366f1/i, // indigo-500
    /#f97316/i, // orange-500
    /#f59e0b/i, // amber-500
  ];

  for (const regex of bannedKeywords) {
    const match = content.match(regex);
    assert.strictEqual(
      match,
      null,
      `Rule R7 Violation: Forbidden token "${match?.[0]}" found in TeardownTab.tsx`
    );
  }
});

test('IT-TEARDOWN-03: TeardownTab gates deep crawl in Stage 1 Cold Outreach Mode until unlocked', () => {
  const html = renderToString(
    <TeardownTab
      jobId="job-test-02"
      companyName="Linear"
      roleTitle="Lead PM"
      scopedProduct="Linear"
      companyId="comp-test-02"
      stage="DISCOVERED"
    />
  );

  // Must render Stage 1 Cold Outreach Mode
  assert.match(html, /Stage 1: Cold Outreach Mode/);
  assert.match(html, /Unlock Interview Prep Teardown/);
  assert.match(html, /Strategic Firmographics &amp; Discovery/);
  assert.match(html, /Suitability Status/);
  assert.match(html, /Outreach Contacts/);
});
