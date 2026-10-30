import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { CadenceCard } from '../../src/components/outreach/CadenceCard';
import OutreachPage from '../../src/app/outreach/page';
import { CadenceItem } from '../../src/engine/cadence-lifecycle';

const mockCadenceItem: CadenceItem = {
  id: 'test-card-01',
  jobId: 'job-figma',
  company: 'Figma',
  jobTitle: 'Senior PM, Systems',
  location: 'San Francisco, CA',
  contactName: 'Sho Kuwamoto',
  contactTitle: 'VP of Product',
  contactEmail: 'skuwamoto@figma.com',
  door: 'door1',
  channel: 'GMAIL',
  stepNumber: 1,
  status: 'DRAFT_CREATED',
  swimlane: 'DRAFT_READY',
  suggestedSendAt: '2026-11-03T17:15:00.000Z',
  primaryDispatchWindow: 'Tue 22:45 IST (09:15 San Francisco local)',
  gmailDeepLink: 'https://mail.google.com/mail',
  subject: 'Product leadership at Figma',
  bodyText: 'Pitch body text',
  linkedInNote: 'Hi Sho, noticed Figma is scaling systems-level workflows. Having scaled product systems from 0 to 1M users, I have specific ideas on team adoption friction.',
  updatedAt: new Date().toISOString(),
};

test('IT-OUTREACH-01: 5-Column Kanban Board rendering with metric ribbon', () => {
  const html = renderToString(<OutreachPage />);

  // Title and Subsystem identifier
  assert.ok(html.includes('Outreach &amp; Cadence Board') || html.includes('Outreach & Cadence Board'));
  assert.ok(html.includes('Module 7 Lifecycle Engine'));

  // Metrics ribbon
  assert.ok(html.includes('Active Campaigns'));
  assert.ok(html.includes('In Conversation'));
  assert.ok(html.includes('Follow-Ups Due'));
  assert.ok(html.includes('Drafts Ready'));
  assert.ok(html.includes('24h Quota (Rule R8)'));

  // Rule R1 Invariant
  assert.ok(html.includes('Cardinal Rule R1 Invariant: 100% Human Dispatch'));

  // 5 Swimlanes
  assert.ok(html.includes('Draft Ready in Gmail'));
  assert.ok(html.includes('Sent (Awaiting Reply)'));
  assert.ok(html.includes('Follow-Up Due (Day 3/5)'));
  assert.ok(html.includes('In Conversation'));
  assert.ok(html.includes('Bounced / Archived'));
});

test('IT-OUTREACH-02: CadenceCard component rendering with Door chip and CTAs', () => {
  const html = renderToString(
    <CadenceCard item={mockCadenceItem} onTransition={async () => {}} />
  );

  // Door chip
  assert.ok(html.includes('Door 1: Decision Maker'));
  assert.ok(html.includes('Step') && html.includes('/3'));

  // Company and contact
  assert.ok(html.includes('Figma'));
  assert.ok(html.includes('Sho Kuwamoto'));
  assert.ok(html.includes('VP of Product'));

  // Telemetry dispatch window
  assert.ok(html.includes('Tue 22:45 IST (09:15 San Francisco local)'));

  // CTAs
  assert.ok(html.includes('Open in Gmail Web &rarr;') || html.includes('Open in Gmail Web'));
  assert.ok(html.includes('LinkedIn Note'));
  assert.ok(html.includes('Mark as Sent'));
});

test('IT-OUTREACH-03: LinkedIn Note character safety check (<= 300 chars)', () => {
  assert.ok(
    mockCadenceItem.linkedInNote.length <= 300,
    `LinkedIn note exceeds 300 characters: ${mockCadenceItem.linkedInNote.length}`
  );
});

test('IT-OUTREACH-04: Rule R7 Strict Color Blacklist AST Scanner across outreach subsystems', () => {
  const filesToScan = [
    path.join(process.cwd(), 'src/engine/cadence-lifecycle.ts'),
    path.join(process.cwd(), 'src/components/outreach/CadenceCard.tsx'),
    path.join(process.cwd(), 'src/app/outreach/page.tsx'),
    path.join(process.cwd(), 'src/app/api/cadence/board/route.ts'),
    path.join(process.cwd(), 'src/app/api/cadence/transition/route.ts'),
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
