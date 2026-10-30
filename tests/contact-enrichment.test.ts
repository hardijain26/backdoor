import test from 'node:test';
import assert from 'node:assert';
import {
  classifyContactDoor,
  calculateConfidenceScore,
  enrichCompanyContacts,
  validateContactPrivacy,
  EnrichedContact
} from '../src/engine/contact-enrichment';

// Test Suite for S3-T03: Backdoor Contact Discovery & Multi-Provider Enrichment (Runbook §5.6)

test('UT-ENRICH-01: Door Classification Engine (Door 1, Door 2, Door 3)', () => {
  // Door 1: Decision Maker / Hiring Authority
  const door1Titles = [
    'VP of Product',
    'Vice President, Product Management',
    'Head of Product',
    'Chief Product Officer',
    'CPO',
    'Director of Product',
    'Director of PM',
    'Co-Founder & CEO'
  ];
  for (const title of door1Titles) {
    assert.strictEqual(
      classifyContactDoor(title),
      'DOOR_1',
      `Expected "${title}" to be classified as DOOR_1`
    );
  }

  // Door 2: Recruiter / Talent Acquisition
  const door2Titles = [
    'Lead Technical Recruiter',
    'Senior Product Recruiter',
    'Head of Talent',
    'Principal Talent Partner',
    'Technical Sourcer',
    'People Ops Lead'
  ];
  for (const title of door2Titles) {
    assert.strictEqual(
      classifyContactDoor(title),
      'DOOR_2',
      `Expected "${title}" to be classified as DOOR_2`
    );
  }

  // Door 3: Peer / Staff PM
  const door3Titles = [
    'Staff Product Manager',
    'Senior Product Manager',
    'Principal Product Manager',
    'Lead PM, Core Workflows',
    'Product Lead'
  ];
  for (const title of door3Titles) {
    assert.strictEqual(
      classifyContactDoor(title),
      'DOOR_3',
      `Expected "${title}" to be classified as DOOR_3`
    );
  }
});

test('UT-ENRICH-02: Deterministic Confidence Scoring (0 - 100)', () => {
  // Fully verified contact with activity
  const highConfidenceScore = calculateConfidenceScore({
    door: 'DOOR_1',
    title: 'VP of Product',
    emailStatus: 'VERIFIED',
    hasRecentActivity: true
  });
  // Baseline 50 + 25 (email) + 15 (title) + 10 (activity) = 98 max clamp
  assert.strictEqual(highConfidenceScore, 98);

  // Inferred contact without recent activity
  const midConfidenceScore = calculateConfidenceScore({
    door: 'DOOR_3',
    title: 'Senior Product Manager',
    emailStatus: 'INFERRED',
    hasRecentActivity: false
  });
  // Baseline 50 + 10 (email) + 15 (title) + 0 = 75
  assert.strictEqual(midConfidenceScore, 75);

  // Unverified contact
  const lowConfidenceScore = calculateConfidenceScore({
    door: 'DOOR_2',
    title: 'Director of Product', // Title mismatch for Door 2
    emailStatus: 'UNVERIFIED',
    hasRecentActivity: false
  });
  // Baseline 50
  assert.strictEqual(lowConfidenceScore, 50);
});

test('UT-ENRICH-03: Curated Directory Resolution (Tier 1 Tech Companies)', async () => {
  const stripeEnrichment = await enrichCompanyContacts('Stripe');
  assert.strictEqual(stripeEnrichment.company, 'Stripe');
  assert.strictEqual(stripeEnrichment.domain, 'stripe.com');
  assert.strictEqual(stripeEnrichment.door1.door, 'DOOR_1');
  assert.strictEqual(stripeEnrichment.door1.fullName, 'David Singleton');
  assert.strictEqual(stripeEnrichment.door1.emailStatus, 'VERIFIED');
  assert.ok(stripeEnrichment.door1.email?.endsWith('@stripe.com'));
  assert.ok(stripeEnrichment.door1.confidenceScore >= 90);

  assert.strictEqual(stripeEnrichment.door2.door, 'DOOR_2');
  assert.strictEqual(stripeEnrichment.door2.fullName, 'Sarah Lin');
  assert.strictEqual(stripeEnrichment.door2.emailStatus, 'VERIFIED');

  assert.strictEqual(stripeEnrichment.door3.door, 'DOOR_3');
  assert.strictEqual(stripeEnrichment.door3.fullName, 'Alex Moretti');

  // Linear Curated
  const linearEnrichment = await enrichCompanyContacts('Linear');
  assert.strictEqual(linearEnrichment.door1.fullName, 'Karri Saarinen');
  assert.strictEqual(linearEnrichment.door1.door, 'DOOR_1');
  assert.ok(linearEnrichment.door1.email?.includes('linear.app'));
});

test('UT-ENRICH-04: Algorithmic Heuristic Fallback for Unlisted Companies', async () => {
  const acmeEnrichment = await enrichCompanyContacts('Acme Platform');
  assert.strictEqual(acmeEnrichment.company, 'Acme Platform');
  assert.strictEqual(acmeEnrichment.door1.door, 'DOOR_1');
  assert.strictEqual(acmeEnrichment.door2.door, 'DOOR_2');
  assert.strictEqual(acmeEnrichment.door3.door, 'DOOR_3');
  assert.strictEqual(acmeEnrichment.door1.emailStatus, 'INFERRED');
  assert.ok(acmeEnrichment.door1.email?.includes('acmeplatform.com'));
  assert.ok(acmeEnrichment.door1.confidenceScore >= 70);
});

test('UT-ENRICH-05: Strict Privacy & Data Minimization Invariant (Rule R6 / R8)', () => {
  // Valid professional contact
  const validContact: EnrichedContact = {
    id: 'contact-test-1',
    fullName: 'David Singleton',
    title: 'CTO & Head of Product',
    door: 'DOOR_1',
    email: 'david@stripe.com',
    emailStatus: 'VERIFIED',
    linkedinUrl: 'https://linkedin.com/in/davidsingleton',
    sourceUrl: 'https://stripe.com/about',
    confidence: 'VERIFIED',
    confidenceScore: 95,
    activityScore: 90
  };
  assert.strictEqual(validateContactPrivacy(validContact), true);

  // Forbidden personal data: Personal Gmail
  const personalEmailContact: EnrichedContact = {
    ...validContact,
    email: 'davidsingleton@gmail.com'
  };
  assert.strictEqual(
    validateContactPrivacy(personalEmailContact),
    false,
    'Personal consumer email must be rejected'
  );

  // Forbidden personal data: Phone number
  const phoneContact = {
    ...validContact,
    phone: '+1-555-0199'
  } as unknown as EnrichedContact;
  assert.strictEqual(
    validateContactPrivacy(phoneContact),
    false,
    'Personal phone number must be rejected'
  );
});

