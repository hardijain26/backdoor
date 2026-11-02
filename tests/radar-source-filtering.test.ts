import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import {
  parseGmailAlertEmail,
  syncGmailJobAlerts,
  clearIngestedAlertJobs,
  SAMPLE_GMAIL_ALERTS,
  GmailRawEmail,
  formatSourceLabel,
} from '../src/engine/gmail-ingest';

test('UT-RSF-01: Direct Gmail Alert Parser - LinkedIn Email Digest Ingestion', () => {
  const linkedInEmail: GmailRawEmail = SAMPLE_GMAIL_ALERTS[0];
  const jobs = parseGmailAlertEmail(linkedInEmail);

  assert.ok(jobs.length >= 2, 'Must parse at least 2 job cards from LinkedIn digest');
  
  const snowflake = jobs.find((j) => j.company.toLowerCase().includes('snowflake'));
  assert.ok(snowflake, 'Must extract Snowflake job posting');
  assert.ok(snowflake.title.toLowerCase().includes('staff ai product manager'));
  assert.strictEqual(snowflake.source, 'linkedin_alert');
  assert.ok(snowflake.applyUrl.startsWith('https://www.linkedin.com/jobs/view/'));
  assert.ok(!snowflake.applyUrl.includes('trk='), 'Tracking redirects must be stripped (Rule R6)');
  assert.ok(snowflake.fitScore >= 70, 'Suitability score must be >= 70 for AI PM role');
});

test('UT-RSF-02: Direct Gmail Alert Parser - Naukri India Email Digest with LPA CTC', () => {
  const naukriEmail: GmailRawEmail = SAMPLE_GMAIL_ALERTS[1];
  const jobs = parseGmailAlertEmail(naukriEmail);

  assert.ok(jobs.length >= 2, 'Must parse at least 2 job cards from Naukri digest');

  const swiggy = jobs.find((j) => j.company.toLowerCase().includes('swiggy'));
  assert.ok(swiggy, 'Must extract Swiggy job posting');
  assert.strictEqual(swiggy.source, 'naukri_alert');
  assert.ok(swiggy.location.includes('Bengaluru') || swiggy.location.includes('KA'), 'Location must normalize to Indian metro');
  assert.ok(swiggy.salary?.includes('₹45') || swiggy.salary?.includes('LPA') || swiggy.salary?.includes('PA'), 'Must extract Indian LPA compensation');
  assert.ok(swiggy.door2?.name?.includes('Priya') || swiggy.door2?.title?.includes('Recruiter'), 'Recruiter contact must be extracted for Door 2');
});

test('UT-RSF-03: syncGmailJobAlerts Deduplication & In-Memory Fleet Storage', async () => {
  clearIngestedAlertJobs();

  // First sync
  const res1 = await syncGmailJobAlerts();
  assert.strictEqual(res1.success, true);
  assert.ok(res1.count >= 4, 'Must ingest at least 4 jobs on initial sync');
  assert.ok(res1.queriesScanned.some((q) => q.includes('jobalerts-noreply@linkedin.com')));
  assert.ok(res1.queriesScanned.some((q) => q.includes('alerts@naukri.com')));

  // Second sync with identical emails should deduplicate completely
  const res2 = await syncGmailJobAlerts();
  assert.strictEqual(res2.success, true);
  assert.strictEqual(res2.count, 0, 'Subsequent sync with duplicate emails must ingest 0 new jobs');

  clearIngestedAlertJobs();
});

test('UT-RSF-04: formatSourceLabel Provenance Mapping & Display Formatting', () => {
  assert.strictEqual(formatSourceLabel('linkedin_alert'), 'LinkedIn Alert');
  assert.strictEqual(formatSourceLabel('linkedin_digest'), 'LinkedIn Alert');
  assert.strictEqual(formatSourceLabel('naukri_alert'), 'Naukri Alert');
  assert.strictEqual(formatSourceLabel('naukri_webhook'), 'Naukri Alert');
  assert.strictEqual(formatSourceLabel('greenhouse'), 'Greenhouse ATS');
  assert.strictEqual(formatSourceLabel('lever'), 'Lever ATS');
  assert.strictEqual(formatSourceLabel('ashby'), 'Ashby ATS');
  assert.strictEqual(formatSourceLabel('yc_startup'), 'YC Startup');
  assert.strictEqual(formatSourceLabel('bulk_upload'), 'Bulk Upload');
});

test('UT-RSF-05: Cardinal Rule R1 Audit on Gmail Ingest Subsystem (Zero automated send)', () => {
  const filePath = path.join(process.cwd(), 'src/engine/gmail-ingest.ts');
  const content = fs.readFileSync(filePath, 'utf8');

  // Verify only readonly scope and zero send routines
  assert.ok(!content.includes('gmail.send'), 'Must strictly forbid gmail.send (Rule R1)');
  assert.ok(!content.includes('messages.send'), 'Must strictly forbid messages.send (Rule R1)');
  assert.ok(!content.includes('drafts.send'), 'Must strictly forbid drafts.send (Rule R1)');
});

test('UT-RSF-06: Cardinal Rule R7 Strict Color Blacklist Audit on Gmail & Radar Files', () => {
  const filesToCheck = [
    path.join(process.cwd(), 'src/engine/gmail-ingest.ts'),
    path.join(process.cwd(), 'src/app/api/ingest/gmail-sync/route.ts'),
    path.join(process.cwd(), 'src/app/radar/page.tsx'),
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
