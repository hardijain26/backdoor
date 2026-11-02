import React from 'react';
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { renderToString } from 'react-dom/server';
import MorningRadarPage from '../../src/app/radar/page';

test('IT-RSF-01: Morning Radar SSR renders Filter by Source dropdown & Sync Gmail CTA', () => {
  const html = renderToString(<MorningRadarPage />);

  // Assert essential source filtering elements
  assert.ok(html.includes('Filter by Source:'), 'Must render "Filter by Source:" label');
  assert.ok(html.includes('All Sources'), 'Must render All Sources default dropdown option');
  assert.ok(html.includes('⚡ Sync Gmail'), 'Must render Direct Gmail Alert Sync CTA button');
  assert.ok(html.includes('Source &amp; Provenance') || html.includes('Source & Provenance'), 'Must render Source & Provenance badging section on Bento cards');
});

test('IT-RSF-02: Morning Radar SSR renders Provenance Badges across Bento cards and Dense table', () => {
  const html = renderToString(<MorningRadarPage />);

  // Check core ATS sources rendered
  assert.ok(html.includes('Greenhouse ATS'), 'Must render Greenhouse ATS badge');
  assert.ok(html.includes('Lever ATS'), 'Must render Lever ATS badge');
  assert.ok(html.includes('Ashby ATS'), 'Must render Ashby ATS badge');
  assert.ok(html.includes('YC Startup'), 'Must render YC Startup badge');
});

test('IT-RSF-03: Rule R7 Strict Color Blacklist AST Scanner on Radar Page', () => {
  const filePath = path.join(process.cwd(), 'src/app/radar/page.tsx');
  const content = fs.readFileSync(filePath, 'utf8');

  const forbiddenHues = [
    'orange',
    'amber',
    'indigo',
    'violet',
    'terracotta',
    '#f97316',
    '#f59e0b',
    '#6366f1',
    '#8b5cf6',
  ];

  for (const hue of forbiddenHues) {
    const regex = new RegExp(`\\b${hue}\\b`, 'i');
    assert.strictEqual(
      regex.test(content),
      false,
      `Rule R7 Violation: Forbidden color "${hue}" detected in src/app/radar/page.tsx`
    );
  }
});

