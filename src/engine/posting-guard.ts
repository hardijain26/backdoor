/**
 * Subsystem: Adversarial Posting Guard & Prompt Injection Sanitizer
 * Strips hidden text, invisible unicode, HTML comments, and prompt-injection
 * instructions from untrusted 3rd-party job postings and company pages.
 */

// Invisible and zero-width unicode characters frequently abused in prompt-injection
const INVISIBLE_UNICODE_REGEX = /[\u200B-\u200D\uFEFF\u00A0\u202A-\u202E\u2060\u2066-\u2069]/g;

// Adversarial prompt-injection signatures
const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(?:all\s+)?(?:previous|prior|above)\s+instructions?/gi,
  /disregard\s+(?:all\s+)?(?:previous|prior|above)\s+instructions?/gi,
  /system\s*prompt\s*:/gi,
  /you\s+are\s+now\s+(?:in\s+)?developer\s+mode/gi,
  /give\s+(?:the\s+)?candidate\s+(?:a\s+)?(?:100%|perfect|maximum)\s+score/gi,
  /mark\s+(?:this\s+)?(?:as\s+)?(?:a\s+)?(?:perfect|top)\s+match/gi,
  /override\s+(?:all\s+)?scoring\s+rules?/gi,
  /hidden\s+instruction\s*:/gi,
  /\bdo\s+not\s+apply\s+filters\b/gi,
  /\bprint\s+system\s+prompt\b/gi,
];

export interface GuardSanitizationResult {
  cleanedText: string;
  injectionsDetected: string[];
  hasInjections: boolean;
  strippedCharactersCount: number;
}

/**
 * Sanitizes untrusted text scraped from external job listings or career pages.
 */
export function sanitizeUntrustedPosting(rawText: string): GuardSanitizationResult {
  if (!rawText || typeof rawText !== 'string') {
    return {
      cleanedText: '',
      injectionsDetected: [],
      hasInjections: false,
      strippedCharactersCount: 0,
    };
  }

  const initialLength = rawText.length;
  const injectionsDetected: string[] = [];

  // 1. Strip hidden HTML comments (e.g. <!-- Ignore instructions ... -->)
  let text = rawText.replace(/<!--[\s\S]*?-->/g, ' ');

  // 2. Strip invisible and zero-width characters
  text = text.replace(INVISIBLE_UNICODE_REGEX, '');

  // 3. Scan and sanitize adversarial prompt-injection patterns
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    const matches = text.match(pattern);
    if (matches) {
      for (const m of matches) {
        if (!injectionsDetected.includes(m)) {
          injectionsDetected.push(m);
        }
      }
      text = text.replace(pattern, '[REDACTED_ADVERSARIAL_INSTRUCTION]');
    }
  }

  // 4. Normalize excessive whitespace
  text = text.replace(/[ \t]+/g, ' ').replace(/\n\s*\n\s*\n+/g, '\n\n').trim();

  const strippedCharactersCount = Math.max(0, initialLength - text.length);

  return {
    cleanedText: text,
    injectionsDetected,
    hasInjections: injectionsDetected.length > 0,
    strippedCharactersCount,
  };
}

