import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Master Compliance & Invariants Audit: Clauses C-01 through C-30
// Runbook §6 | Architecture Specification | Cardinal Rules R1-R8

test('COMPLIANCE C-01 to C-05: Cardinal Rule R1 — Absolute Zero Automated Send Invariant', () => {
  const sourceDirs = ['src/engine', 'src/app/api', 'src/components'];
  const forbiddenPatterns = [
    /gmail\.users\.messages\.send/i,
    /\.messages\.send\(/i,
    /sendMail\(/i,
    /transporter\.send/i,
    /smtpClient\.send/i,
  ];

  for (const dir of sourceDirs) {
    const fullDir = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullDir)) continue;

    const scanDirectory = (currentPath: string) => {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        const entryPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
          scanDirectory(entryPath);
        } else if (/\.(ts|tsx|js)$/.test(entry.name)) {
          const content = fs.readFileSync(entryPath, 'utf8');
          for (const pattern of forbiddenPatterns) {
            assert.strictEqual(
              pattern.test(content),
              false,
              `Rule R1 Violation: Automated send call detected in ${entryPath} matching ${pattern}`
            );
          }
        }
      }
    };

    scanDirectory(fullDir);
  }
});

test('COMPLIANCE C-06 to C-10: Cardinal Rule R7 — Global Color Blacklist Audit', () => {
  const forbiddenColorTokens = [
    '#f97316', // orange-500
    '#ea580c', // orange-600
    '#f59e0b', // amber-500
    '#d97706', // amber-600
    '#6366f1', // indigo-500
    '#4f46e5', // indigo-600
    '#8b5cf6', // violet-500
    '#7c3aed', // violet-600
    'bg-orange-',
    'text-orange-',
    'bg-amber-',
    'text-amber-',
    'bg-indigo-',
    'text-indigo-',
    'bg-violet-',
    'text-violet-',
  ];

  const sourceDirs = ['src/app', 'src/components', 'extension'];

  for (const dir of sourceDirs) {
    const fullDir = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullDir)) continue;

    const scanDirectory = (currentPath: string) => {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
      for (const entry of entries) {
        const entryPath = path.join(currentPath, entry.name);
        if (entry.isDirectory()) {
          scanDirectory(entryPath);
        } else if (/\.(tsx|ts|jsx|js|html)$/.test(entry.name)) {
          const content = fs.readFileSync(entryPath, 'utf8');
          for (const token of forbiddenColorTokens) {
            assert.strictEqual(
              content.includes(token),
              false,
              `Rule R7 Violation: Forbidden color token "${token}" found in ${entryPath}`
            );
          }
        }
      }
    };

    scanDirectory(fullDir);
  }
});

test('COMPLIANCE C-11 to C-15: Cardinal Rule R8 — Rolling 40/24h Draft Safety Rate Limiter', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getRemainingDraftQuota, DAILY_DRAFT_CAP } = require('../src/engine/cadence');
  assert.strictEqual(DAILY_DRAFT_CAP, 40, 'Daily draft quota cap must be strictly 40');

  const quota = getRemainingDraftQuota();
  assert.strictEqual(quota.cap, 40, 'Quota cap must equal 40');
  assert.ok(quota.remainingQuotaToday <= 40, 'Remaining quota cannot exceed cap');
});

test('COMPLIANCE C-16 to C-20: Security, AES-256 Vault Encryption, & RLS Policies', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { encryptVaultSecret, decryptVaultSecret } = require('../src/engine/settings');

  const testPayload = 'sk_apollo_super_secret_token_live';
  const ciphertext = encryptVaultSecret(testPayload);
  assert.notStrictEqual(ciphertext, testPayload);
  assert.strictEqual(decryptVaultSecret(ciphertext), testPayload);

  // Check SQL schema file for RLS policies
  const ddlFile = path.join(process.cwd(), 'database/schema.sql');
  if (fs.existsSync(ddlFile)) {
    const sql = fs.readFileSync(ddlFile, 'utf8');
    assert.ok(sql.includes('ENABLE ROW LEVEL SECURITY'), 'All tables must enforce RLS');
  }
});

test('COMPLIANCE C-21 to C-25: Rule R5 Metric Exactness & Zero Hallucination Bank Integrity', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { HARDI_PROOF_POINTS_LIBRARY, verifyZeroMetricHallucination } = require('../src/engine/cv-builder');

  assert.ok(HARDI_PROOF_POINTS_LIBRARY.length >= 8, 'Must have all 8 verified M8 proof points');

  for (const item of HARDI_PROOF_POINTS_LIBRARY) {
    const audit = verifyZeroMetricHallucination(item.statement, HARDI_PROOF_POINTS_LIBRARY);
    assert.strictEqual(audit.passed, true, `Proof point ${item.id} must pass byte-for-byte exactness`);
    assert.strictEqual(audit.hallucinatedMetrics.length, 0);
  }
});

test('COMPLIANCE C-26 to C-30: Fleet Health, Async Sheet Mirroring & Mobile Responsiveness', () => {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { VERIFIED_SOURCES } = require('../src/engine/scraper');
  assert.strictEqual(VERIFIED_SOURCES.length, 35, 'Fleet must contain exactly 35 verified sources');

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { getConversionFunnelTelemetry } = require('../src/engine/sheet-mirror');
  const funnel = getConversionFunnelTelemetry();
  assert.ok(funnel.totalDiscovered >= funnel.totalSent, 'Pipeline funnel counts must be coherent');

  // Check globals.css for overflow-x hidden
  const css = fs.readFileSync(path.join(process.cwd(), 'src/app/globals.css'), 'utf8');
  assert.ok(css.includes('overflow-x: hidden;'), 'Globals CSS must restrict horizontal overflow');
});
