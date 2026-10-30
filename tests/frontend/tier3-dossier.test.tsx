import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { DossierDrawer, DossierJobData } from '../../src/components/dossier/DossierDrawer';
import { evaluateTier3Dossier } from '../../src/engine/tier3-eval';

const mockHighFitJob: DossierJobData = {
  id: 'test-job-tier3-high',
  company: 'Anthropic',
  title: 'Senior Product Manager, Systems',
  fitScore: 88,
  stage: 'LEAD',
  location: 'San Francisco, CA',
  workplace: 'hybrid',
  source: 'Work at a Startup',
  postedHoursAgo: 2,
  description: 'Lead prompt evaluation pipelines and low-latency inference architecture.',
};

const mockLowFitJob: DossierJobData = {
  id: 'test-job-tier3-low',
  company: 'Generic Corp',
  title: 'Junior Coordinator',
  fitScore: 45,
  stage: 'LEAD',
  location: 'New York, NY',
  workplace: 'onsite',
  source: 'LinkedIn',
  postedHoursAgo: 12,
};

test('IT-T3-01: Tab 2 renders Tier 3 Executive Synthesis for roles with fitScore >= 70', () => {
  const result = evaluateTier3Dossier({
    jobId: mockHighFitJob.id,
    company: mockHighFitJob.company,
    title: mockHighFitJob.title,
    description: mockHighFitJob.description,
    fitScore: mockHighFitJob.fitScore,
  });

  assert.equal(result.eligible, true);
  assert.equal(result.proofBullets.length, 3);
  assert.ok(result.scoreBoosterGaps.length >= 2);
  assert.ok(result.strategicPositioningAngle.includes('Anthropic'));
});

test('IT-T3-02: Tab 2 skips Tier 3 Executive Synthesis for roles with fitScore < 70', () => {
  const result = evaluateTier3Dossier({
    jobId: mockLowFitJob.id,
    company: mockLowFitJob.company,
    title: mockLowFitJob.title,
    description: mockLowFitJob.description,
    fitScore: mockLowFitJob.fitScore,
  });

  assert.equal(result.eligible, false);
  assert.equal(result.proofBullets.length, 0);
  assert.equal(result.scoreBoosterGaps.length, 0);
});

test('IT-T3-03: Rule R7 Color Blacklist Audit on Tier 3 Engine & Dossier Drawer Tab 2', () => {
  const tier3EnginePath = path.resolve(process.cwd(), 'src/engine/tier3-eval.ts');
  const drawerPath = path.resolve(process.cwd(), 'src/components/dossier/DossierDrawer.tsx');

  const tier3Source = fs.readFileSync(tier3EnginePath, 'utf-8');
  const drawerSource = fs.readFileSync(drawerPath, 'utf-8');

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

  for (const pattern of forbiddenColorPatterns) {
    assert.ok(
      !pattern.test(tier3Source),
      `Rule R7 Violation: Forbidden color token ${pattern} found in src/engine/tier3-eval.ts`
    );
  }

  // Ensure Tab 2 specifically does not have forbidden color classes
  const tab2Section = drawerSource.slice(
    drawerSource.indexOf('TAB 2: MATCH BREAKDOWN'),
    drawerSource.indexOf('TAB 3: INTEL & TEARDOWN')
  );

  for (const pattern of forbiddenColorPatterns) {
    assert.ok(
      !pattern.test(tab2Section),
      `Rule R7 Violation: Forbidden color token ${pattern} found in DossierDrawer Tab 2`
    );
  }
});
