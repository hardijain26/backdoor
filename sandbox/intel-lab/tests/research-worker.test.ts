import test from 'node:test';
import assert from 'node:assert';
import {
  startAsyncResearchJob,
  getResearchJobStatus,
  findActiveJobByTarget,
} from '../src/engine/research-queue';

test('SCR-T11-01: Asynchronous research worker starts job and returns 202-ready payload immediately', async () => {
  const job = await startAsyncResearchJob({
    jobId: 'job-test-queue-1',
    companyId: 'comp-test-queue-1',
    companyName: 'Acme Queue Corp',
    roleTitle: 'Staff PM',
  });

  assert.ok(job.researchJobId.startsWith('res-job-'), 'Must have generated researchJobId');
  assert.strictEqual(job.companyName, 'Acme Queue Corp');
  assert.ok(['QUEUED', 'IN_PROGRESS', 'COMPLETED'].includes(job.status), 'Must be in valid lifecycle status');
  assert.ok(job.progressPct >= 5, 'Progress must be initialized');

  // Verify status lookup works
  const retrieved = getResearchJobStatus(job.researchJobId);
  assert.ok(retrieved !== null, 'Job must be retrievable by researchJobId');
  assert.strictEqual(retrieved?.researchJobId, job.researchJobId);
});

test('SCR-T11-02: Mutex prevents duplicate concurrent research crawls for same company/job', async () => {
  const job1 = await startAsyncResearchJob({
    jobId: 'job-test-mutex-1',
    companyId: 'comp-test-mutex-1',
    companyName: 'Linear Mutex',
    roleTitle: 'Lead Product Manager',
  });

  const job2 = await startAsyncResearchJob({
    jobId: 'job-test-mutex-1',
    companyId: 'comp-test-mutex-1',
    companyName: 'Linear Mutex',
    roleTitle: 'Lead Product Manager',
  });

  // Second invocation must return the same active/completed job instance
  assert.strictEqual(job1.researchJobId, job2.researchJobId, 'Must return identical researchJobId for concurrent call');
});

