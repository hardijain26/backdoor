import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {
  calculateDeliveryWindow,
  resolveIanaTimezone,
  resolveSenderTimezone,
  stageGmailDraft,
  getRemainingDraftQuota,
  resetDraftQuotaTracker,
  RuleR8SafetyCapExceededError,
  DAILY_DRAFT_CAP,
} from '../src/engine/cadence';

function auditRuleR1SendCalls(rootDir: string = process.cwd()): {
  passed: boolean;
  violations: string[];
} {
  const dirsToScan = ['src', 'lib', 'app'];
  const fnSend = 'send';
  const FORBIDDEN_SEND_PATTERNS = [
    new RegExp('\\b' + ['users', 'messages', fnSend].join('\\.') + '\\b'),
    new RegExp('\\b' + ['gmail', 'users', 'messages', fnSend].join('\\.') + '\\b'),
    new RegExp('\\b' + ['gmail', fnSend].join('\\.') + '\\b'),
  ];

  const violations: string[] = [];

  function scanDir(dir: string) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.next' && entry.name !== '.git') {
          scanDir(fullPath);
        }
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const pattern of FORBIDDEN_SEND_PATTERNS) {
          if (pattern.test(content)) {
            violations.push(`${path.relative(rootDir, fullPath)} matched forbidden pattern ${pattern}`);
          }
        }
      }
    }
  }

  for (const d of dirsToScan) {
    scanDir(path.join(rootDir, d));
  }

  return {
    passed: violations.length === 0,
    violations,
  };
}

test('UT-CAD-01: Rule R1 Static Codebase Audit (Zero automated send calls)', () => {
  const audit = auditRuleR1SendCalls(process.cwd());
  assert.equal(
    audit.passed,
    true,
    `Rule R1 Violation: Automated send calls detected: ${audit.violations.join(', ')}`
  );
  assert.equal(audit.violations.length, 0);
});

test('UT-CAD-02: Recipient City IANA Timezone Resolution & Default Fallback', () => {
  assert.equal(resolveIanaTimezone('London, UK').timezone, 'Europe/London');
  assert.equal(resolveIanaTimezone('San Francisco, CA').timezone, 'America/Los_Angeles');
  assert.equal(resolveIanaTimezone('New York, NY').timezone, 'America/New_York');
  assert.equal(resolveIanaTimezone('Tokyo, Japan').timezone, 'Asia/Tokyo');
  assert.equal(resolveIanaTimezone('Berlin, Germany').timezone, 'Europe/Berlin');

  // Missing or unknown location falls back to US/Eastern per Runbook §5.7.1
  assert.equal(resolveIanaTimezone(undefined).timezone, 'America/New_York');
  assert.equal(resolveIanaTimezone('Remote (Global)').timezone, 'America/New_York');
});

test('UT-CAD-03: Tuesday-Thursday 09:15 AM Recipient Delivery Window Scheduling', () => {
  const scheduleLondon = calculateDeliveryWindow('London, UK');
  assert.ok(['Tue', 'Wed', 'Thu'].includes(scheduleLondon.dayOfWeek));
  assert.equal(scheduleLondon.recipientLocalTime, '09:15');
  assert.ok(scheduleLondon.timezoneBadge.includes('09:15 London'));
  assert.ok(scheduleLondon.timezoneBadge.includes('IST'));

  const scheduleSF = calculateDeliveryWindow('San Francisco, CA');
  assert.ok(['Tue', 'Wed', 'Thu'].includes(scheduleSF.dayOfWeek));
  assert.equal(scheduleSF.recipientLocalTime, '09:15');
  assert.ok(scheduleSF.timezoneBadge.includes('09:15 San Francisco'));
});

test('UT-CAD-04: Draft Staging & Gmail Compose Deep Link Generation', () => {
  resetDraftQuotaTracker();

  const staged = stageGmailDraft({
    jobId: 'job-cadence-001',
    company: 'Stripe',
    title: 'Staff Product Manager',
    door: 'door1',
    contactEmail: 'david.singleton@stripe.com',
    contactName: 'David Singleton',
    location: 'San Francisco, CA',
  });

  assert.ok(staged.cadenceId.startsWith('cadence-job-cadence-001'));
  assert.ok(staged.gmailDraftId.startsWith('draft-'));
  assert.equal(staged.status, 'DRAFT_CREATED');
  assert.equal(staged.recipientEmail, 'david.singleton@stripe.com');
  assert.equal(staged.label, 'Backdoor/Drafts');
  assert.ok(staged.gmailDeepLink.includes('mail.google.com/mail/?view=cm'));
  assert.ok(staged.gmailDeepLink.includes('to=david.singleton%40stripe.com'));
});

