/**
 * BACKDOOR v1.0 - TIER 3 LLM FIT EVALUATION & PROOF-POINT SYNTHESIS ENGINE
 * Module: @eval/brain (M3)
 * Authoritative Runbook §5.3 & PRD M3-FR5 / M3-FR6
 *
 * Grounding Invariants:
 * 1. Strictly grounds on candidate verified proof points in M8 (HARDI_PROOF_POINTS_LIBRARY).
 * 2. Enforces Rule R5: Byte-for-byte exact metric match; zero metric hallucination.
 * 3. Enforces Rule R3: Zero-cost baseline execution via deterministic synthesis; optional BYOK key.
 * 4. Triggers exclusively for high-fit opportunities where Tier 2 fit_score >= 70.
 */

import { HARDI_PROOF_POINTS_LIBRARY, VerifiedProofPoint } from './cv-builder';

export interface Tier3ProofBullet {
  proofPointId: string;
  employer: string;
  metric: string;
  tailoredBullet: string;
  relevanceReason: string;
}

export interface ScoreBoosterGap {
  id: string;
  skillOrArtifact: string;
  pointsPotential: number; // >= 5 points
  actionableGuidance: string;
  targetCategory: 'PORTFOLIO_ARTIFACT' | 'TECHNICAL_TOOLING' | 'DOMAIN_METRIC';
}

export interface Tier3SynthesisResult {
  eligible: boolean;
  jobId: string;
  company: string;
  roleTitle: string;
  fitScore: number;
  strategicPositioningAngle: string;
  proofBullets: Tier3ProofBullet[];
  scoreBoosterGaps: ScoreBoosterGap[];
  suggestedTrack: 'AI_NATIVE' | 'GROWTH' | 'UX' | 'PLATFORM_FINANCE';
  evaluationTimestamp: string;
  executionMs: number;
}

export interface Tier3EvaluationInput {
  jobId: string;
  company: string;
  title: string;
  description?: string;
  requiredSkills?: string[];
  fitScore: number;
  targetTrack?: 'AI_NATIVE' | 'GROWTH' | 'UX' | 'PLATFORM_FINANCE';
}

/**
 * Identify the optimal candidate track based on job title, description, and skills.
 */
export function resolveTargetTrack(
  title: string,
  description: string = '',
  skills: string[] = []
): 'AI_NATIVE' | 'GROWTH' | 'UX' | 'PLATFORM_FINANCE' {
  const combined = `${title} ${description} ${skills.join(' ')}`.toLowerCase();

  const aiSignals = ['ai', 'llm', 'rag', 'machine learning', 'model', 'prompt', 'agent', 'genai', 'nlp', 'deep learning'];
  const growthSignals = ['growth', 'plg', 'funnel', 'conversion', 'acquisition', 'retention', 'monetization', 'experimentation'];
  const uxSignals = ['ux', 'design', 'user experience', 'figma', 'prototype', 'journey', 'usability', 'workflow'];

  const aiScore = aiSignals.filter(s => combined.includes(s)).length;
  const growthScore = growthSignals.filter(s => combined.includes(s)).length;
  const uxScore = uxSignals.filter(s => combined.includes(s)).length;

  if (aiScore >= growthScore && aiScore >= uxScore && aiScore > 0) {
    return 'AI_NATIVE';
  }
  if (growthScore >= uxScore && growthScore > 0) {
    return 'GROWTH';
  }
  if (uxScore > 0) {
    return 'UX';
  }
  return 'AI_NATIVE';
}

/**
 * Generate 1 Strategic Positioning Angle customized to company domain and candidate strengths.
 */
export function generateStrategicPositioningAngle(
  company: string,
  title: string,
  track: 'AI_NATIVE' | 'GROWTH' | 'UX' | 'PLATFORM_FINANCE'
): string {
  switch (track) {
    case 'AI_NATIVE':
      return `Positioned as an AI-Native Product Leader at ${company} who bridges state-of-the-art LLM evaluations, RAG architectures, and sub-second inference latency with rigorous financial unit economics.`;
    case 'GROWTH':
      return `Positioned as a Product-Led Growth Operator at ${company} with a Chartered Accountant foundation, scaling viral activation loops and compressing payback cycles through disciplined experimentation.`;
    case 'UX':
      return `Positioned as a Systems & UX-Focused Product Leader at ${company} who compresses time-to-first-value (TTFV) and eliminates enterprise cognitive friction without feature bloat.`;
    case 'PLATFORM_FINANCE':
      return `Positioned as a High-Integrity Fintech & Core Systems Leader at ${company} combining deep statutory audit discipline with automated reconciliation rails.`;
  }
}

/**
 * Synthesize 3 tailored proof bullets grounded in M8 library without metric distortion.
 */
