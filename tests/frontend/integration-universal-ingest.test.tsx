import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Frontend Integration Test Suite for Universal Ingest Modal (Runbook §4.4)

test('IT-INGEST-01: Universal Ingest Modal Component & Tab Architecture', () => {
  const componentPath = path.resolve(process.cwd(), 'src/components/ingest/UniversalIngestModal.tsx');
  assert.ok(fs.existsSync(componentPath), 'UniversalIngestModal.tsx must exist');

  const content = fs.readFileSync(componentPath, 'utf8');

  // Verify 3 modes
  assert.ok(content.includes('URL Auto-Scrape'), 'Must have URL Auto-Scrape tab');
  assert.ok(content.includes('Raw Text / Message'), 'Must have Raw Text / Message tab');
  assert.ok(content.includes('Manual Entry'), 'Must have Manual Entry tab');

  // Verify Candidate Track selector
  assert.ok(content.includes('Target Candidate Track'), 'Must include track selector');
  assert.ok(content.includes('Senior / Staff PM'), 'Must include Senior / Staff PM track option');
  assert.ok(content.includes('AI Product Lead'), 'Must include AI Product Lead track option');

  // Verify Shift + I shortcut badge
  assert.ok(content.includes('Shift + I'), 'Must display Shift + I shortcut indicator');
});

test('IT-INGEST-02: Escape Priority Stack & Ingestion Feedback States', () => {
  const componentPath = path.resolve(process.cwd(), 'src/components/ingest/UniversalIngestModal.tsx');
  const content = fs.readFileSync(componentPath, 'utf8');

  // Verify Escape key closes dialog
  assert.ok(
    content.includes("e.key === 'Escape'"),
    'Must implement Escape key listener to dismiss modal'
  );

  // Verify feedback states
  assert.ok(content.includes('Validating SSRF safety (Rule R6)...'), 'Must show SSRF validation step');
  assert.ok(content.includes('Checking canonical deduplication'), 'Must show deduplication step');
  assert.ok(content.includes('isDuplicate'), 'Must handle duplicate role notification state');
});

test('IT-INGEST-03: Rule R7 Strict Color Blacklist AST Scanner on Ingest Modal', () => {
  const componentPath = path.resolve(process.cwd(), 'src/components/ingest/UniversalIngestModal.tsx');
  const content = fs.readFileSync(componentPath, 'utf8');

  // Strip comments
  const stripped = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').toLowerCase();

  const bannedKeywords = ['indigo', 'violet', 'orange', 'amber', 'terracotta'];
  for (const banned of bannedKeywords) {
    const regex = new RegExp(`\\b${banned}\\b`, 'i');
    assert.ok(
      !regex.test(stripped),
      `Rule R7 violation: Found forbidden color token "${banned}" in UniversalIngestModal.tsx`
    );
  }
});

test('IT-INGEST-04: Morning Radar Global Keyboard Activation (Shift + I)', () => {
  const radarPagePath = path.resolve(process.cwd(), 'src/app/radar/page.tsx');
  const content = fs.readFileSync(radarPagePath, 'utf8');

  // Verify global Shift + I key listener
  assert.ok(
    content.includes("e.shiftKey && (e.key === 'I' || e.key === 'i')"),
    'MorningRadarPage must listen for global Shift + I shortcut'
  );

  // Verify UniversalIngestModal mounting
  assert.ok(
    content.includes('<UniversalIngestModal'),
    'MorningRadarPage must mount UniversalIngestModal'
  );

  // Verify auto-opening drawer on ingestion
  assert.ok(
    content.includes('setSelectedDrawerId(newJob.id)'),
    'Successful ingestion must immediately slide open the Dossier Drawer'
  );
});
