import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Import clipper functions
// eslint-disable-next-line @typescript-eslint/no-var-requires
const BackdoorClipper = require('../extension/clipper.js');

// Mock DOM helper
function createMockDocument(html: string) {
  return {
    querySelector: (selector: string) => {
      // Very basic regex-based query selector for unit testing extraction
      if (selector.includes('[data-automation-id="jobPostingHeader"]')) {
        const match = html.match(/data-automation-id="jobPostingHeader"[^>]*>(.*?)<\//i);
        return match ? { textContent: match[1] } : null;
      }
      if (selector.includes('[data-automation-id="companyName"]')) {
        const match = html.match(/data-automation-id="companyName"[^>]*>(.*?)<\//i);
        return match ? { textContent: match[1] } : null;
      }
      if (selector.includes('[data-automation-id="locations"]')) {
        const match = html.match(/data-automation-id="locations"[^>]*>(.*?)<\//i);
        return match ? { textContent: match[1] } : null;
      }
      if (selector.includes('[data-automation-id="jobPostingDescription"]')) {
        const match = html.match(/data-automation-id="jobPostingDescription"[^>]*>(.*?)<\//i);
        return match ? { textContent: match[1] } : null;
      }
      if (selector.includes('job-details-jobs-unified-top-card__job-title') || selector === 'h1.job-name' || selector === '.posting-headline h2') {
        const match = html.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
        return match ? { textContent: match[1] } : null;
      }
      if (selector.includes('company-name') || selector.includes('company')) {
        const match = html.match(/class="[^"]*company[^"]*"[^>]*>(.*?)<\//i);
        return match ? { textContent: match[1] } : null;
      }
      if (selector.includes('location')) {
        const match = html.match(/class="[^"]*location[^"]*"[^>]*>(.*?)<\//i);
        return match ? { textContent: match[1] } : null;
      }
      if (selector.includes('job-details') || selector === '#content' || selector === '.section-page') {
        const match = html.match(/id="(?:job-details|content)"[^>]*>(.*?)<\//i);
        return match ? { textContent: match[1] } : null;
      }
      if (selector === 'h1' || selector === 'h2') {
        const match = html.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
        return match ? { textContent: match[1] } : null;
      }
      return null;
    },
    querySelectorAll: (selector: string) => {
      if (selector.includes('script[type="application/ld+json"]')) {
        const matches = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
        return matches.map((m) => ({ textContent: m[1] }));
      }
      return [];
    },
    title: 'Senior Product Manager at Linear - Careers',
    body: { textContent: 'Mock body text description for job posting' },
  };
}

test('UT-CLIP-01: LinkedIn DOM extractor parses job title, company, and location', () => {
  const doc = createMockDocument(`
    <h1 class="job-details-jobs-unified-top-card__job-title">Staff AI Product Manager</h1>
    <span class="job-details-jobs-unified-top-card__company-name">Stripe</span>
    <span class="location">San Francisco, CA (Hybrid)</span>
    <div id="job-details">Lead product strategy for machine learning infrastructure and developer tools.</div>
  `);

  const parsed = BackdoorClipper.extractLinkedInJob(doc);
  assert.strictEqual(parsed.title, 'Staff AI Product Manager');
  assert.strictEqual(parsed.company, 'Stripe');
  assert.strictEqual(parsed.source, 'linkedin');
});

test('UT-CLIP-02: Greenhouse ATS DOM extractor parses role details cleanly', () => {
  const doc = createMockDocument(`
    <h1 class="job-name">Lead Product Manager, Enterprise</h1>
    <span class="company-name">Figma</span>
    <span class="location">Remote - US</span>
    <div id="content">Scale Figma for large enterprise organizations with design systems and governance.</div>
  `);

  const parsed = BackdoorClipper.extractGreenhouseJob(doc);
  assert.strictEqual(parsed.title, 'Lead Product Manager, Enterprise');
  assert.strictEqual(parsed.company, 'Figma');
  assert.strictEqual(parsed.source, 'greenhouse');
});

test('UT-CLIP-03: Lever ATS DOM extractor parses role details cleanly', () => {
  const doc = createMockDocument(`
    <div class="posting-headline"><h2>Product Lead - Insights & Workflows</h2></div>
    <span class="company">Linear</span>
    <span class="location">Remote</span>
    <div class="section-page">Drive next-generation issue tracking and roadmap workflows.</div>
  `);

  const parsed = BackdoorClipper.extractLeverJob(doc);
  assert.strictEqual(parsed.title, 'Product Lead - Insights & Workflows');
  assert.strictEqual(parsed.source, 'lever');
});

test('UT-CLIP-04: Workday DOM extractor parses role details cleanly', () => {
  const doc = createMockDocument(`
    <div data-automation-id="jobPostingHeader">Principal Product Manager, Cloud Infrastructure</div>
    <div data-automation-id="companyName">Datadog</div>
    <div data-automation-id="locations">New York, NY</div>
    <div data-automation-id="jobPostingDescription">Drive cloud infrastructure monitoring and reliability features.</div>
  `);

  const parsed = BackdoorClipper.extractWorkdayJob(doc);
  assert.strictEqual(parsed.title, 'Principal Product Manager, Cloud Infrastructure');
  assert.strictEqual(parsed.company, 'Datadog');
  assert.strictEqual(parsed.source, 'workday');
});

test('UT-CLIP-05: Generic Schema.org JSON-LD extractor parses JobPosting schema', () => {
  const doc = createMockDocument(`
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "JobPosting",
      "title": "Director of Product, Platform",
      "hiringOrganization": { "@type": "Organization", "name": "Notion" },
      "jobLocation": { "@type": "Place", "address": { "addressLocality": "San Francisco" } },
      "description": "Lead the Notion platform and developer ecosystem."
    }
    </script>
  `);

  const parsed = BackdoorClipper.extractGenericJob(doc);
  assert.strictEqual(parsed.title, 'Director of Product, Platform');
  assert.strictEqual(parsed.company, 'Notion');
  assert.strictEqual(parsed.source, 'json_ld');
});

test('UT-CLIP-06: Rule R7 Color Blacklist Audit across Chrome Extension Subsystem', () => {
  const extensionFiles = [
    path.join(process.cwd(), 'extension/clipper.js'),
    path.join(process.cwd(), 'extension/popup.html'),
    path.join(process.cwd(), 'extension/popup.js'),
    path.join(process.cwd(), 'extension/audio-capture.js'),
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

  for (const file of extensionFiles) {
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
