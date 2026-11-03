import test from 'node:test';
import assert from 'node:assert';
import {
  parseHnJobTitle,
  fetchVentureHnJobs,
  SEED_VENTURE_HN_JOBS,
} from '../src/engine/venture-hn-crawler';

test('UT-HN-01: parseHnJobTitle handles standard Hacker News /jobs patterns', () => {
  // Pattern 1: Company (YC Batch) Is Hiring Role in Location
  const parsed1 = parseHnJobTitle('Sava Trust (YC F25) Is Hiring a Founding Engineer in NYC');
  assert.strictEqual(parsed1.company, 'Sava Trust');
  assert.strictEqual(parsed1.title, 'Founding Engineer');
  assert.strictEqual(parsed1.location, 'NYC');

  // Pattern 2: Without batch tag
  const parsed2 = parseHnJobTitle('Wasmer Is Hiring OS/Hypervisor Experts in Europe');
  assert.strictEqual(parsed2.company, 'Wasmer');
  assert.strictEqual(parsed2.title, 'OS/Hypervisor Experts');
  assert.strictEqual(parsed2.location, 'Europe');

  // Pattern 3: Pipe delimiter
  const parsed3 = parseHnJobTitle('Retool | Staff Systems Engineer | San Francisco, CA');
  assert.strictEqual(parsed3.company, 'Retool');
  assert.strictEqual(parsed3.title, 'Staff Systems Engineer');
  assert.strictEqual(parsed3.location, 'San Francisco, CA');
});

test('UT-HN-02: SEED_VENTURE_HN_JOBS contains official /jobs and October (49922569) & November threads', () => {
  // Official HN Jobs board
  const jobsBoardRoles = SEED_VENTURE_HN_JOBS.filter((j) => j.source === 'hacker_news_jobs');
  assert.ok(jobsBoardRoles.length >= 2, 'Must include jobs from news.ycombinator.com/jobs');
  assert.ok(jobsBoardRoles.some((j) => j.applyUrl?.includes('news.ycombinator.com/jobs')));

  // October 2026 Who is hiring thread (id=49922569)
  const octThreadRoles = SEED_VENTURE_HN_JOBS.filter((j) => j.applyUrl?.includes('item?id=49922569'));
  assert.ok(octThreadRoles.length >= 2, 'Must include roles from October 2026 thread id=49922569');

  // November 2026 Who is hiring thread (id=50338728)
  const novThreadRoles = SEED_VENTURE_HN_JOBS.filter((j) => j.applyUrl?.includes('item?id=50338728'));
  assert.ok(novThreadRoles.length >= 2, 'Must include roles from November 2026 thread id=50338728');
});

test('UT-HN-03: fetchVentureHnJobs returns deduplicated roles with functional doors', async () => {
  const jobs = await fetchVentureHnJobs();
  assert.ok(jobs.length >= 8);

  // Every job must have functional 3-door structure
  for (const j of jobs) {
    assert.ok(j.door1?.title && j.door1.title.length > 0);
    assert.ok(j.door2?.title && j.door2.title.length > 0);
    assert.ok(j.door3?.title && j.door3.title.length > 0);
  }

  // Ensure no duplicate company:title pairs
  const keys = jobs.map((j) => `${j.company.toLowerCase()}:${j.title.toLowerCase()}`);
  const uniqueKeys = new Set(keys);
  assert.strictEqual(keys.length, uniqueKeys.size, 'All returned jobs must be deduplicated');
});