export function synthesizeProofBullets(
  track: 'AI_NATIVE' | 'GROWTH' | 'UX' | 'PLATFORM_FINANCE',
  company: string,
  requiredSkills: string[] = []
): Tier3ProofBullet[] {
  // 1. Filter proof points by active track
  const trackProofPoints = HARDI_PROOF_POINTS_LIBRARY.filter(pp => pp.track === track);

  // 2. Select top 3 relevant points (fallback to any available in library if needed)
  const candidatePoints = trackProofPoints.length >= 3 
    ? trackProofPoints.slice(0, 3) 
    : [...trackProofPoints, ...HARDI_PROOF_POINTS_LIBRARY.filter(pp => pp.track !== track)].slice(0, 3);

  return candidatePoints.map((pp) => {
    let relevance = `Directly validates core competency in ${pp.skillsTags.slice(0, 3).join(', ')}.`;
    if (requiredSkills.length > 0) {
      const match = pp.skillsTags.find(t => requiredSkills.some(rs => rs.toLowerCase().includes(t.toLowerCase())));
      if (match) {
        relevance = `Matches ${company}'s requirement for ${match} with verified production impact.`;
      }
    }

    return {
      proofPointId: pp.id,
      employer: pp.employer,
      metric: pp.rawMetricString,
      tailoredBullet: pp.statement,
      relevanceReason: relevance,
    };
  });
}

/**
 * Calculate actionable Score Booster Gaps: missing artifacts or skills worth >= 5 points.
 */
export function calculateScoreBoosterGaps(
  track: 'AI_NATIVE' | 'GROWTH' | 'UX' | 'PLATFORM_FINANCE',
  requiredSkills: string[] = []
): ScoreBoosterGap[] {
  const gaps: ScoreBoosterGap[] = [];

  if (track === 'AI_NATIVE') {
    gaps.push({
      id: 'gap-ai-eval-repo',
      skillOrArtifact: 'Public Model Eval Benchmark / Github Spec',
      pointsPotential: 6,
      actionableGuidance: 'Link your public RAG retrieval evaluation harness in the initial Door 1 pitch to prove real-world prompt evaluation rigor.',
      targetCategory: 'PORTFOLIO_ARTIFACT',
    });
    gaps.push({
      id: 'gap-ai-cost-model',
      skillOrArtifact: 'Token Economics & Unit Margin Teardown',
      pointsPotential: 5,
      actionableGuidance: 'Highlight gross margin optimization from hybrid vector caching in your executive teardown 1-pager.',
      targetCategory: 'DOMAIN_METRIC',
    });
  } else if (track === 'GROWTH') {
    gaps.push({
      id: 'gap-growth-funnel-case',
      skillOrArtifact: 'Self-Serve Conversion Walkthrough',
      pointsPotential: 6,
      actionableGuidance: 'Attach an annotated 3-slide teardown of their current checkout/onboarding dropoff in your Day 5 follow-up draft.',
      targetCategory: 'PORTFOLIO_ARTIFACT',
    });
    gaps.push({
      id: 'gap-growth-cac-payback',
      skillOrArtifact: 'B2B Payback Period Modeling',
      pointsPotential: 5,
      actionableGuidance: 'Cite specific multi-tier pricing migration heuristics during recruiter screen.',
      targetCategory: 'DOMAIN_METRIC',
    });
  } else {
    gaps.push({
      id: 'gap-ux-ttfv',
      skillOrArtifact: 'Time-to-First-Value Heuristic Audit',
      pointsPotential: 6,
      actionableGuidance: 'Include a 2-minute video walkthrough of zero-state template improvements.',
      targetCategory: 'PORTFOLIO_ARTIFACT',
    });
    gaps.push({
      id: 'gap-ux-design-system',
      skillOrArtifact: 'Component Hierarchy Architecture',
      pointsPotential: 5,
      actionableGuidance: 'Reference your experience standardizing enterprise design tokens to accelerate engineering velocity.',
      targetCategory: 'TECHNICAL_TOOLING',
    });
  }

  return gaps;
}

/**
 * Main Tier 3 Evaluation Orchestrator (Runbook §5.3 / PRD M3-FR5)
 */
export function evaluateTier3Dossier(input: Tier3EvaluationInput): Tier3SynthesisResult {
  const startTime = Date.now();

  // Tier 3 strictly activates for roles where Tier 2 fit_score >= 70
  if (input.fitScore < 70) {
    return {
      eligible: false,
      jobId: input.jobId,
      company: input.company,
      roleTitle: input.title,
      fitScore: input.fitScore,
      strategicPositioningAngle: 'Tier 3 executive synthesis is reserved for high-fit roles with a match score >= 70%.',
      proofBullets: [],
      scoreBoosterGaps: [],
      suggestedTrack: 'AI_NATIVE',
      evaluationTimestamp: new Date().toISOString(),
      executionMs: Date.now() - startTime,
    };
  }

  const track = input.targetTrack || resolveTargetTrack(input.title, input.description, input.requiredSkills);
  const strategicAngle = generateStrategicPositioningAngle(input.company, input.title, track);
  const proofBullets = synthesizeProofBullets(track, input.company, input.requiredSkills);
  const boosterGaps = calculateScoreBoosterGaps(track, input.requiredSkills);

  return {
    eligible: true,
    jobId: input.jobId,
    company: input.company,
    roleTitle: input.title,
    fitScore: input.fitScore,
    strategicPositioningAngle: strategicAngle,
    proofBullets,
    scoreBoosterGaps: boosterGaps,
    suggestedTrack: track,
    evaluationTimestamp: new Date().toISOString(),
    executionMs: Date.now() - startTime,
  };
}
