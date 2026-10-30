/**
 * BACKDOOR v1.0 - TIER 3 LLM FIT EVALUATION UNIT TESTS
 * Test Suite: tests/tier3-eval.test.ts
 * Authoritative: Runbook §5.3 & PRD M3-FR5 / M3-FR6
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  evaluateTier3Dossier,
  resolveTargetTrack,
  generateStrategicPositioningAngle,
  synthesizeProofBullets,
  calculateScoreBoosterGaps,
} from '../src/engine/tier3-eval';
import { HARDI_PROOF_POINTS_LIBRARY } from '../src/engine/cv-builder';

test('UT-T3-01: Low fit score (< 70) marks eligible=false and skips synthesis', () => {
  const result = evaluateTier3Dossier({
    jobId: 'job-low-fit',
    company: 'Generic Corp',
    title: 'Junior Coordinator',
    fitScore: 45,
  });

  assert.strictEqual(result.eligible, false);
  assert.strictEqual(result.fitScore, 45);
  assert.strictEqual(result.proofBullets.length, 0);
  assert.strictEqual(result.scoreBoosterGaps.length, 0);
  assert.match(result.strategicPositioningAngle, />= 70%/);
});

test('UT-T3-02: High fit score (>= 70) returns complete executive synthesis', () => {
  const result = evaluateTier3Dossier({
    jobId: 'job-high-fit',
    company: 'Anthropic',
    title: 'Senior Product Manager, Prompt Systems',
    description: 'Lead AI evaluation frameworks, RAG retrieval pipelines, and latency optimizations.',
    requiredSkills: ['AI', 'Evaluation', 'RAG', 'LLM'],
    fitScore: 88,
  });

  assert.strictEqual(result.eligible, true);
  assert.strictEqual(result.fitScore, 88);
  assert.strictEqual(result.company, 'Anthropic');
  assert.strictEqual(result.suggestedTrack, 'AI_NATIVE');
  assert.strictEqual(result.proofBullets.length, 3);
  assert.ok(result.scoreBoosterGaps.length >= 2);
  assert.match(result.strategicPositioningAngle, /Anthropic/);
  assert.match(result.strategicPositioningAngle, /AI-Native Product Leader/);
});

test('UT-T3-03: Rule R5 Metric Verification — proof bullets byte-for-byte match M8 library', () => {
  const result = evaluateTier3Dossier({
    jobId: 'job-metrics-check',
    company: 'Stripe',
    title: 'Lead Product Manager, Developer Platform',
    fitScore: 92,
  });

  assert.strictEqual(result.eligible, true);

  // Check each proof bullet against authoritative M8 library
  for (const bullet of result.proofBullets) {
    const verifiedSource = HARDI_PROOF_POINTS_LIBRARY.find(pp => pp.id === bullet.proofPointId);
    assert.ok(verifiedSource, `Proof point ID ${bullet.proofPointId} must exist in M8 library`);
    assert.strictEqual(bullet.metric, verifiedSource.rawMetricString, 'Metric must match byte-for-byte');
    assert.strictEqual(bullet.employer, verifiedSource.employer, 'Employer must match byte-for-byte');
    assert.strictEqual(bullet.tailoredBullet, verifiedSource.statement, 'Bullet text must match source statement');
  }
});

test('UT-T3-04: Track resolution correctly routes AI, Growth, and UX roles', () => {
  const aiTrack = resolveTargetTrack('Product Manager - Foundation Models', 'Scale agent evaluations and token latency.');
  assert.strictEqual(aiTrack, 'AI_NATIVE');

  const growthTrack = resolveTargetTrack('Growth PM', 'Scale self-serve funnel conversion and viral PLG loops.');
  assert.strictEqual(growthTrack, 'GROWTH');

  const uxTrack = resolveTargetTrack('UX Product Designer & PM', 'Optimize journey mapping, time-to-first-value, and zero states.');
  assert.strictEqual(uxTrack, 'UX');
});

test('UT-T3-05: Score Booster Gaps enforce >= 5 points potential and valid taxonomy', () => {
  const gaps = calculateScoreBoosterGaps('AI_NATIVE');
  assert.ok(gaps.length >= 2, 'Should provide at least 2 booster recommendations');

  for (const gap of gaps) {
    assert.ok(gap.pointsPotential >= 5, `Gap potential (${gap.pointsPotential}) must be >= 5 pts`);
    assert.ok(gap.skillOrArtifact.length > 5, 'Artifact title must be descriptive');
    assert.ok(gap.actionableGuidance.length > 15, 'Actionable guidance must provide clear instructions');
    assert.ok(
      ['PORTFOLIO_ARTIFACT', 'TECHNICAL_TOOLING', 'DOMAIN_METRIC'].includes(gap.targetCategory),
      `Category ${gap.targetCategory} must be valid taxonomy`
    );
  }
});

test('UT-T3-06: Synthesis execution satisfies sub-3000ms latency mandate', () => {
  const start = performance.now();
  const result = evaluateTier3Dossier({
    jobId: 'job-perf-test',
    company: 'Linear',
    title: 'Staff Product Manager',
    fitScore: 82,
  });
  const elapsed = performance.now() - start;

  assert.ok(result.eligible);
  assert.ok(elapsed < 3000, `Execution time (${elapsed}ms) must be under 3000ms`);
  assert.ok(result.executionMs >= 0);
});
