/**
 * Subsystem: Dual-Pass Drafter & Critic Architecture (/apply)
 * Agent 1 (The Drafter): Synthesizes targeted outreach & CV narratives
 * Agent 2 (The Critic): Cynical reviewer enforcing Rule R5 Metric Exactness,
 *                       Anti-AI Tone Linter, and evidence-backed claims.
 */

import { HARDI_PROOF_POINTS, verifyRuleR5MetricExactness } from '@/engine/cv-builder';
import { lintExecutiveTone } from '@/engine/tone-linter';

export interface DraftRequest {
  candidateName: string;
  targetCompany: string;
  targetRole: string;
  doorType: 'DOOR_1_FOUNDER' | 'DOOR_2_TALENT' | 'DOOR_3_PEER';
  recipientName?: string;
  jobRequirements?: string[];
  conversationHooks?: string[];
  candidateTrack?: string;
  draftType?: 'outreach_note' | 'cv_summary';
}

export interface CriticReviewResult {
  passed: boolean;
  verdict: 'APPROVED' | 'REVISION_REQUIRED';
  toneScore: number;
  criticFeedback: string[];
  verifiedMetrics: string[];
  flaggedHallucinations: string[];
  flaggedCliches: string[];
  finalApprovedText: string;
  initialDraft: string;
}

/**
 * Agent 1 (The Drafter): Synthesizes initial targeted draft
 */
export function agent1Draft(req: DraftRequest): string {
  const hooks = req.conversationHooks && req.conversationHooks.length > 0
    ? req.conversationHooks[0]
    : `scaling product execution and roadmap velocity at ${req.targetCompany}`;

  const topProof = HARDI_PROOF_POINTS[0]; // e.g. $18.4M ARR
  const secondProof = HARDI_PROOF_POINTS[1] || HARDI_PROOF_POINTS[0];

  if (req.doorType === 'DOOR_1_FOUNDER') {
    return `Hi ${req.recipientName || 'there'}, noticed ${hooks}. At my previous venture, I scaled platform ARR from $10M to $18.4M in 14 months, driving 42% margin expansion while maintaining a lean cross-functional team. I would welcome 15 minutes to share specific playbooks on how we can accelerate the ${req.targetRole} roadmap at ${req.targetCompany}.`;
  }

  if (req.doorType === 'DOOR_2_TALENT') {
    return `Hi ${req.recipientName || 'there'}, reaching out regarding the ${req.targetRole} posting at ${req.targetCompany}. Over the past 6 years, I have led zero-to-one product initiatives that improved retention by 34% and reduced customer churn to under 1.2%. Would love to connect and share my tailored dossier for your review.`;
  }

  // Door 3: Peer PM
  return `Hey ${req.recipientName || 'there'}, saw your team is building out the ${req.targetRole} role. Having scaled systems from 50K to 850K daily active users, I know how critical roadmap alignment is right now. Would love to swap notes on how you are tackling ${hooks}.`;
}

/**
 * Agent 2 (The Critic / Reviewer): Evaluates draft like a cynical hiring manager
 */
export function agent2Critic(initialDraft: string, req: DraftRequest): CriticReviewResult {
  const criticFeedback: string[] = [];

  // 1. Audit Tone & AI Clichés (Anti-AI Tone Linter)
  const toneResult = lintExecutiveTone(initialDraft);
  if (!toneResult.passed) {
    for (const v of toneResult.violations) {
      criticFeedback.push(`Critic Tone Flag: ${v}`);
    }
  }

  // 2. Audit Metrics against Rule R5 Ground Truth
  // Exclude conversational meeting request durations (e.g. "15 minutes") from career metric veto
  const textForMetricAudit = initialDraft.replace(/\b(?:5|10|15|20|30|45)\s*(?:min|mins|minutes)\b/gi, '');
  const r5Audit = verifyRuleR5MetricExactness([textForMetricAudit], HARDI_PROOF_POINTS);
  if (!r5Audit.passed) {
    for (const h of r5Audit.hallucinatedMetrics) {
      criticFeedback.push(`Critic Metric Veto: Detected unverified metric "${h}". Must strictly match career proof bank.`);
    }
  }

  // 3. Length & Substantive Engagement Check
  if (initialDraft.length > 350) {
    criticFeedback.push('Critic Attention Flag: Outreach note exceeds 300-character cognitive boundary for high-response cold messages.');
  }

  // 4. Synthesize Final Hardened Output
  let finalApproved = toneResult.cleanedText;

  // If revisions were required, harden and finalize
  const isApproved = toneResult.passed && r5Audit.passed && initialDraft.length <= 400;

  return {
    passed: isApproved,
    verdict: isApproved ? 'APPROVED' : 'REVISION_REQUIRED',
    toneScore: toneResult.score,
    criticFeedback,
    verifiedMetrics: r5Audit.verifiedMetrics,
    flaggedHallucinations: r5Audit.hallucinatedMetrics,
    flaggedCliches: toneResult.violations,
    finalApprovedText: finalApproved,
    initialDraft
  };
}

/**
 * Full Dual-Pass Pipeline Execution
 */
export function executeDualPassPipeline(req: DraftRequest): CriticReviewResult {
  // Pass 1: Drafter
  const rawDraft = agent1Draft(req);

  // Pass 2: Critic
  const review = agent2Critic(rawDraft, req);

  // If revision required, auto-polish with sanitized text
  if (!review.passed) {
    review.finalApprovedText = lintExecutiveTone(review.finalApprovedText).cleanedText;
  }

  return review;
}
