import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  BULK_UPLOAD_COLUMNS,
  BULK_UPLOAD_TEMPLATE_CSV,
  MAX_BULK_UPLOAD_ROWS,
  parseRFC4180Csv,
  validateBulkUploadGrid,
  executeBulkUpload,
  resetBulkUploadStore,
} from '../src/engine/bulk-upload';
import {
  AUTHORIZED_GOOGLE_OAUTH_SCOPES,
  isSpreadsheetScopeExcluded,
  validateOAuthScopes,
} from '../src/engine/google-auth';

test('UT-BULK-01: GET /api/ingest/template schema definition returns standard 6 columns', () => {
  assert.strictEqual(BULK_UPLOAD_COLUMNS.length, 6);
  assert.deepStrictEqual([...BULK_UPLOAD_COLUMNS], [
    'company_name',
    'job_title',
    'apply_url',
    'location',
    'workplace_type',
    'raw_description',
  ]);

  const parsedTemplate = parseRFC4180Csv(BULK_UPLOAD_TEMPLATE_CSV);
  assert.ok(parsedTemplate.length >= 2, 'Template must contain header and sample row');

  const headers = parsedTemplate[0];
  assert.strictEqual(headers[0], 'company_name');
  assert.strictEqual(headers[1], 'job_title');
  assert.strictEqual(headers[2], 'apply_url');
  assert.strictEqual(headers[3], 'location');
  assert.strictEqual(headers[4], 'workplace_type');
  assert.strictEqual(headers[5], 'raw_description');

  const sampleRow = parsedTemplate[1];
  assert.ok(sampleRow[0].length > 0, 'Sample company must be populated');
  assert.ok(sampleRow[2].startsWith('http'), 'Sample apply URL must be HTTP/HTTPS');
  assert.ok(['remote', 'hybrid', 'on-site'].includes(sampleRow[4]), 'Sample workplace type must be valid');
  assert.ok(sampleRow[5].length >= 20, 'Sample description must be at least 20 chars');
});

test('UT-BULK-02: 50-row hard cap rejects files exceeding maximum batch limit', () => {
  const header = ['company_name', 'job_title', 'apply_url', 'location', 'workplace_type', 'raw_description'];
  const rows: string[][] = [header];

  // Generate 51 data rows (exceeding 50 limit)
  for (let i = 1; i <= 51; i++) {
    rows.push([
      `Company ${i}`,
      `Staff Engineer ${i}`,
      `https://example.com/job-${i}`,
      'Remote',
      'remote',
      `Engineering role responsibilities for batch test row ${i}. Cross-functional system design.`,
    ]);
  }

  const result = validateBulkUploadGrid(rows);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.some((e) => e.column === 'batch_limit'));
  assert.ok(
    result.errors.some((e) => e.message.includes(`Upload exceeds maximum batch limit of ${MAX_BULK_UPLOAD_ROWS} rows`))
  );
});

test('UT-BULK-03: Pre-validation error reporting for missing fields, bad URLs, and invalid workplace_type', () => {
  const header = ['company_name', 'job_title', 'apply_url', 'location', 'workplace_type', 'raw_description'];
  const testGrid: string[][] = [
    header,
    // Row 1: Missing company_name
    ['', 'Staff PM', 'https://stripe.com/jobs/1', 'San Francisco', 'remote', 'Lead infrastructure product systems.'],
    // Row 2: Invalid URL (ftp protocol)
    ['Linear', 'Product Lead', 'ftp://linear.app/jobs/2', 'Remote', 'remote', 'Drive roadmap and workflows design.'],
    // Row 3: Invalid workplace_type
    ['OpenAI', 'Research PM', 'https://openai.com/jobs/3', 'San Francisco', 'in_office', 'Lead applied AI models research.'],
    // Row 4: Description too short (< 20 chars)
    ['Anthropic', 'Reasoning PM', 'https://anthropic.com/jobs/4', 'San Francisco', 'hybrid', 'Short text.'],
  ];

  const result = validateBulkUploadGrid(testGrid);
  assert.strictEqual(result.valid, false);
  assert.ok(result.errors.length >= 4);

  // Row 1 error
  const row1Err = result.errors.find((e) => e.row === 1 && e.column === 'company_name');
  assert.ok(row1Err, 'Must catch missing company_name on Row 1');

  // Row 2 error
  const row2Err = result.errors.find((e) => e.row === 2 && e.column === 'apply_url');
  assert.ok(row2Err, 'Must catch invalid apply_url protocol on Row 2');

  // Row 3 error
  const row3Err = result.errors.find((e) => e.row === 3 && e.column === 'workplace_type');
  assert.ok(row3Err, 'Must catch invalid workplace_type on Row 3');

  // Row 4 error
  const row4Err = result.errors.find((e) => e.row === 4 && e.column === 'raw_description');
  assert.ok(row4Err, 'Must catch short description (< 20 chars) on Row 4');
});

