import React from 'react';
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { renderToString } from 'react-dom/server';
import SettingsPage from '../../src/app/settings/page';
import SettingsWorkspace from '../../src/components/settings/SettingsWorkspace';

test('IT-SET-01: SettingsPage SSR renders tabs, timezone, and vault components', () => {
  const html = renderToString(<SettingsPage />);

  // Assert essential elements rendered
  assert.ok(html.includes('Settings &amp; Vault') || html.includes('Settings & Vault'), 'Must render page header');
  assert.ok(html.includes('AES-256 Encrypted'), 'Must display encryption status badge');
  assert.ok(html.includes('Candidate Location &amp; Timezone') || html.includes('Candidate Location & Timezone'), 'Must render timezone tab');
  assert.ok(html.includes('Source Toggles (35)'), 'Must render 35 sources tab');
  assert.ok(html.includes('Negative Filter Rules'), 'Must render negative filters tab');
  assert.ok(html.includes('Dynamic Tracks'), 'Must render dynamic tracks tab');
  assert.ok(html.includes('BYOK Secrets Vault'), 'Must render BYOK vault tab');
  assert.ok(html.includes('Google Connection'), 'Must render Google OAuth tab');
  assert.ok(html.includes('Platform Operating Data Mode'), 'Must render Platform Operating Data Mode preference');
});

test('IT-SET-02: Rule R7 Color Blacklist Audit across Settings Subsystem', () => {
  const filesToCheck = [
    path.join(process.cwd(), 'src/engine/settings.ts'),
    path.join(process.cwd(), 'src/app/settings/page.tsx'),
    path.join(process.cwd(), 'src/components/settings/SettingsWorkspace.tsx'),
    path.join(process.cwd(), 'src/app/api/settings/route.ts'),
    path.join(process.cwd(), 'src/app/api/settings/profile/route.ts'),
  ];

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

  for (const file of filesToCheck) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');

    for (const hue of forbiddenHues) {
      const regex = new RegExp(`\\b${hue}\\b`, 'i');
      assert.strictEqual(
        regex.test(content),
        false,
        `Rule R7 Violation: Forbidden color "${hue}" detected in ${path.basename(file)}`
      );
    }
  }
});

test('IT-SET-03: SettingsPage Tri-Segmented Source Fleet, Multi-Role Tabs & Inbound Streams SSR verification', () => {
  const html = renderToString(<SettingsWorkspace initialTab="sources" />);

  // Section 1: Popular ATS Systems
  assert.ok(html.includes('1. Popular ATS Systems'), 'Must render Section 1 header');
  assert.ok(html.includes('9 Direct Sources'), 'Must render 9 Direct ATS sources badge');
  assert.ok(html.includes('Greenhouse ATS') && html.includes('Lever ATS') && html.includes('Ashby ATS'), 'Must render core ATS cards');
  assert.ok(html.includes('Disable All ATS') || html.includes('Enable All ATS'), 'Must render master ATS toggle');
  assert.ok(html.includes('Add ATS'), 'Must render Add ATS button');

  // Section 2: Platform & Community Feeds
  assert.ok(html.includes('2. Platform &amp; Community Feeds') || html.includes('2. Platform & Community Feeds'), 'Must render Section 2 header');
  assert.ok(html.includes('23 Multi-Role Feeds'), 'Must render 23 multi-role feeds badge');
  assert.ok(html.includes('All Feeds (23)') && html.includes('Design &amp; UX') || html.includes('Design & UX'), 'Must render role filter pills');
  assert.ok(html.includes('Remote Jobs (6)'), 'Must render Remote Jobs tab');
  assert.ok(html.includes('Startup Jobs (4)'), 'Must render Startup Jobs tab (YC & Wellfound)');
  assert.ok(html.includes('Product &amp; Dynamic (7)') || html.includes('Product & Dynamic (7)'), 'Must render Product & Dynamic tab');
  assert.ok(html.includes('Job API Marketplace &amp; Open Source Registry') || html.includes('Job API Marketplace & Open Source Registry'), 'Must render Job API Marketplace');

  // Section 3: Inbound Streams
  assert.ok(html.includes('3. Public Social, Community &amp; Inbound Messaging Streams') || html.includes('3. Public Social, Community & Inbound Messaging Streams'), 'Must render Section 3 header');
  assert.ok(html.includes('Direct Gmail Inbox Ingest (LinkedIn &amp; Naukri)') || html.includes('Direct Gmail Inbox Ingest (LinkedIn & Naukri)'), 'Must render Direct Gmail Ingest card');
  assert.ok(html.includes('Gmail Setup Guide') || html.includes('Auto-Filter &amp; Label LinkedIn &amp; Naukri Alerts'), 'Must render Gmail Setup Guide');
  assert.ok(html.includes('Reddit Job &amp; Hiring Communities') || html.includes('Reddit Job & Hiring Communities'), 'Must render Reddit communities card');
  assert.ok(html.includes('r/ProductManagement'), 'Must render default monitored subreddits');
  assert.ok(html.includes('Slack Community Channels'), 'Must render Slack channel manager');
  assert.ok(html.includes('Public Twitter / X Hiring Feeds'), 'Must render Twitter hiring manager');
  assert.ok(html.includes('@levelsio') && html.includes('@sama'), 'Must render default monitored Twitter handles');
});

