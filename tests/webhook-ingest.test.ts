import test from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { GET, POST } from '../src/app/api/ingest/webhook/route';
import { clearWebhookIngestedJobs } from '../src/engine/webhook-ingest';

test('UT-WH-01: GET /api/ingest/webhook returns active status and Browse.ai instructions', async () => {
  const req = new NextRequest('http://localhost:3001/api/ingest/webhook');
  const res = await GET(req);
  const data = await res.json();

  assert.strictEqual(data.status, 'ACTIVE');
  assert.ok(data.webhookUrl.includes('/api/ingest/webhook'));
  assert.ok(data.supportedPlatforms.includes('Browse.ai'));
  assert.ok(data.browseAiInstructions.step1.includes('Browse.ai'));
});

test('UT-WH-02: POST /api/ingest/webhook handles handshake verification', async () => {
  const req = new NextRequest('http://localhost:3001/api/ingest/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ event: 'test', challenge: 'test-challenge-123' })
  });
  const res = await POST(req);
  const data = await res.json();

  assert.strictEqual(data.success, true);
  assert.strictEqual(data.challenge, 'test-challenge-123');
});

test('UT-WH-03: POST /api/ingest/webhook ingests Browse.ai capturedLists payload', async () => {
  clearWebhookIngestedJobs();

  const browseAiPayload = {
    event: 'task.finished',
    task: {
      id: 'task-browse-101',
      status: 'successful',
      capturedLists: {
        job_postings: [
          {
            'Job Title': 'Founding AI Product Manager',
            'Company': 'Scale AI',
            'Job URL': 'https://www.workatastartup.com/companies/scale-ai',
            'Location': 'San Francisco, CA (US)',
            'Salary': '$210,000 - $290,000'
          },
          {
            'Job Title': 'Lead Product Manager, Workflows',
            'Company': 'Vellum AI',
            'Job URL': 'https://www.workatastartup.com/companies/vellum',
            'Location': 'Remote (Global)',
            'Salary': '$170,000 - $220,000'
          }
        ]
      }
    }
  };

  const req = new NextRequest('http://localhost:3001/api/ingest/webhook?source=yc_startup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(browseAiPayload)
  });

  const res = await POST(req);
  const data = await res.json();

  assert.strictEqual(data.success, true);
  assert.strictEqual(data.count, 2);
  assert.strictEqual(data.source, 'yc_startup');
  assert.ok(data.jobs[0].fitScore > 0);
  assert.ok(data.jobs.some((j: any) => j.company === 'Scale AI'));

  clearWebhookIngestedJobs();
});
