import test from 'node:test';
import assert from 'node:assert';
import {
  getCompanyResearch,
  setCompanyResearchCache,
  clearCompanyResearchCache,
  slugifyCompanyName,
  isCacheValid,
  CompanyResearchIntel,
} from '../src/engine/company-research';

test('UT-INTEL-01: slugifyCompanyName handles corporate suffixes and whitespace', () => {
  assert.strictEqual(slugifyCompanyName('Stripe, Inc.'), 'stripe');
  assert.strictEqual(slugifyCompanyName('Linear Corp'), 'linear');
  assert.strictEqual(slugifyCompanyName('Perplexity AI'), 'perplexity-ai');
});

test('UT-INTEL-02: Returns curated intelligence with 3 verifiable conversation hooks', () => {
  clearCompanyResearchCache();
  const intel = getCompanyResearch('Stripe');

  assert.strictEqual(intel.companySlug, 'stripe');
  assert.strictEqual(intel.companyName, 'Stripe');
  assert.ok(intel.fundingStage.includes('Late Stage') || intel.fundingStage.includes('Pre-IPO'));
  assert.ok(intel.techStack.length >= 3);
  assert.ok(intel.conversationHooks.productHook.length > 10);
  assert.ok(intel.conversationHooks.growthHook.length > 10);
  assert.ok(intel.conversationHooks.teamHook.length > 10);
  assert.strictEqual(intel.fromCache, false);
});

test('UT-INTEL-03: 30-Day Cache serves cached record on subsequent calls', () => {
  clearCompanyResearchCache();
  // First call: generates or retrieves and stores in cache
  const first = getCompanyResearch('Linear');
  assert.strictEqual(first.fromCache, false);

  // Second call: must hit cache
  const second = getCompanyResearch('Linear');
  assert.strictEqual(second.fromCache, true);
  assert.strictEqual(second.companySlug, first.companySlug);
  assert.strictEqual(isCacheValid(second), true);
});

test('UT-INTEL-04: Deterministic fallback for unlisted companies creates valid research object', () => {
  const intel = getCompanyResearch('Acme Aerospace Robotics');

  assert.strictEqual(intel.companySlug, 'acme-aerospace-robotics');
  assert.ok(intel.fundingStage.length > 0);
  assert.ok(intel.conversationHooks.productHook.includes('Acme Aerospace Robotics'));
  assert.ok(intel.sources.website?.url.includes('acme-aerospace-robotics.com'));
});
