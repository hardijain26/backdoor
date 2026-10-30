import React from 'react';
import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { renderToString } from 'react-dom/server';
import { Navbar } from '../../src/components/Navbar';

test('UT-MOB-01: Navbar renders hamburger menu button with WCAG compliant 44px touch target', () => {
  const html = renderToString(<Navbar />);

  // Check for hamburger button with min 44px (w-11 h-11 = 44px)
  assert.ok(html.includes('aria-label="Toggle navigation menu"'), 'Must have accessible mobile menu button');
  assert.ok(html.includes('w-11') && html.includes('h-11'), 'Must satisfy WCAG 44px x 44px touch target');
});

test('UT-MOB-02: Navbar contains links for all 7 primary workspaces', () => {
  const html = renderToString(<Navbar />);

  assert.ok(html.includes('/radar'), 'Must include Radar link');
  assert.ok(html.includes('/jobs'), 'Must include Pipeline link');
  assert.ok(html.includes('/outreach'), 'Must include Outreach link');
  assert.ok(html.includes('/interviews'), 'Must include Interviews link');
  assert.ok(html.includes('/dossiers'), 'Must include Dossiers link');
  assert.ok(html.includes('/health'), 'Must include Health link');
  assert.ok(html.includes('/settings'), 'Must include Settings link');
});

test('UT-MOB-03: Dossier drawer enforces fluid responsive width', () => {
  const drawerSource = fs.readFileSync(
    path.join(process.cwd(), 'src/components/dossier/DossierDrawer.tsx'),
    'utf8'
  );

  assert.ok(
    drawerSource.includes('w-full max-w-[640px]'),
    'Drawer must span full width on small screens and cap at 640px on desktop'
  );
});

test('UT-MOB-04: CSS enforces overflow-x hidden for zero horizontal scroll on mobile', () => {
  const css = fs.readFileSync(path.join(process.cwd(), 'src/app/globals.css'), 'utf8');

  assert.ok(css.includes('overflow-x: hidden;'), 'Globals CSS must restrict horizontal overflow');
  assert.ok(css.includes('max-width: 100vw;'), 'Viewport width must be bounded');
});

test('UT-MOB-05: Rule R7 Color Blacklist Audit across Mobile Components', () => {
  const filesToCheck = [
    path.join(process.cwd(), 'src/components/Navbar.tsx'),
    path.join(process.cwd(), 'src/app/globals.css'),
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

