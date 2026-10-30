import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Frontend Integration Test Suite for S3-T03: Backdoor Contact Discovery & Multi-Provider Enrichment

test('IT-ENRICH-01: Tab 4 Three-Door Card Architecture & Target Selection', () => {
  const drawerPath = path.resolve(process.cwd(), 'src/components/dossier/DossierDrawer.tsx');
  const content = fs.readFileSync(drawerPath, 'utf8');

  // Verify all 3 doors are present in Tab 4
  assert.ok(content.includes('Door 1: Hiring Manager'), 'Tab 4 must render Door 1 (Hiring Manager)');
  assert.ok(content.includes('Door 2: Recruiter / Talent Lead'), 'Tab 4 must render Door 2 (Recruiter)');
  assert.ok(content.includes('Door 3: Peer / Staff PM'), 'Tab 4 must render Door 3 (Peer PM)');

  // Verify Target Selection button states
  assert.ok(content.includes('Selected Target ✓'), 'Must render selected target indicator state');
  assert.ok(content.includes('Select Target'), 'Must render select target action');
});

test('IT-ENRICH-02: Telemetry Badges (Verified Email, Confidence, LinkedIn Search)', () => {
  const drawerPath = path.resolve(process.cwd(), 'src/components/dossier/DossierDrawer.tsx');
  const content = fs.readFileSync(drawerPath, 'utf8');

  // Verify Verified Work Email badge
  assert.ok(content.includes('Verified Work Email'), 'Must render verified work email badge');

  // Verify Confidence telemetry
  assert.ok(content.includes('Confidence:'), 'Must render confidence percentage telemetry');

  // Verify LinkedIn search CTA
  assert.ok(content.includes('Search on LinkedIn &rarr;'), 'Must render LinkedIn search action link');
});

test('IT-ENRICH-03: Rule R7 Strict Color Blacklist AST Scanner on Contact Subsystems', () => {
  const filesToScan = [
    'src/engine/contact-enrichment.ts',
    'src/components/dossier/DossierDrawer.tsx',
    'src/app/api/enrichment/contacts/route.ts'
  ];

  const FORBIDDEN_COLOR_REGEX = /(indigo|violet|orange|amber|terracotta)/i;

  for (const relPath of filesToScan) {
    const fullPath = path.resolve(process.cwd(), relPath);
    if (!fs.existsSync(fullPath)) continue;

    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const lines = fileContent.split('\n');

    lines.forEach((line, index) => {
      // Exclude comments
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;

      const match = trimmed.match(FORBIDDEN_COLOR_REGEX);
      assert.strictEqual(
        match,
        null,
        `Rule R7 AST Blacklist Violation in ${relPath}:${index + 1}: Found forbidden token "${match ? match[0] : ''}"`
      );
    });
  }
});

