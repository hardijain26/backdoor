import test from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { ImportModal } from '../../src/components/ingest/ImportModal';

test('IT-IMPORT-01: ImportModal renders drag-and-drop zone, template action, and limit badge', () => {
  const html = renderToString(
    <ImportModal isOpen={true} onClose={() => {}} onUploadSuccess={() => {}} />
  );

  assert.ok(html.includes('Import Target Opportunities'));
  assert.ok(html.includes('Limit: 50 rows per batch'));
  assert.ok(html.includes('Download Template (CSV)'));
  assert.ok(html.includes('Drag &amp; drop your file here') || html.includes('Drag & drop your file here'));
  assert.ok(html.includes('Supports .csv and .xlsx'));
  assert.ok(html.includes('border-dashed'));
});

test('IT-IMPORT-02: ImportModal hidden when isOpen is false', () => {
  const html = renderToString(
    <ImportModal isOpen={false} onClose={() => {}} onUploadSuccess={() => {}} />
  );

  assert.strictEqual(html, '');
});

test('IT-IMPORT-03: Rule R7 Strict Color Blacklist AST Scanner on ImportModal', () => {
  const filePath = path.resolve(process.cwd(), 'src/components/ingest/ImportModal.tsx');
  assert.ok(fs.existsSync(filePath), 'ImportModal.tsx must exist');

  const content = fs.readFileSync(filePath, 'utf8');

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
    /#6366f1/i,
    /#8b5cf6/i,
    /#f59e0b/i,
    /#f97316/i,
  ];

  for (const pattern of forbiddenColorPatterns) {
    assert.ok(
      !pattern.test(content),
      `Rule R7 Violation: Forbidden color token ${pattern} found in ImportModal.tsx`
    );
  }
});

