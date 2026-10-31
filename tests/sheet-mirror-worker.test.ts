import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  getConversionFunnelTelemetry,
  exportDecisionEventsToCsv,
  logDecisionEvent,
} from '../src/engine/sheet-mirror';
import {
  AUTHORIZED_GOOGLE_OAUTH_SCOPES,
  isSpreadsheetScopeExcluded,
  validateOAuthScopes,
} from '../src/engine/google-auth';

test('UT-SM-01: Outbound Google Sheet mirroring decommissioning & scope protection', () => {
  // Verify OAuth scopes strictly exclude spreadsheets
  assert.strictEqual(isSpreadsheetScopeExcluded([...AUTHORIZED_GOOGLE_OAUTH_SCOPES]), true);
  
  const validation = validateOAuthScopes([...AUTHORIZED_GOOGLE_OAUTH_SCOPES]);
  assert.strictEqual(validation.valid, true);
  assert.strictEqual(validation.hasSpreadsheetsScope, false);
  
  // Verify that dangerous spreadsheet scope is rejected
  const taintedValidation = validateOAuthScopes(['https://www.googleapis.com/auth/spreadsheets']);
  assert.strictEqual(taintedValidation.valid, false);
  assert.strictEqual(taintedValidation.hasSpreadsheetsScope, true);

  // Verify outbound sheet sync route is decommissioned/removed
  const syncRoutePath = path.join(process.cwd(), 'src/app/api/sheet/sync/route.ts');
  assert.strictEqual(fs.existsSync(syncRoutePath), false, 'Outbound sheet sync route must be removed');
});

test('UT-SM-02: Decision event logging appends immutable records to the audit ledger', () => {
  const newEvt = logDecisionEvent({
    eventType: 'CANDIDATE_DATA_PROTECTED',
    jobId: 'test-job-01',
    company: 'Anthropic',
    actorType: 'SYSTEM',
    details: 'Enforced zero outbound mirroring boundary per Sprint 6 invariants.',
  });

  assert.ok(newEvt.id.startsWith('evt-'));
  assert.strictEqual(newEvt.eventType, 'CANDIDATE_DATA_PROTECTED');
  assert.ok(newEvt.createdAt.includes('T'));

  const csv = exportDecisionEventsToCsv();
  assert.ok(csv.includes('CANDIDATE_DATA_PROTECTED'));
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

test('UT-SM-05: Rule R7 Color Blacklist Audit across Telemetry Subsystem', () => {
  const filesToCheck = [
    path.join(process.cwd(), 'src/engine/sheet-mirror.ts'),
    path.join(process.cwd(), 'src/engine/google-auth.ts'),
    path.join(process.cwd(), 'src/app/api/telemetry/funnel/route.ts'),
    path.join(process.cwd(), 'src/app/api/audit/export-csv/route.ts'),
  ];

  const forbiddenHues = [
    'orange',
    'amber',
    'indigo',
    'violet',
    'terracotta',
  ];

  for (const file of filesToCheck) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8').toLowerCase();

    for (const hue of forbiddenHues) {
      assert.strictEqual(
        content.includes(`text-${hue}`),
        false,
        `Forbidden color hue text-${hue} found in ${file}`
      );
      assert.strictEqual(
        content.includes(`bg-${hue}`),
        false,
        `Forbidden color hue bg-${hue} found in ${file}`
      );
    }
  }
});
