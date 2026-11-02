/**
 * Test Suite: tests/semantic-grammar.test.ts
 * Verifies SCR-T05: Universal Semantic Grammar & Dual-Track Blueprint
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  buildRoleLanguagePrompt,
  synthesizeDeterministicRoleTeardown,
} from '../src/engine/prompt-builder';
import { HARDI_PROOF_POINTS_LIBRARY } from '../src/engine/cv-builder';

test('SCR-T05-01: Dynamic prompt generator injects department vocabulary and candidate proof points', () => {
  const proofPoints = HARDI_PROOF_POINTS_LIBRARY.slice(0, 2).map((pp) => ({
    id: pp.id,
    metricText: pp.statement,
  }));

  const { systemPrompt, userPrompt } = buildRoleLanguagePrompt({
    roleTitle: 'Staff Product Manager',
    archetype: 'PRODUCT_MANAGEMENT',
    companyName: 'Notion',
    scopedProduct: 'Notion AI',
    intelPayload: { sentiment: 82 },
    candidateProofPoints: proofPoints,
  });

  assert.match(systemPrompt, /Product Management/);
  assert.match(systemPrompt, /Time-to-Value \(TTV\)/);
  assert.match(systemPrompt, /RULE R5 \(NO INVENTED METRICS\)/);
  assert.match(systemPrompt, /pp-ai-01/);
  assert.match(userPrompt, /dualTrackRoadmap/);
});

test('SCR-T05-02: Deterministic teardown synthesis generates 3 zero-solution diagnostic questions (Rule R4)', () => {
  const proofPoints = [
    { id: 'pp-ai-01', metricText: '42% latency reduction' },
    { id: 'pp-ai-02', metricText: '94.6% precision' },
  ];

  const teardown = synthesizeDeterministicRoleTeardown({
    roleTitle: 'Senior Engineering Manager',
    archetype: 'ENGINEERING_TECH',
    companyName: 'Datadog',
    candidateProofPoints: proofPoints,
  });

  assert.strictEqual(teardown.threeDiagnosticQuestions.length, 3);
  const types = teardown.threeDiagnosticQuestions.map((q) => q.type);
  assert.deepStrictEqual(types, ['MACRO_FINANCIAL', 'COMPETITOR_PRODUCT', 'INTERNAL_EXECUTION']);

  for (const q of teardown.threeDiagnosticQuestions) {
    assert.ok(q.verifiedFact.length > 20, 'Must have verified fact');
    assert.ok(q.observedFriction.length > 20, 'Must have observed friction');
    assert.ok(q.openDilemma.length > 20, 'Must have open trade-off dilemma');
    // Rule R4: Must withhold solutions (must end with question mark and ask open trade-off question)
    assert.match(q.question, /\?$/, 'Question must end with a question mark');
    assert.match(q.openDilemma, /\b(how|is leadership|weighing|balancing)\b/i);
  }
});

test('SCR-T05-03: Generates standardized 2-3 conversation progression ladder', () => {
  const proofPoints = [
    { id: 'pp-ai-01', metricText: '42% query latency' },
    { id: 'pp-ai-02', metricText: '94.6% retrieval precision' },
  ];

  const teardown = synthesizeDeterministicRoleTeardown({
    roleTitle: 'VP of Finance',
    archetype: 'FINANCE_ACCOUNTING',
    companyName: 'Stripe',
    candidateProofPoints: proofPoints,
  });

  assert.ok(teardown.conversationProgression.call1_ProblemValidation.length > 30);
  assert.match(teardown.conversationProgression.call1_ProblemValidation, /researching Stripe/);
  assert.ok(teardown.conversationProgression.call2_OpportunityPitch.length > 30);
  assert.match(teardown.conversationProgression.call2_OpportunityPitch, /Corporate Finance & FP&A/);
  assert.ok(teardown.conversationProgression.call3_AlignmentPrompt.length > 30);
  assert.match(teardown.conversationProgression.call3_AlignmentPrompt, /Track A \(Velocity & Triage\) vs\. Track B \(Scalability & Architecture\)/);
});

test('SCR-T05-04: Generates Dual-Track 30-60-90 day menu anchored by verified Rule R5 proof points', () => {
  const proofPoints = [
    { id: 'pp-ai-01', metricText: 'reduced query latency by 42%' },
    { id: 'pp-ai-02', metricText: 'achieving 94.6% retrieval precision' },
  ];

  const teardown = synthesizeDeterministicRoleTeardown({
    roleTitle: 'Director of Growth',
    archetype: 'MARKETING_GROWTH',
    companyName: 'Canva',
    scopedProduct: 'Canva Pro',
    candidateProofPoints: proofPoints,
  });

  const roadmap = teardown.dualTrackRoadmap;
  assert.match(roadmap.days0to30_CommonBaseline, /Days 0–30/);
  assert.strictEqual(roadmap.trackA_Velocity.proofPointId, 'pp-ai-01');
  assert.strictEqual(roadmap.trackB_Scalability.proofPointId, 'pp-ai-02');
  assert.match(roadmap.trackA_Velocity.days30to60, /reduced query latency by 42%/);
  assert.match(roadmap.trackB_Scalability.days30to60, /achieving 94\.6% retrieval precision/);
  assert.match(roadmap.collaborativeClosingQuestion, /\?$/);
});

test('SCR-T05-05: Rule R5 Safety Gate rejects synthesis when proof points are missing', () => {
  assert.throws(
    () => {
      synthesizeDeterministicRoleTeardown({
        roleTitle: 'Product Manager',
        archetype: 'PRODUCT_MANAGEMENT',
        companyName: 'Acme',
        candidateProofPoints: [], // Empty proof points triggers safety veto
      });
    },
    /Rule R5 Safety Violation/
  );
});

