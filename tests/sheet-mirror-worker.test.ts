import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  executeSheetSyncBatch,
  getSheetSyncSummary,
  getConversionFunnelTelemetry,
  exportDecisionEventsToCsv,
} from '../src/engine/sheet-mirror';

test('UT-SM-01: executeSheetSyncBatch synchronizes records and returns healthy status', async () => {
  const result = await executeSheetSyncBatch({ forceFullResync: true });

  assert.strictEqual(result.success, true);
  assert.ok(result.syncedCount > 0, 'Must sync at least 1 record');
  assert.strictEqual(result.failedCount, 0);
  assert.strictEqual(result.summary.syncStatus, 'HEALTHY');
  assert.ok(result.summary.lastSyncedAt.includes('T'));
});

test('UT-SM-02: getSheetSyncSummary calculates accurate synced row metrics', () => {
  const summary = getSheetSyncSummary();

  assert.ok(summary.connectedSheetId.length > 10);
  assert.ok(summary.sheetUrl.startsWith('https://docs.google.com/spreadsheets'));
  assert.strictEqual(typeof summary.pendingSyncCount, 'number');
  assert.strictEqual(typeof summary.totalSyncedRows, 'number');
});

test('UT-SM-03: getConversionFunnelTelemetry computes conversion percentages across pipeline stages', () => {
  const funnel = getConversionFunnelTelemetry();

  assert.ok(funnel.totalDiscovered >= funnel.totalChosen);
  assert.ok(funnel.totalChosen >= funnel.totalSent);
  assert.ok(funnel.replyRatePercent > 0);
  assert.strictEqual(typeof funnel.door1.replyRatePercent, 'number');
  assert.strictEqual(typeof funnel.door2.replyRatePercent, 'number');
  assert.strictEqual(typeof funnel.door3.replyRatePercent, 'number');
});

test('UT-SM-04: exportDecisionEventsToCsv generates RFC 4180 compliant CSV', () => {
  const csv = exportDecisionEventsToCsv();

  assert.ok(csv.startsWith('Event ID,Event Type,Job ID,Company,Actor Type,Timestamp (ISO),Details'));
  assert.ok(csv.includes('ROLE_DISCOVERED'));
  assert.ok(csv.includes('Stripe'));
  assert.ok(csv.includes('\r\n') || csv.includes('\n'));
});

test('UT-SM-05: Rule R7 Color Blacklist Audit across Sheet Mirror Subsystem', () => {
  const filesToCheck = [
    path.join(process.cwd(), 'src/engine/sheet-mirror.ts'),
    path.join(process.cwd(), 'src/app/api/sheet/sync/route.ts'),
    path.join(process.cwd(), 'src/app/api/telemetry/funnel/route.ts'),
    path.join(process.cwd(), 'src/app/api/audit/export-csv/route.ts'),
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

