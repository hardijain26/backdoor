/**
 * Subsystem: Anti-AI Fluff & Executive Tone Linter
 * Enforces human, concise, metric-grounded executive communication.
 * Inspired by ai-job-search style guides & Backdoor precision standards.
 */

export const FORBIDDEN_CLICHES: string[] = [
  'passionate about',
  'great fit',
  'perfect fit',
  'hit the ground running',
  'drive results',
  'driving results',
  'leverage my skills',
  'leverage my experience',
  'synergies',
  'synergy',
  'fast-paced environment',
  'proven track record',
  'dynamic team',
  'think outside the box',
  'hard worker',
  'go-getter',
  'results-driven',
  'results oriented',
  'value-add',
  'seamlessly',
  'delighted to apply',
  'excited to apply',
  'thrilled to apply',
  'in today\'s fast-paced',
  'in today\'s competitive',
  'wear many hats'
];

export interface ToneLintResult {
  passed: boolean;
  score: number; // 0 - 100
  violations: string[];
  hasEmDash: boolean;
  hasPassiveQualifiers: boolean;
  cleanedText: string;
}

/**
 * Replaces em-dashes and double-hyphens with standard punctuation
 */
export function removeEmDashes(text: string): string {
  return text
    .replace(/\s*—\s*/g, ', ')
    .replace(/\s*–\s*/g, ', ')
    .replace(/\s*--\s*/g, ', ');
}

/**
 * Replaces weak qualifiers with authoritative executive voice
 */
export function hardenVoice(text: string): string {
  return text
    .replace(/\bI believe I can\b/gi, 'I will')
    .replace(/\bI think I would\b/gi, 'I am positioned to')
    .replace(/\bI feel that my\b/gi, 'My')
    .replace(/\bI hope to\b/gi, 'I plan to');
}

/**
 * Lints and cleans outreach notes and CV bullet points
 */
export function lintExecutiveTone(text: string): ToneLintResult {
  const violations: string[] = [];
  let cleaned = text;

  // 1. Check for Em-Dashes
  const hasEmDash = /[—–]|--/.test(text);
  if (hasEmDash) {
    violations.push('Found AI-signature em-dash (—/--). Replaced with crisp punctuation.');
    cleaned = removeEmDashes(cleaned);
  }

  // 2. Check for Forbidden AI Clichés
  for (const cliche of FORBIDDEN_CLICHES) {
    const regex = new RegExp(`\\b${cliche.replace(/'/g, "\\'")}\\b`, 'gi');
    if (regex.test(cleaned)) {
      violations.push(`Contains forbidden AI cliché: "${cliche}"`);
      // Strip or replace cliché
      cleaned = cleaned.replace(regex, '');
    }
  }

  // 3. Check for passive qualifiers
  const hasPassiveQualifiers = /\b(I believe I can|I think I would|I feel that)\b/i.test(cleaned);
  if (hasPassiveQualifiers) {
    violations.push('Contains weak passive qualifiers. Hardened to executive active voice.');
    cleaned = hardenVoice(cleaned);
  }

  // Clean double spaces created by cliché stripping
  cleaned = cleaned.replace(/\s{2,}/g, ' ').replace(/\s+([.,;:])/g, '$1').trim();

  // Score calculation: 100 - (15 per violation)
  const score = Math.max(0, 100 - violations.length * 15);
  const passed = violations.length === 0 || score >= 80;

  return {
    passed,
    score,
    violations,
    hasEmDash,
    hasPassiveQualifiers,
    cleanedText: cleaned
  };
}
