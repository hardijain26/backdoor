import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { DossierDrawer, DossierJobData } from '../../src/components/dossier/DossierDrawer';
import { calculateDeliveryWindow, getRemainingDraftQuota } from '../../src/engine/cadence';

const mockJob: DossierJobData = {
  id: 'test-cadence-job-1',
  company: 'Stripe',
  title: 'Staff Product Manager',
  fitScore: 92,
  stage: 'LEAD',
  location: 'San Francisco, CA',
  workplace: 'hybrid',
  source: 'YC Work at a Startup',
  postedHoursAgo: 2,
};

test('IT-CAD-01: Tab 5 Timezone Schedule & Quota Telemetry Rendering', () => {
  const schedule = calculateDeliveryWindow(mockJob.location);
  const quota = getRemainingDraftQuota();

  assert.ok(schedule.timezoneBadge.includes('San Francisco'));
  assert.ok(schedule.timezoneBadge.includes('09:15'));
  assert.equal(quota.cap, 40);

  const html = renderToString(
    <DossierDrawer
      job={mockJob}
      isOpen={true}
      onClose={() => {}}
    />
  );

  // Tab 5 button is present
  assert.ok(html.includes('5. Outreach &amp; CV') || html.includes('5. Outreach & CV'));
});

test('IT-CAD-02: Delivery Window Geocoding Across Multiple World Tech Hubs', () => {
  const hubs = [
    { loc: 'London, UK', city: 'London' },
    { loc: 'New York, NY', city: 'New York' },
    { loc: 'Berlin, Germany', city: 'Berlin' },
    { loc: 'Tokyo, Japan', city: 'Tokyo' },
  ];

  for (const hub of hubs) {
    const res = calculateDeliveryWindow(hub.loc);
    assert.ok(res.timezoneBadge.includes(hub.city));
    assert.equal(res.recipientLocalTime, '09:15');
    assert.ok(['Tue', 'Wed', 'Thu'].includes(res.dayOfWeek));
  }
});

test('IT-CAD-03: Rule R7 Strict Color Blacklist AST Scanner on Cadence Subsystems', () => {
  const filesToScan = [
    path.join(process.cwd(), 'src/engine/cadence.ts'),
    path.join(process.cwd(), 'src/app/api/cadence/stage/route.ts'),
    path.join(process.cwd(), 'src/app/api/cadence/quota/route.ts'),
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

test('IT-CAD-04: Recipient Working Hours Checkbox and Explanatory Tooltip Architecture', () => {
  const drawerSource = fs.readFileSync(
    path.join(process.cwd(), 'src/components/dossier/DossierDrawer.tsx'),
    'utf8'
  );

  // Checkbox presence
  assert.ok(
    drawerSource.includes('Schedule for recipient working hours'),
    'DossierDrawer must contain the "Schedule for recipient working hours" checkbox label'
  );

  // Tooltip button & explanation
  assert.ok(
    drawerSource.includes('Why this time?') || drawerSource.includes('Hide explanation'),
    'DossierDrawer must provide an educational tooltip trigger'
  );
  assert.ok(
    drawerSource.includes('3.8× higher response rates') || drawerSource.includes('3.8'),
    'Tooltip must explain the 3.8x response rate justification'
  );
  assert.ok(
    drawerSource.includes('Schedule send') || drawerSource.includes('Rule R1'),
    'Tooltip must instruct how to use Gmail Schedule send under Rule R1'
  );
});

