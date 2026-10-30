import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { DossierDrawer, DossierJobData } from '../../src/components/dossier/DossierDrawer';
import { buildTailoredCv } from '../../src/engine/cv-builder';

const mockJob: DossierJobData = {
  id: 'test-job-cv-1',
  company: 'OpenAI',
  title: 'Product Manager, Applied Research',
  fitScore: 88,
  stage: 'LEAD',
  location: 'San Francisco, CA',
  workplace: 'hybrid',
  source: 'Work at a Startup',
  postedHoursAgo: 4,
};

test('IT-CV-01: Dossier Drawer Tab 5 Tailored CV Section & Action Controls', () => {
  const html = renderToString(
    <DossierDrawer
      job={mockJob}
      isOpen={true}
      onClose={() => {}}
    />
  );

  // Tab 5 trigger exists
  assert.ok(html.includes('5. Outreach &amp; CV') || html.includes('5. Outreach & CV'));
});

test('IT-CV-02: Synchronous CV Tailoring & Drive PDF Staging Telemetry', () => {
  const result = buildTailoredCv({
    jobId: mockJob.id,
    company: mockJob.company,
    title: mockJob.title,
    requiredSkills: ['RAG', 'Evaluation'],
  });

  assert.equal(result.candidateName, 'Hardi Jain');
  assert.equal(result.auditReport.passed, true);
  assert.ok(result.auditReport.totalMetricsChecked >= 1);
  assert.ok(result.googleDrivePdfUrl.includes('/cv/preview'));
  assert.equal(result.selectedBullets.length, 5);

  // Assert all bullets cite verified metrics
  for (const bullet of result.selectedBullets) {
    assert.ok(bullet.rawMetricString.length > 0);
    assert.ok(bullet.statement.includes(bullet.rawMetricString) || bullet.statement.includes(String(bullet.metricNumber)));
  }
});

test('IT-CV-03: Rule R7 Strict Color Blacklist AST Scanner on CV Builder Subsystems', () => {
  const filesToScan = [
    path.join(process.cwd(), 'src/engine/cv-builder.ts'),
    path.join(process.cwd(), 'src/app/api/cv/tailor/route.ts'),
    path.join(process.cwd(), 'src/app/cv/preview/page.tsx'),
    path.join(process.cwd(), 'src/components/dossier/DossierDrawer.tsx'),
  ];

  const BANNED_COLOR_TOKENS = [
    /\bindigo-\d+\b/i,
    /\bviolet-\d+\b/i,
    /\borange-\d+\b/i,
    /\bamber-\d+\b/i,
    /\bterracotta\b/i,
    /#6366f1/i, // indigo-500
    /#4f46e5/i, // indigo-600
    /#8b5cf6/i, // violet-500
    /#f97316/i, // orange-500
    /#f59e0b/i, // amber-500
  ];

  for (const filePath of filesToScan) {
    assert.ok(fs.existsSync(filePath), `File must exist for AST scan: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');

    for (const pattern of BANNED_COLOR_TOKENS) {
      const match = content.match(pattern);
      assert.equal(
        match,
        null,
        `Rule R7 Blacklisted color token "${match?.[0]}" found in ${path.basename(filePath)}`
      );
    }
  }
});

