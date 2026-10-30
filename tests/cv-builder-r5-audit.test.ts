import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  HARDI_PROOF_POINTS_LIBRARY,
  selectTailoredProofPoints,
  verifyZeroMetricHallucination,
  buildTailoredCv,
  extractMetricsFromText,
  normalizeMetric,
} from '../src/engine/cv-builder';

test('UT-CV-01: Hardi M8 Proof Points Bank Completeness & Validity', () => {
  assert.ok(HARDI_PROOF_POINTS_LIBRARY.length >= 10, 'Must have at least 10 verified proof points');

  for (const pp of HARDI_PROOF_POINTS_LIBRARY) {
    assert.ok(pp.id.startsWith('pp-'), `Invalid proof point id: ${pp.id}`);
    assert.ok(pp.statement.length > 20, `Statement too short: ${pp.statement}`);
    assert.ok(pp.metricNumber > 0, `Metric number must be positive: ${pp.metricNumber}`);
    assert.ok(pp.metricUnit.length > 0, `Metric unit required for ${pp.id}`);
    assert.ok(['UP', 'DOWN', 'NEUTRAL'].includes(pp.metricDirection));
    assert.ok(pp.skillsTags.length >= 2, `Proof point ${pp.id} must have skills tags`);
    assert.ok(['AI_NATIVE', 'GROWTH', 'UX', 'PLATFORM_FINANCE'].includes(pp.track));
    assert.ok(pp.rawMetricString.length > 0, `Raw metric string required for ${pp.id}`);
  }
});

test('UT-CV-02: Deterministic Proof Point Selection tailored to target role', () => {
  // Test 1: AI-focused role should select AI_NATIVE proof points first
  const aiBullets = selectTailoredProofPoints({
    title: 'Product Manager, Applied AI & RAG',
    company: 'OpenAI',
    requiredSkills: ['RAG', 'LLM', 'Evaluation'],
  }, 3);

  assert.equal(aiBullets.length, 3);
  assert.ok(aiBullets.some((b) => b.track === 'AI_NATIVE'), 'Should prioritize AI_NATIVE for AI role');
  assert.ok(aiBullets.some((b) => b.skillsTags.includes('RAG') || b.skillsTags.includes('AI')));

  // Test 2: Growth role should select GROWTH proof points
  const growthBullets = selectTailoredProofPoints({
    title: 'Growth Product Manager',
    company: 'Linear',
    requiredSkills: ['PLG', 'Conversion', 'Funnel'],
  }, 3);

  assert.equal(growthBullets.length, 3);
  assert.ok(growthBullets.some((b) => b.track === 'GROWTH'), 'Should prioritize GROWTH for Growth role');
  assert.ok(growthBullets.some((b) => b.rawMetricString === '18.4%' || b.rawMetricString === '34%'));
});

test('UT-CV-03: Rule R5 Metric Verifier - Byte-for-Byte Exact Matches Pass', () => {
  const selectedPoints = HARDI_PROOF_POINTS_LIBRARY.slice(0, 3);
  // Construct text containing exact metrics from those points
  const safeText = `Led systems reducing latency by 42% and increasing conversion by 18.4% across multi-agent workflows.`;

  const audit = verifyZeroMetricHallucination(safeText, HARDI_PROOF_POINTS_LIBRARY);
  assert.equal(audit.passed, true, 'Audit should pass when all metrics match library byte-for-byte');
  assert.equal(audit.hallucinatedMetrics.length, 0);
  assert.ok(audit.verifiedMetrics.includes('42%') || audit.verifiedMetrics.includes('42'));
  assert.ok(audit.verifiedMetrics.includes('18.4%') || audit.verifiedMetrics.includes('18.4'));
});

test('UT-CV-04: Rule R5 Metric Verifier - Rounding Numbers Fails (18.4% -> 20%)', () => {
  const selectedPoints = HARDI_PROOF_POINTS_LIBRARY.filter((p) => p.track === 'GROWTH');
  // 18.4% rounded to 20% must be detected as a hallucination!
  const roundedText = `Redesigned onboarding flow increasing conversion by 20% across 45,000 workspaces.`;

  const audit = verifyZeroMetricHallucination(roundedText, selectedPoints);
  assert.equal(audit.passed, false, 'Audit must fail when a number is rounded');
  assert.ok(audit.hallucinatedMetrics.includes('20%') || audit.hallucinatedMetrics.includes('20'));
  assert.equal(audit.revertedToDeterministic, true);
});

test('UT-CV-05: Rule R5 Metric Verifier - Invented Metrics Trigger Immediate Veto', () => {
  const selectedPoints = HARDI_PROOF_POINTS_LIBRARY.filter((p) => p.track === 'AI_NATIVE');
  // Invented metric $12M and 78% not in candidate's proof points library
  const inventedText = `Generated $12M in ARR and achieved 78% retention rate.`;

  const audit = verifyZeroMetricHallucination(inventedText, selectedPoints);
  assert.equal(audit.passed, false, 'Audit must fail on invented numbers');
  assert.ok(audit.hallucinatedMetrics.some((m) => m.includes('12') || m.includes('78')));
});

test('UT-CV-06: buildTailoredCv Full Pipeline & Google Drive PDF Staging', () => {
  const result = buildTailoredCv({
    jobId: 'job-stripe-001',
    company: 'Stripe',
    title: 'Staff Product Manager, Payment Platforms',
    requiredSkills: ['Ledger', 'Reconciliation', 'FinTech'],
    polishWithAi: false,
  });

  assert.ok(result.cvBuildId.startsWith('cv-job-stripe-001'));
  assert.ok(result.googleDocId.includes('Stripe') || result.googleDocId.includes('job-stripe-001'));
  assert.ok(result.googleDrivePdfUrl.includes('/cv/preview'));
  assert.equal(result.candidateName, 'Hardi Jain');
  assert.equal(result.auditReport.passed, true);
  assert.equal(result.selectedBullets.length, 5);
  assert.ok(result.document.experience.length >= 1);
  assert.ok(result.document.sideProjects.length >= 1);

  // When safe AI text is supplied with exact metrics, it should be adopted
  const safeAiResult = buildTailoredCv({
    jobId: 'job-openai-002',
    company: 'OpenAI',
    title: 'Product Manager, Applied AI',
    requiredSkills: ['RAG', 'Latency'],
    polishWithAi: true,
    simulatedAiSummary: 'Product strategist with proven 42% latency reduction in AI systems.',
  });
  assert.equal(safeAiResult.auditReport.passed, true);
  assert.ok(safeAiResult.summary.includes('42%'));

  // When tainted AI text with rounded metric is supplied, it MUST revert to deterministic template
  const taintedAiResult = buildTailoredCv({
    jobId: 'job-openai-003',
    company: 'OpenAI',
    title: 'Product Manager, Applied AI',
    requiredSkills: ['RAG', 'Latency'],
    polishWithAi: true,
    simulatedAiSummary: 'Product strategist with hallucinated 65% latency reduction and $99M cost savings.',
  });
  assert.equal(taintedAiResult.auditReport.passed, false);
  assert.equal(taintedAiResult.auditReport.revertedToDeterministic, true);
  // Summary reverted to safe deterministic template
  assert.ok(!taintedAiResult.summary.includes('65%'));
  assert.ok(!taintedAiResult.summary.includes('$99M'));
});

