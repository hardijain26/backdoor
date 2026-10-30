/**
 * Subsystem 4: 3-Tier Suitability Engine (@eval/brain M3)
 * Tier 1: Deterministic Eligibility Gate (<100ms, Boolean)
 * Tier 2: Deterministic Mathematical Score (0-100 Points, No AI)
 */

export interface CandidateTrack {
  id?: string;
  name: string;
  targetTitles: string[];
  skills: string[];
  seniorityLevels: string[];
  workCountries: string[];
  excludedIndustries: string[];
  baselineExperienceYears: number;
}

export const DEFAULT_TRACK: CandidateTrack = {
  name: 'AI-Native PM / Executive PM',
  targetTitles: [
    'Senior Product Manager',
    'Lead Product Manager',
    'Staff Product Manager',
    'Principal Product Manager',
    'Director of Product',
    'Head of Product',
    'AI Product Manager'
  ],
  skills: [
    'product strategy',
    'roadmapping',
    'ai/ml',
    'system architecture',
    'a/b testing',
    'analytics',
    'user research',
    'cross-functional leadership',
    'go-to-market',
    'sql'
  ],
  seniorityLevels: ['senior', 'lead', 'staff', 'principal', 'director'],
  workCountries: ['india', 'us', 'uk', 'eu', 'remote'],
  excludedIndustries: ['fintech', 'payments', 'crypto', 'web3', 'neo-bank', 'neobank', 'lending', 'p2p'],
  baselineExperienceYears: 3
};

export interface JobEvaluationInput {
  title: string;
  company: string;
  locations?: string[];
  region?: string;
  descriptionText: string;
  requiredYears?: number;
  seniority?: string;
  usSponsorshipAvailable?: boolean;
}

export interface EvaluationResult {
  tier1Passed: boolean;
  tier1Reason?: string;
  fitScore: number;
  breakdown: {
    skillMatch: number;
    experienceScore: number;
    seniorityScore: number;
  };
  matchedSkills: string[];
  missingSkills: string[];
  badgeToken: 'status-top' | 'status-mid' | 'status-low';
  badgeLabel: 'Top Fit' | 'Exploratory' | 'Stretch' | 'Ineligible';
}

/**
 * Tier 1: Eligibility Gate (Runbook §5.3)
 * Checks location overlap, remote boundaries, and strictly excluded industries.
 */
export function evaluateTier1(
  job: JobEvaluationInput,
  track: CandidateTrack = DEFAULT_TRACK
): { passed: boolean; reason?: string } {
  const descLower = (job.descriptionText || '').toLowerCase();
  const companyLower = (job.company || '').toLowerCase();
  const titleLower = (job.title || '').toLowerCase();

  // 1. Title Exclusions
  const BANNED_TITLE_REGEX = /(marketing|engineering manager|tpm|scrum master|technical program manager|recruiter)/i;
  if (BANNED_TITLE_REGEX.test(titleLower)) {
    return { passed: false, reason: `Role title "${job.title}" matches excluded functional roles.` };
  }

  // 2. Excluded Industries Check (Zero FinTech / Payments invariant)
  for (const industry of track.excludedIndustries) {
    const indPattern = new RegExp(`\\b${industry.toLowerCase()}\\b`, 'i');
    if (indPattern.test(companyLower) || indPattern.test(descLower)) {
      return { passed: false, reason: `Company or description matches excluded industry: ${industry}.` };
    }
  }

  // 3. Location & Remote Boundary Check
  const jobLocations = (job.locations || []).map((l) => l.toLowerCase());
  const isGlobalRemote =
    (job.region && job.region.toLowerCase().includes('remote')) ||
    jobLocations.some((l) => l.includes('remote'));

  const isUsOnlyRemote =
    descLower.includes('remote (us only)') ||
    descLower.includes('us remote only') ||
    descLower.includes('must be located in the united states') ||
    jobLocations.some((l) => l.includes('us only'));

  if (isUsOnlyRemote && !job.usSponsorshipAvailable) {
    const candidateHasUsAuth = track.workCountries.includes('us_citizen');
    if (!candidateHasUsAuth) {
      return { passed: false, reason: 'Remote US Only role without visa sponsorship capability.' };
    }
  }

  // Check country overlap if not remote
  if (!isGlobalRemote && jobLocations.length > 0) {
    const hasOverlap = jobLocations.some((loc) =>
      track.workCountries.some((c) => loc.includes(c) || c.includes(loc))
    );
    if (!hasOverlap) {
      return { passed: false, reason: `Job location (${jobLocations.join(', ')}) outside target candidate regions.` };
    }
  }

  return { passed: true };
}

