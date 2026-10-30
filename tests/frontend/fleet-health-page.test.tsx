import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import HealthPage from '../../src/app/health/page';
import { getFleetHealthSummary, resetFleetHealthStore } from '../../src/engine/fleet-health';

test('IT-HEALTH-01: HealthPage SSR renders 35 sources, category tabs, and overview ribbon', () => {
  resetFleetHealthStore();
  const summary = getFleetHealthSummary();
  const html = renderToString(<HealthPage />);

  assert.ok(html.includes('35-Source Fleet Health &amp; Observability') || html.includes('35-Source Fleet Health & Observability'));
  assert.ok(html.includes('Total Fleet Sources'));
  assert.ok(html.includes('Greenhouse ATS'));
  assert.ok(html.includes('Lever ATS'));
  assert.ok(html.includes('Ashby ATS'));
  assert.ok(html.includes('YC Work at a Startup'));
  assert.ok(html.includes('Himalayas'));
  assert.ok(html.includes('Test Source'));
  assert.ok(summary.totalSources === 35);
});

test('IT-HEALTH-02: Rule R7 Color Blacklist Audit across Fleet Health Subsystem', () => {
  const filesToCheck = [
    'src/engine/fleet-health.ts',
    'src/app/health/page.tsx',
    'src/app/api/health/route.ts',
    'src/app/api/health/test-source/route.ts',
  ];

  const forbiddenColorPatterns = [
    /text-indigo-/i,
    /bg-indigo-/i,
    /border-indigo-/i,
    /text-violet-/i,
    /bg-violet-/i,
    /border-violet-/i,
    /text-amber-/i,
    /bg-amber-/i,
    /border-amber-/i,
    /text-orange-/i,
    /bg-orange-/i,
    /border-orange-/i,
    /#6366f1/i, // Indigo-500
    /#8b5cf6/i, // Violet-500
    /#f59e0b/i, // Amber-500
    /#f97316/i, // Orange-500
  ];

  for (const relativePath of filesToCheck) {
    const fullPath = path.resolve(process.cwd(), relativePath);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf-8');

    for (const pattern of forbiddenColorPatterns) {
      assert.ok(
        !pattern.test(content),
        `Rule R7 Violation: Forbidden color token ${pattern} found in ${relativePath}`
      );
    }
  }
});
