import test from 'node:test';
import assert from 'node:assert';
import {
  normalizeWorkplace,
  normalizeLocation,
  normalizeSalary,
  generateFunctionalDoors,
  ingestSingleJob,
  ingestBatchJobs,
  resetUnifiedCatalogStore,
} from '../src/engine/ingestion-service';
import { CandidateTrack } from '../src/engine/scorer';

test('UT-INGEST-SRV-01: Standardized workplace normalizer', () => {
  assert.strictEqual(normalizeWorkplace('Remote, US'), 'remote');
  assert.strictEqual(normalizeWorkplace('Distributed Team'), 'remote');
  assert.strictEqual(normalizeWorkplace('San Francisco, CA (Hybrid)'), 'hybrid');
  assert.strictEqual(normalizeWorkplace('New York, NY'), 'onsite');
  assert.strictEqual(normalizeWorkplace(undefined, 'REMOTE'), 'remote');
});

test('UT-INGEST-SRV-02: Location normalizer tags US metros cleanly', () => {
  assert.strictEqual(normalizeLocation('San Francisco, CA'), 'San Francisco, CA (US)');
  assert.strictEqual(normalizeLocation('Austin, TX'), 'Austin, TX (US)');
  assert.strictEqual(normalizeLocation('London, UK'), 'London, UK');
  assert.strictEqual(normalizeLocation(''), 'Remote (Global)');
});

test('UT-INGEST-SRV-03: Salary normalizer provides tiered defaults based on seniority', () => {
  // Existing salary is preserved
  assert.strictEqual(normalizeSalary('$190,000 - $250,000', 'Staff Engineer'), '$190,000 - $250,000');

  // Tiered defaults when salary is missing
  assert.strictEqual(normalizeSalary(undefined, 'Staff Infrastructure Engineer'), '$200,000 - $280,000 + Equity');
  assert.strictEqual(normalizeSalary('', 'Senior Product Designer'), '$170,000 - $230,000 + Equity');
  assert.strictEqual(normalizeSalary(undefined, 'Junior Analyst'), '$140,000 - $190,000 + Equity');
});

test('UT-INGEST-SRV-04: generateFunctionalDoors adapts to Engineering, Design, Data, Product, and General domains', () => {
  // 1. Engineering
  const engDoors = generateFunctionalDoors('Acme Corp', 'Staff Backend Engineer');
  assert.ok(engDoors.door1.title.includes('Engineering'));
  assert.ok(engDoors.door2.title.includes('Technical Recruiter'));
  assert.ok(engDoors.door3.title.includes('Engineering Peer'));

  // 2. Design
  const designDoors = generateFunctionalDoors('Figma Labs', 'Lead Product Designer');
  assert.ok(designDoors.door1.title.includes('Design'));
  assert.ok(designDoors.door2.title.includes('Design Recruiter'));
  assert.ok(designDoors.door3.title.includes('Design Peer'));

  // 3. Data & AI
  const dataDoors = generateFunctionalDoors('Scale AI', 'Principal Data Scientist');
  assert.ok(dataDoors.door1.title.includes('AI') || dataDoors.door1.title.includes('Data'));
  assert.ok(dataDoors.door2.title.includes('Technical Recruiter'));
  assert.ok(dataDoors.door3.title.includes('AI Peer'));

  // 4. Product
  const prodDoors = generateFunctionalDoors('Linear', 'Senior Product Manager');
  assert.ok(prodDoors.door1.title.includes('Product'));
  assert.ok(prodDoors.door2.title.includes('Talent'));
  assert.ok(prodDoors.door3.title.includes('Product Peer'));

  // 5. General Fallback
  const genDoors = generateFunctionalDoors('Omni', 'Director of Operations');
  assert.ok(genDoors.door1.title.includes('Executive'));
  assert.ok(genDoors.door2.title.includes('Talent'));
  assert.ok(genDoors.door3.title.includes('Domain Peer'));
});

test('UT-INGEST-SRV-05: ingestSingleJob evaluates role-agnostic suitability and deduplicates', () => {
  resetUnifiedCatalogStore();

  const engTrack: CandidateTrack = {
    name: 'Staff Engineering Track',
    targetTitles: ['Staff Software Engineer', 'Senior Software Engineer', 'Lead Architect'],
    skills: ['typescript', 'distributed systems', 'system architecture', 'postgresql', 'go'],
    seniorityLevels: ['staff', 'senior', 'lead'],
    workCountries: ['us', 'remote'],
    excludedIndustries: ['crypto'],
    baselineExperienceYears: 5,
  };

  const { isDuplicate: dup1, job: job1 } = ingestSingleJob(
    {
      company: 'Datadog',
      title: 'Staff Software Engineer',
      location: 'New York, NY',
      description: 'Lead distributed systems architecture, postgresql optimization, and go microservices.',
    },
    engTrack
  );

  assert.strictEqual(dup1, false);
  assert.strictEqual(job1.company, 'Datadog');
  assert.ok(job1.fitScore >= 70);
  assert.strictEqual(job1.track, 'Staff Engineering Track');
  assert.ok(job1.door1.title.includes('Engineering'));

  // Second ingestion with duplicate company and title merges
  const { isDuplicate: dup2, job: job2 } = ingestSingleJob(
    {
      company: 'Datadog, Inc.',
      title: 'Staff Software Engineer',
      location: 'Remote (US)',
      description: 'Distributed systems architecture.',
    },
    engTrack
  );

  assert.strictEqual(dup2, true);
  assert.strictEqual(job2.id, job1.id);
  assert.ok(job2.location.includes('Remote (US)'));
});

test('UT-INGEST-SRV-06: ingestBatchJobs processes batch items with imported & deduplicated counts', () => {
  resetUnifiedCatalogStore();

  const batch = [
    { company: 'Stripe', title: 'Staff Systems Engineer', location: 'Remote' },
    { company: 'Stripe', title: 'Staff Systems Engineer', location: 'Seattle, WA' }, // Duplicate
    { company: 'Linear', title: 'Product Designer', location: 'Remote' },
  ];

  const result = ingestBatchJobs(batch);
  assert.strictEqual(result.success, true);
  assert.strictEqual(result.total, 3);
  assert.strictEqual(result.imported, 2);
  assert.strictEqual(result.deduplicated, 1);
  assert.strictEqual(result.jobs.length, 3);
});
