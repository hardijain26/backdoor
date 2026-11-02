import test from 'node:test';
import assert from 'node:assert';
import { getCrawlWindow } from '../../src/engine/scraper';

test('Crawl Window Logic: First-time user vs Daily incremental crawl', () => {
  // 1. First-time user (isFirstTimeUser: true or lastCrawledAt is null)
  const firstTimeConfig = getCrawlWindow(true, null);
  assert.strictEqual(firstTimeConfig.isFirstTimeUser, true);
  assert.strictEqual(firstTimeConfig.lookbackDays, 15, 'First-time user must look back 15 days');
  assert.strictEqual(firstTimeConfig.lookbackHours, 360, '15 days must equal 360 hours');
  
  const fifteenDaysExpected = Date.now() - 15 * 24 * 60 * 60 * 1000;
  assert.ok(
    Math.abs(firstTimeConfig.sinceTimestamp.getTime() - fifteenDaysExpected) < 5000,
    'sinceTimestamp should be ~15 days ago'
  );

  // 2. Subsequent daily crawler (e.g., last crawled 12 hours ago)
  const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
  const dailyConfig = getCrawlWindow(false, twelveHoursAgo);
  assert.strictEqual(dailyConfig.isFirstTimeUser, false);
  assert.strictEqual(dailyConfig.lookbackDays, 1, 'Daily crawl should be 1 day lookback');
  assert.strictEqual(dailyConfig.lookbackHours, 12, 'Lookback hours should match delta since last crawl');

  // 3. Daily crawler after 24h interval
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const daily24hConfig = getCrawlWindow(false, oneDayAgo);
  assert.strictEqual(daily24hConfig.isFirstTimeUser, false);
  assert.strictEqual(daily24hConfig.lookbackHours, 24);
});

test('Radar State Management: Active, Skipped, Restore and Continuous Match Score Sorting', () => {
  interface MockJob {
    id: string;
    company: string;
    title: string;
    fitScore: number;
    stage: 'DISCOVERED' | 'CHOSEN' | 'SKIPPED';
    postedHoursAgo: number;
  }

  const jobs: MockJob[] = [
    { id: 'job-1', company: 'Stripe', title: 'Staff PM', fitScore: 94, stage: 'DISCOVERED', postedHoursAgo: 2 },
    { id: 'job-2', company: 'Linear', title: 'Lead PM', fitScore: 88, stage: 'DISCOVERED', postedHoursAgo: 4 },
    { id: 'job-3', company: 'GitHub', title: 'Principal PM', fitScore: 91, stage: 'DISCOVERED', postedHoursAgo: 48 }, // 2 days ago
    { id: 'job-4', company: 'Retool', title: 'Senior PM', fitScore: 78, stage: 'DISCOVERED', postedHoursAgo: 240 }  // 10 days ago
  ];

  // 1. Filter by 24h vs 15-day backfill
  const in24h = jobs.filter((j) => j.postedHoursAgo <= 24);
  assert.strictEqual(in24h.length, 2, '24h crawl should only include roles within 24h');

  const in15d = jobs.filter((j) => j.postedHoursAgo <= 360);
  assert.strictEqual(in15d.length, 4, '15-day backfill should include all 4 roles');

  // 2. Score ranking order: highest match score first
  const sorted = [...in15d].sort((a, b) => b.fitScore - a.fitScore);
  assert.deepStrictEqual(
    sorted.map((j) => j.id),
    ['job-1', 'job-3', 'job-2', 'job-4'],
    'Roles must be sorted descending by fit score (94, 91, 88, 78)'
  );

  // 3. Skip a high-match role (e.g. Stripe job-1)
  let updatedJobs = in15d.map((j) => (j.id === 'job-1' ? { ...j, stage: 'SKIPPED' as const } : j));
  
  // Active view: skips should be omitted and next highest score immediately surfaces
  const activeRoles = updatedJobs
    .filter((j) => j.stage !== 'SKIPPED')
    .sort((a, b) => b.fitScore - a.fitScore);
  assert.strictEqual(activeRoles.length, 3);
  assert.strictEqual(activeRoles[0].id, 'job-3', 'When top role is skipped, next highest (job-3 @ 91%) must take top position');

  // Skipped view: contains job-1
  const skippedRoles = updatedJobs.filter((j) => j.stage === 'SKIPPED');
  assert.strictEqual(skippedRoles.length, 1);
  assert.strictEqual(skippedRoles[0].id, 'job-1');

  // 4. Restore role: Unskip action
  const restoredJobs = updatedJobs.map((j) => (j.id === 'job-1' ? { ...j, stage: 'DISCOVERED' as const } : j));
  const activeAfterRestore = restoredJobs.filter((j) => j.stage !== 'SKIPPED');
  assert.strictEqual(activeAfterRestore.length, 4, 'Restoring job-1 must bring active count back to 4');
  assert.strictEqual(restoredJobs.find((j) => j.id === 'job-1')?.stage, 'DISCOVERED');
});

