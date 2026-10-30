import test from 'node:test';
import assert from 'node:assert';
import { extractJobMetadataFromHtml, extractJobFromRawText } from '../src/engine/safe-fetch';
import { isSafeUrl } from '../src/engine/scraper';
import { generateDedupMatchKey } from '../src/engine/dedup';
import { evaluateJobSuitability } from '../src/engine/scorer';

// Test Suite for S3-T02: Universal Ingest & Deduplication Engine (Runbook §4.4)

test('UT-INGEST-01: SSRF Safe URL Validator (Rule R6)', () => {
  // Dangerous / loopback / metadata URLs that must be blocked
  const unsafeUrls = [
    'http://localhost:3000/api',
    'http://127.0.0.1:8080',
    'http://::1/admin',
    'http://169.254.169.254/latest/meta-data',
    'http://10.0.0.1/private',
    'http://172.16.0.1/internal',
    'http://192.168.1.1/router',
    'ftp://example.com/job',
    'file:///etc/passwd'
  ];

  for (const url of unsafeUrls) {
    assert.strictEqual(
      isSafeUrl(url),
      false,
      `Rule R6 SSRF Violation: Expected unsafe URL "${url}" to be blocked`
    );
  }

  // Safe external URLs that must be permitted
  const safeUrls = [
    'https://boards.greenhouse.io/stripe/jobs/12345',
    'https://jobs.lever.co/linear/67890',
    'https://jobs.ashbyhq.com/openai/pm-systems',
    'https://workable.com/j/ABC123XYZ'
  ];

  for (const url of safeUrls) {
    assert.strictEqual(
      isSafeUrl(url),
      true,
      `Expected legitimate job URL "${url}" to be accepted`
    );
  }
});

test('UT-INGEST-02: JSON-LD Schema Metadata Extractor', () => {
  const sampleHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Senior Product Manager at Linear</title>
        <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "JobPosting",
          "title": "Senior Product Manager, Workflows",
          "hiringOrganization": {
            "@type": "Organization",
            "name": "Linear"
          },
          "jobLocation": {
            "@type": "Place",
            "address": {
              "addressLocality": "Remote (US/EU)"
            }
          },
          "baseSalary": {
            "@type": "MonetaryAmount",
            "currency": "USD",
            "value": {
              "value": "195000"
            }
          },
          "description": "<p>Lead core workflow product strategy and execution.</p>"
        }
        </script>
      </head>
      <body>Job Content</body>
    </html>
  `;

  const metadata = extractJobMetadataFromHtml(sampleHtml, 'https://jobs.ashbyhq.com/linear/123');

  assert.strictEqual(metadata.title, 'Senior Product Manager, Workflows');
  assert.strictEqual(metadata.company, 'Linear');
  assert.strictEqual(metadata.location, 'Remote (US/EU)');
  assert.ok(metadata.salary?.includes('195000'));
  assert.ok(metadata.description.includes('workflow product strategy'));
  assert.strictEqual(metadata.source, 'ashby');
});

test('UT-INGEST-03: OpenGraph & Title Tag Fallback Extractor', () => {
  const sampleOgHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="og:title" content="Staff AI PM - Anthropic" />
        <meta property="og:description" content="Build transformative frontier AI capabilities." />
      </head>
      <body>No JSON-LD present</body>
    </html>
  `;

  const metadata = extractJobMetadataFromHtml(sampleOgHtml, 'https://anthropic.com/careers/pm');
  assert.strictEqual(metadata.title, 'Staff AI PM - Anthropic');
  assert.strictEqual(metadata.company, 'Anthropic');
  assert.ok(metadata.description.includes('transformative frontier AI'));
});

test('UT-INGEST-04: Raw Text Message Parser (Slack / Twitter / Email)', () => {
  const rawSnippet = `
    Excited to announce we are hiring a Staff Product Manager at Figma!
    Location: Remote (US)
    Compensation: $210,000 - $250,000
    Link: https://jobs.lever.co/figma/staff-pm
    Help us build the next decade of collaborative creative tools.
  `;

  const extracted = extractJobFromRawText(rawSnippet);
  assert.strictEqual(extracted.title, 'Staff Product Manager');
  assert.strictEqual(extracted.company, 'Figma');
  assert.ok(extracted.location.includes('Remote'));
  assert.ok(extracted.salary?.includes('$210,000'));
  assert.strictEqual(extracted.applyUrl, 'https://jobs.lever.co/figma/staff-pm');
});

test('UT-INGEST-05: Deduplication Collision Detection (UT-DB-04)', () => {
  const key1 = generateDedupMatchKey('Linear', 'Senior Product Manager, Workflows');
  const key2 = generateDedupMatchKey('Linear, Inc.', 'Sr. PM Workflows');

  // Both should normalize cleanly to matching canonical tokens
  assert.ok(key1.includes('linear'));
  assert.ok(key2.includes('linear'));
  assert.ok(key1.includes('product_manager'));
  assert.ok(key2.includes('product_manager'));
});

test('UT-INGEST-06: Scoring Pipeline on Ingested Role', () => {
  const job = {
    title: 'Lead Product Manager',
    company: 'OpenAI',
    locations: ['Remote (US)'],
    descriptionText: 'Own product strategy and roadmapping for AI/ML platform, driving cross-functional leadership, user research, and analytics with SQL.'
  };

  const evalResult = evaluateJobSuitability(job);
  assert.strictEqual(evalResult.tier1Passed, true, 'Lead PM at OpenAI in US must pass Tier 1 eligibility');
  assert.ok(evalResult.fitScore >= 70, `Fit score should be >= 70% (computed: ${evalResult.fitScore})`);
});
