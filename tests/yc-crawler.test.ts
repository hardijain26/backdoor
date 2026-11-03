import test from 'node:test';
import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { GET, POST } from '../src/app/api/ingest/yc/route';
import { fetchYcStartupJobs } from '../src/engine/yc-crawler';

const MOCK_COMPANIES = [
  {
    s: 'amplitude',
    n: 'Amplitude',
    u: 'https://amplitude.com',
    t: 'Product Analytics & Digital Optimisation',
    d: 'Amplitude is the pioneer in digital optimization software.',
    e: '500-1000',
    l: 'San Francisco, CA; Remote',
    i: ['Analytics', 'SaaS', 'B2B'],
    b: ['YC W12', 'Growth']
  },
  {
    s: 'acme-robotics',
    n: 'Acme Robotics',
    u: 'https://acme.io',
    t: 'Autonomous Fleet Management',
    d: 'Building intelligent mobile robots.',
    e: '11-50',
    l: 'Remote',
    i: ['Robotics', 'AI'],
    b: ['YC W24']
  }
];

const MOCK_JOBS_DATA = {
  updated: 1793683250451,
  bySlug: {
    amplitude: [
      {
        id: 101,
        t: 'Principal Product Manager, AI Agents',
        u: '/companies/amplitude/jobs/101-principal-pm',
        loc: 'San Francisco, CA',
        type: 'Full-time',
        role: 'product',
        sal: '$220K - $350K',
        eq: '0.1%',
        exp: '5+ years'
      },
      {
        id: 102,
        t: 'Backend Software Engineer',
        u: '/companies/amplitude/jobs/102-backend-eng',
        loc: 'San Francisco, CA',
        type: 'Full-time',
        role: 'eng',
        sal: '$180K - $240K'
      }
    ],
    'acme-robotics': [
      {
        id: 201,
        t: 'Head of Product',
        u: '/companies/acme-robotics/jobs/201-head-of-product',
        loc: 'Remote (US)',
        type: 'Full-time',
        role: 'product',
        sal: '',
        eq: '1.5%',
        exp: '4+ years'
      }
    ]
  }
};

// Global mock for sandboxed offline testing
const originalFetch = global.fetch;
function setupMockFetch() {
  global.fetch = async (input: RequestInfo | URL) => {
    const url = input.toString();
    if (url.includes('companies.json')) {
      return {
        ok: true,
        status: 200,
        json: async () => MOCK_COMPANIES
      } as any;
    }
    if (url.includes('jobs.json')) {
      return {
        ok: true,
        status: 200,
        json: async () => MOCK_JOBS_DATA
      } as any;
    }
    return originalFetch(input);
  };
}

test('UT-YC-01: Autonomous crawler fetches and parses YC Product roles', async () => {
  setupMockFetch();
  try {
    const jobs = await fetchYcStartupJobs({ forceRefresh: true });

    // Should only extract Product roles (Principal PM and Head of Product), omitting Backend Engineer
    assert.strictEqual(jobs.length, 2);

    const amplitudePm = jobs.find((j) => j.company === 'Amplitude');
    assert.ok(amplitudePm);
    assert.strictEqual(amplitudePm.title, 'Principal Product Manager, AI Agents');
    assert.strictEqual(amplitudePm.source, 'yc_startup');
    assert.ok(amplitudePm.salary?.includes('$220K - $350K'));
    assert.ok(amplitudePm.salary?.includes('0.1% Equity'));
    assert.strictEqual(amplitudePm.door1?.title, 'Co-Founder & CEO (YC W12)');
    assert.ok(amplitudePm.fitScore >= 70);

    const acmeHop = jobs.find((j) => j.company === 'Acme Robotics');
    assert.ok(acmeHop);
    assert.strictEqual(acmeHop.workplace, 'remote');
    assert.ok(acmeHop.salary?.includes('$140,000 - $210,000'));
    assert.ok(acmeHop.salary?.includes('1.5% Equity'));
    assert.ok(acmeHop.fitScore >= 70);
  } finally {
    global.fetch = originalFetch;
  }
});

test('UT-YC-02: GET and POST /api/ingest/yc HTTP endpoints return structured YC roles', async () => {
  setupMockFetch();
  try {
    const reqGet = new NextRequest('http://localhost:3001/api/ingest/yc');
    const resGet = await GET(reqGet);
    const dataGet = await resGet.json();

    assert.strictEqual(resGet.status, 200);
    assert.strictEqual(dataGet.success, true);
    assert.strictEqual(dataGet.source, 'yc_startup');
    assert.ok(Array.isArray(dataGet.jobs));
    assert.strictEqual(dataGet.jobs.length, 2);

    const reqPost = new NextRequest('http://localhost:3001/api/ingest/yc', { method: 'POST' });
    const resPost = await POST(reqPost);
    const dataPost = await resPost.json();

    assert.strictEqual(resPost.status, 200);
    assert.strictEqual(dataPost.success, true);
    assert.strictEqual(dataPost.count, 2);
  } finally {
    global.fetch = originalFetch;
  }
});