/**
 * Tier 2: Deterministic Mathematical Scoring (Runbook §5.3)
 * - Skills Overlap: Max 60 pts
 * - Experience Gap: Max 25 pts (25 - 5 * max(0, required_years - 3))
 * - Seniority Alignment: Max 15 pts
 */
export function evaluateTier2(
  job: JobEvaluationInput,
  track: CandidateTrack = DEFAULT_TRACK
): {
  fitScore: number;
  breakdown: { skillMatch: number; experienceScore: number; seniorityScore: number };
  matchedSkills: string[];
  missingSkills: string[];
} {
  const descLower = (job.descriptionText || '').toLowerCase();
  const titleLower = (job.title || '').toLowerCase();

  // 1. Skills Overlap Score (Max 60 pts)
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];

  for (const skill of track.skills) {
    const skillPattern = new RegExp(`\\b${skill.replace('/', '\\/')}\\b`, 'i');
    if (skillPattern.test(descLower) || skillPattern.test(titleLower)) {
      matchedSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  }

  const skillMatchRatio = track.skills.length > 0 ? matchedSkills.length / track.skills.length : 0;
  const skillMatch = Math.round(skillMatchRatio * 60);

  // 2. Experience Gap Score (Max 25 pts)
  // Formula: 25 - (5 * max(0, required_years - baseline))
  const requiredYears = job.requiredYears !== undefined ? job.requiredYears : 3;
  const expDiff = Math.max(0, requiredYears - track.baselineExperienceYears);
  const experienceScore = Math.max(0, 25 - 5 * expDiff);

  // 3. Seniority Alignment Score (Max 15 pts)
  let seniorityScore = 5; // Baseline baseline match
  const detectedSeniority = (job.seniority || '').toLowerCase();

  const isExactLevel = track.seniorityLevels.some(
    (lvl) => titleLower.includes(lvl) || detectedSeniority.includes(lvl)
  );

  if (isExactLevel) {
    seniorityScore = 15;
  } else if (titleLower.includes('product manager') || titleLower.includes('pm')) {
    seniorityScore = 10;
  }

  const fitScore = Math.min(100, Math.max(0, skillMatch + experienceScore + seniorityScore));

  return {
    fitScore,
    breakdown: {
      skillMatch,
      experienceScore,
      seniorityScore
    },
    matchedSkills,
    missingSkills
  };
}

/**
 * Complete Suitability Evaluation (Tier 1 + Tier 2)
 */
export function evaluateJobSuitability(
  job: JobEvaluationInput,
  track: CandidateTrack = DEFAULT_TRACK
): EvaluationResult {
  const t1 = evaluateTier1(job, track);

  if (!t1.passed) {
    return {
      tier1Passed: false,
      tier1Reason: t1.reason,
      fitScore: 0,
      breakdown: { skillMatch: 0, experienceScore: 0, seniorityScore: 0 },
      matchedSkills: [],
      missingSkills: track.skills,
      badgeToken: 'status-low',
      badgeLabel: 'Ineligible'
    };
  }

  const t2 = evaluateTier2(job, track);

  let badgeToken: 'status-top' | 'status-mid' | 'status-low' = 'status-low';
  let badgeLabel: 'Top Fit' | 'Exploratory' | 'Stretch' = 'Stretch';

  if (t2.fitScore >= 70) {
    badgeToken = 'status-top';
    badgeLabel = 'Top Fit';
  } else if (t2.fitScore >= 40) {
    badgeToken = 'status-mid';
    badgeLabel = 'Exploratory';
  }

  return {
    tier1Passed: true,
    fitScore: t2.fitScore,
    breakdown: t2.breakdown,
    matchedSkills: t2.matchedSkills,
    missingSkills: t2.missingSkills,
    badgeToken,
    badgeLabel
  };
}