test('UT-CAD-05: Rule R8 40/24h Rolling Window Safety Cap Enforcement', () => {
  resetDraftQuotaTracker();

  const initialQuota = getRemainingDraftQuota();
  assert.equal(initialQuota.usedToday, 0);
  assert.equal(initialQuota.remainingQuotaToday, DAILY_DRAFT_CAP);

  // Stage 40 drafts up to the safety limit
  for (let i = 0; i < DAILY_DRAFT_CAP; i++) {
    stageGmailDraft({
      jobId: `job-bulk-${i}`,
      company: 'Test Company',
      title: 'Product Manager',
      door: 'door2',
      contactEmail: `recruiter-${i}@test.com`,
      contactName: `Recruiter ${i}`,
    });
  }

  const exhaustedQuota = getRemainingDraftQuota();
  assert.equal(exhaustedQuota.usedToday, DAILY_DRAFT_CAP);
  assert.equal(exhaustedQuota.remainingQuotaToday, 0);

  // Attempting to stage the 41st draft MUST throw RuleR8SafetyCapExceededError
  assert.throws(
    () => {
      stageGmailDraft({
        jobId: 'job-bulk-41',
        company: 'Blocked Company',
        title: 'Product Manager',
        door: 'door1',
        contactEmail: 'blocked@test.com',
        contactName: 'Blocked Target',
      });
    },
    (err: any) => {
      assert.ok(err instanceof RuleR8SafetyCapExceededError);
      assert.equal(err.currentCount, DAILY_DRAFT_CAP);
      return true;
    }
  );

  resetDraftQuotaTracker();
});

test('UT-CAD-06: Universal Sender-Primary Timezone Resolution & Multi-Region Conversion', () => {
  // Test resolveSenderTimezone from Country & State
  const india = resolveSenderTimezone({ country: 'India', state: 'Karnataka' });
  assert.equal(india.timezone, 'Asia/Kolkata');
  assert.equal(india.label, 'IST');

  const usCal = resolveSenderTimezone({ country: 'USA', state: 'California' });
  assert.equal(usCal.timezone, 'America/Los_Angeles');
  assert.equal(usCal.label, 'PST');

  const usNy = resolveSenderTimezone({ country: 'United States', state: 'NY' });
  assert.equal(usNy.timezone, 'America/New_York');
  assert.equal(usNy.label, 'EST');

  const uk = resolveSenderTimezone({ country: 'UK' });
  assert.equal(uk.timezone, 'Europe/London');

  const de = resolveSenderTimezone({ country: 'Germany' });
  assert.equal(de.timezone, 'Europe/Berlin');

  // Test Person A in India sending to Person in UK (London)
  const indiaToUk = calculateDeliveryWindow('London, UK', {
    senderCountry: 'India',
    senderState: 'Karnataka',
  });
  assert.ok(indiaToUk.primaryScheduleDisplay.includes('IST'));
  assert.ok(indiaToUk.primaryScheduleDisplay.includes('09:15 London local'));
  assert.equal(indiaToUk.recipientCity, 'London');
  assert.equal(indiaToUk.recipientLocalTime, '09:15');

  // Test Person in US (New York) sending to Person in UK (London)
  const nyToUk = calculateDeliveryWindow('London, UK', {
    senderCountry: 'USA',
    senderState: 'NY',
  });
  assert.ok(nyToUk.primaryScheduleDisplay.includes('EST'));
  assert.ok(nyToUk.primaryScheduleDisplay.includes('09:15 London local'));

  // Test Person in Germany sending to Person in SF (California)
  const deToSf = calculateDeliveryWindow('San Francisco, CA', {
    senderCountry: 'Germany',
  });
  assert.ok(deToSf.primaryScheduleDisplay.includes('CET'));
  assert.ok(deToSf.primaryScheduleDisplay.includes('09:15 San Francisco local'));
});