test('UT-BULK-04: Successful ingestion, deduplication key computation, and Module 3 scoring', () => {
  resetBulkUploadStore();

  const validRows = [
    {
      company_name: 'Stripe, Inc.',
      job_title: 'Staff PM, Payments Platform',
      apply_url: 'https://stripe.com/jobs/staff-pm',
      location: 'San Francisco, CA',
      workplace_type: 'hybrid' as const,
      raw_description: 'Lead engineering systems for global payments network. Design low-latency transactional architectures and cross-functional partner alignment.',
    },
    {
      company_name: 'Linear App',
      job_title: 'Lead Product Manager',
      apply_url: 'https://linear.app/careers/pm',
      location: 'Remote (US/EU)',
      workplace_type: 'remote' as const,
      raw_description: 'Architect developer workflows and issue tracking telemetry. Accelerate product execution and user feedback loops across high-velocity teams.',
    },
  ];

  const result = executeBulkUpload(validRows);

  assert.strictEqual(result.success, true);
  assert.strictEqual(result.total, 2);
  assert.strictEqual(result.imported, 2);
  assert.strictEqual(result.deduplicated, 0);
  assert.strictEqual(result.jobs.length, 2);

  const stripeJob = result.jobs[0];
  assert.ok(stripeJob.dedupMatchKey.includes('stripe'));
  assert.ok(stripeJob.fitScore >= 0 && stripeJob.fitScore <= 100);
  assert.strictEqual(stripeJob.source, 'bulk_upload');

  // Test deduplication on re-upload of identical opportunity
  const duplicateRun = executeBulkUpload([validRows[0]]);
  assert.strictEqual(duplicateRun.imported, 0);
  assert.strictEqual(duplicateRun.deduplicated, 1);
});

test('UT-BULK-05: Google OAuth scope initialization strictly excludes spreadsheets', () => {
  assert.strictEqual(isSpreadsheetScopeExcluded([...AUTHORIZED_GOOGLE_OAUTH_SCOPES]), true);

  const validation = validateOAuthScopes([...AUTHORIZED_GOOGLE_OAUTH_SCOPES]);
  assert.strictEqual(validation.valid, true);
  assert.strictEqual(validation.hasSpreadsheetsScope, false);

  // Check all authorized scopes
  for (const scope of AUTHORIZED_GOOGLE_OAUTH_SCOPES) {
    assert.strictEqual(scope.includes('spreadsheets'), false);
  }

  // Ensure documents, drive.file, gmail.compose, gmail.readonly, calendar.events are retained
  assert.ok(AUTHORIZED_GOOGLE_OAUTH_SCOPES.some((s) => s.includes('documents')));
  assert.ok(AUTHORIZED_GOOGLE_OAUTH_SCOPES.some((s) => s.includes('drive.file')));
  assert.ok(AUTHORIZED_GOOGLE_OAUTH_SCOPES.some((s) => s.includes('gmail.compose')));
  assert.ok(AUTHORIZED_GOOGLE_OAUTH_SCOPES.some((s) => s.includes('gmail.readonly')));
  assert.ok(AUTHORIZED_GOOGLE_OAUTH_SCOPES.some((s) => s.includes('calendar.events')));
});

test('UT-BULK-06: Strict Design System (Precision Cobalt & Steel) & Zero Forbidden Colors', () => {
  const filesToCheck = [
    'src/engine/bulk-upload.ts',
    'src/components/ingest/ImportModal.tsx',
    'src/app/api/ingest/template/route.ts',
    'src/app/api/ingest/bulk-upload/route.ts',
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
    /#6366f1/i,
    /#8b5cf6/i,
    /#f59e0b/i,
    /#f97316/i,
  ];

  for (const file of filesToCheck) {
    const fullPath = path.resolve(process.cwd(), file);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf8');

    for (const pattern of forbiddenColorPatterns) {
      assert.ok(
        !pattern.test(content),
        `Rule R7 Violation: Forbidden color token ${pattern} found in ${file}`
      );
    }
  }
});
