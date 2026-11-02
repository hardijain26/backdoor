/**
 * Test Suite: tests/role-classifier.test.ts
 * Verifies SCR-T01: Role & Product-Line Scoping Engine
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  classifyArchetype,
  extractScopedProduct,
  buildScopedReviewQueries,
} from '../src/engine/role-classifier';
import { ARCHETYPE_PROFILES } from '../src/types/archetypes';

test('SCR-T01-01: Correctly classifies all 11 archetypes', () => {
  const testCases = [
    { title: 'Senior Product Manager', expected: 'PRODUCT_MANAGEMENT' },
    { title: 'VP of Product Management', expected: 'PRODUCT_MANAGEMENT' },
    { title: 'Group PM - Monetization', expected: 'PRODUCT_MANAGEMENT' },
    { title: 'Product Design Lead', expected: 'PRODUCT_DESIGN' },
    { title: 'Senior UX Researcher', expected: 'PRODUCT_DESIGN' },
    { title: 'Lead Software Engineer', expected: 'ENGINEERING_TECH' },
    { title: 'Staff DevOps & SRE Architect', expected: 'ENGINEERING_TECH' },
    { title: 'VP of Finance & FP&A', expected: 'FINANCE_ACCOUNTING' },
    { title: 'Chief Financial Officer', expected: 'FINANCE_ACCOUNTING' },
    { title: 'Director of Corporate Strategy & BizOps', expected: 'CORPORATE_STRATEGY_BIZOPS' },
    { title: 'Chief of Staff to CEO', expected: 'FOUNDER_OFFICE' },
    { title: 'Founder & CEO', expected: 'FOUNDER_OFFICE' },
    { title: 'Enterprise Account Executive (AE)', expected: 'SALES_GTM' },
    { title: 'Head of Demand Generation & Growth', expected: 'MARKETING_GROWTH' },
    { title: 'Senior Customer Success Manager (CSM)', expected: 'OPERATIONS_CS' },
    { title: 'General Counsel & VP Compliance', expected: 'LEGAL_COMPLIANCE' },
    { title: 'Head of Talent Acquisition & HRBP', expected: 'PEOPLE_TALENT' },
  ];

  for (const { title, expected } of testCases) {
    const result = classifyArchetype(title);
    assert.strictEqual(
      result,
      expected,
      `Expected "${title}" to classify as ${expected}, got ${result}`
    );
  }
});

test('SCR-T01-02: Archetype profiles contain valid vocabulary tokens and business currencies', () => {
  const archetypes = Object.keys(ARCHETYPE_PROFILES) as (keyof typeof ARCHETYPE_PROFILES)[];
  assert.strictEqual(archetypes.length, 11, 'Must define exactly 11 functional archetypes');

  for (const key of archetypes) {
    const profile = ARCHETYPE_PROFILES[key];
    assert.strictEqual(profile.name, key);
    assert.ok(profile.departmentName.length > 3, 'departmentName required');
    assert.ok(profile.businessCurrency.length > 5, 'businessCurrency required');
    assert.ok(profile.vocabularyTokens.length >= 5, 'vocabularyTokens must have >= 5 entries');
    assert.ok(profile.coreFailureModes.length >= 3, 'coreFailureModes must have >= 3 entries');
    assert.ok(profile.velocityTrackFocus.length > 10, 'velocityTrackFocus required');
    assert.ok(profile.scalabilityTrackFocus.length > 10, 'scalabilityTrackFocus required');
  }
});

test('SCR-T01-03: Product-line scoping extracts distinct business entities', () => {
  // Test cases with delimiters
  assert.strictEqual(
    extractScopedProduct('Uber', 'Staff Product Manager - Uber Freight'),
    'Uber Freight'
  );

  assert.strictEqual(
    extractScopedProduct('HubSpot', 'Senior Product Manager - Service Hub'),
    'HubSpot Service Hub'
  );

  assert.strictEqual(
    extractScopedProduct('Amazon', 'Lead PM, AWS Bedrock'),
    'Amazon AWS Bedrock'
  );

  assert.strictEqual(
    extractScopedProduct('Google', 'Product Manager (YouTube Shorts)'),
    'Google YouTube Shorts'
  );

  // Test case with description division keyword
  assert.strictEqual(
    extractScopedProduct('Stripe', 'Senior Product Manager', 'Business Unit: Stripe Connect marketplace payments'),
    'Stripe Connect marketplace payments'
  );

  // Test fallback to company name when title is generic
  assert.strictEqual(
    extractScopedProduct('Airbnb', 'Product Manager'),
    'Airbnb'
  );

  // Test location filtering (does not extract "Remote" or "US" as a product)
  assert.strictEqual(
    extractScopedProduct('Datadog', 'Staff Software Engineer - Remote'),
    'Datadog'
  );
});

test('SCR-T01-04: Review query builder generates scoped queries and sanitized slugs', () => {
  const queries = buildScopedReviewQueries('Uber', 'Uber Freight');
  assert.strictEqual(queries.targetEntity, 'Uber Freight');
  assert.strictEqual(queries.sanitizedSlug, 'uberfreight');
  assert.match(queries.reddit, /"Uber Freight"/);
  assert.match(queries.g2, /uberfreight/);
  assert.match(queries.capterra, /uberfreight/);
  assert.match(queries.pissedConsumer, /"Uber Freight"/);

  const fallbackQueries = buildScopedReviewQueries('Stripe');
  assert.strictEqual(fallbackQueries.targetEntity, 'Stripe');
  assert.strictEqual(fallbackQueries.sanitizedSlug, 'stripe');
  assert.match(fallbackQueries.reddit, /"Stripe"/);
});
