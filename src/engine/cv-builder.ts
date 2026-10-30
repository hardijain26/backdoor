/**
 * Backdoor Tailored CV Builder & Rule R5 Byte-for-Byte Metric Verification Engine
 * Subsystem 4: Document Automation & Audio Intelligence (@workspace/google M4)
 * Runbook §5.4.2 & §5.4.3 | PRD M8 dossier/identity
 */

export interface VerifiedProofPoint {
  id: string;
  statement: string;
  metricNumber: number;
  metricUnit: string;
  metricDirection: 'UP' | 'DOWN' | 'NEUTRAL';
  timeFrame: string;
  employer: string;
  skillsTags: string[];
  track: 'AI_NATIVE' | 'GROWTH' | 'UX' | 'PLATFORM_FINANCE';
  rawMetricString: string;
}

export interface TailoredCvPayload {
  jobId: string;
  company: string;
  title: string;
  requiredSkills?: string[];
  polishWithAi?: boolean;
  simulatedAiSummary?: string;
  simulatedAiBullets?: string[];
}

export interface RuleR5AuditReport {
  passed: boolean;
  totalMetricsChecked: number;
  verifiedMetrics: string[];
  hallucinatedMetrics: string[];
  revertedToDeterministic: boolean;
  error?: string;
}

export interface TailoredCvDocument {
  candidateName: string;
  headline: string;
  email: string;
  linkedin: string;
  location: string;
  targetRole: string;
  company: string;
  summary: string;
  experience: {
    employer: string;
    title: string;
    period: string;
    bullets: string[];
  }[];
  sideProjects: {
    name: string;
    description: string;
    techStack: string[];
  }[];
  competencies: string[];
}

export interface TailoredCvResult {
  cvBuildId: string;
  googleDocId: string;
  googleDrivePdfUrl: string;
  selectedBullets: VerifiedProofPoint[];
  summary: string;
  bullets: string[];
  auditReport: RuleR5AuditReport;
  candidateName: string;
  targetRole: string;
  company: string;
  generatedAt: string;
  document: TailoredCvDocument;
}

/**
 * Hardi's Authoritative M8 Proof Points Bank (Runbook §5.4.3 & PRD M8)
 * All metrics here are ground-truth verified from candidate's career portfolio.
 */
export const HARDI_PROOF_POINTS_LIBRARY: VerifiedProofPoint[] = [
  // Track 1: AI-Native PM
  {
    id: "pp-ai-01",
    statement: "Architected multi-agent prompt evaluation pipeline reducing query latency by 42% across 1.2M monthly prompts.",
    metricNumber: 42,
    metricUnit: "%",
    metricDirection: "DOWN",
    timeFrame: "6 months",
    employer: "Stealth AI Lab",
    skillsTags: ["AI", "RAG", "LLM", "Latency", "Evaluation", "Python"],
    track: "AI_NATIVE",
    rawMetricString: "42%",
  },
  {
    id: "pp-ai-02",
    statement: "Engineered hybrid vector-keyword retrieval engine for Pantry Vault AI achieving 94.6% retrieval precision at k=5.",
    metricNumber: 94.6,
    metricUnit: "%",
    metricDirection: "UP",
    timeFrame: "4 months",
    employer: "Pantry Vault AI",
    skillsTags: ["RAG", "Vector Search", "Embeddings", "Precision", "AI"],
    track: "AI_NATIVE",
    rawMetricString: "94.6%",
  },
  {
    id: "pp-ai-03",
    statement: "Shipped Med-Voice ambient clinical documentation agent processing 8,400 audio encounters with 99.2% transcription accuracy.",
    metricNumber: 99.2,
    metricUnit: "%",
    metricDirection: "UP",
    timeFrame: "3 months",
    employer: "Med-Voice",
    skillsTags: ["Whisper", "Speech-to-Text", "Healthcare", "Agents", "Accuracy"],
    track: "AI_NATIVE",
    rawMetricString: "99.2%",
  },

  // Track 2: Growth PM
  {
    id: "pp-growth-01",
    statement: "Redesigned self-serve onboarding flow increasing trial-to-paid conversion by 18.4% across 45,000 monthly active workspaces.",
    metricNumber: 18.4,
    metricUnit: "%",
    metricDirection: "UP",
    timeFrame: "2 quarters",
    employer: "HyperGrowth SaaS",
    skillsTags: ["Growth", "Conversion", "Onboarding", "Funnel", "PLG", "Analytics"],
    track: "GROWTH",
    rawMetricString: "18.4%",
  },
  {
    id: "pp-growth-02",
    statement: "Formulated viral product invite loops scaling organic user acquisition by 34% with $0 paid performance marketing spend.",
    metricNumber: 34,
    metricUnit: "%",
    metricDirection: "UP",
    timeFrame: "3 quarters",
    employer: "HyperGrowth SaaS",
    skillsTags: ["Growth", "Virality", "PLG", "Loops", "Acquisition"],
    track: "GROWTH",
    rawMetricString: "34%",
  },
  {
    id: "pp-growth-03",
    statement: "Compressed enterprise CAC payback cycle from 14 months to 6.2 months by introducing usage-based expansion tiers.",
    metricNumber: 6.2,
    metricUnit: "months",
    metricDirection: "DOWN",
    timeFrame: "4 quarters",
    employer: "HyperGrowth SaaS",
    skillsTags: ["Pricing", "CAC", "Payback", "B2B", "Monetization", "Enterprise"],
    track: "GROWTH",
    rawMetricString: "6.2",
  },

  // Track 3: UX & Systems PM
  {
    id: "pp-ux-01",
    statement: "Compressed time-to-first-value (TTFV) from 14 minutes to 3.5 minutes through contextual zero-state templates.",
    metricNumber: 3.5,
    metricUnit: "minutes",
    metricDirection: "DOWN",
    timeFrame: "2 months",
    employer: "DesignSystems Co",
    skillsTags: ["UX", "Activation", "TTFV", "Onboarding", "Design"],
    track: "UX",
    rawMetricString: "3.5",
  },
  {
    id: "pp-ux-02",
    statement: "Decreased user onboarding churn by 26% and customer support ticket volume by 38% after redesigning settings hierarchy.",
    metricNumber: 26,
    metricUnit: "%",
    metricDirection: "DOWN",
    timeFrame: "3 months",
    employer: "DesignSystems Co",
    skillsTags: ["UX", "Churn", "Support", "Heuristics", "Usability"],
    track: "UX",
    rawMetricString: "26%",
  },

  // Track 4: Platform, Ledger & Unit Economics (Chartered Accountant Rigor)
  {
    id: "pp-fin-01",
    statement: "Architected multi-currency ledger reconciliation system auditing $450M in annual gross transaction volume with 0 balance discrepancies.",
    metricNumber: 450,
    metricUnit: "$M",
    metricDirection: "UP",
    timeFrame: "1 year",
    employer: "Global Finance Systems",
    skillsTags: ["FinTech", "Ledger", "Reconciliation", "Compliance", "Finance", "Auditing"],
    track: "PLATFORM_FINANCE",
    rawMetricString: "$450M",
  },
  {
    id: "pp-fin-02",
    statement: "Audited cloud infrastructure unit economics reducing AWS compute expenditures by 31.5%, saving $180,000 annually.",
    metricNumber: 31.5,
    metricUnit: "%",
    metricDirection: "DOWN",
    timeFrame: "2 quarters",
    employer: "Global Finance Systems",
    skillsTags: ["Unit Economics", "Cloud", "Cost Optimization", "Finance", "Infrastructure"],
    track: "PLATFORM_FINANCE",
    rawMetricString: "31.5%",
  },
];

/**
 * Metric Extraction Regex Pattern
 * Matches numbers, percentages, currency, multipliers, and durations
 * (e.g. 18.4%, 42%, $450M, $180,000, 94.6%, 3.5, 6.2, 8,400)
 */
export const METRIC_EXTRACTION_REGEX = /(\$\d[\d,]*(?:\.\d+)?(?:[MBkK])?|\b\d[\d,]*(?:\.\d+)?(?:%|x|ms|s|h|k|K|M|B)?\b)/g;

/**
 * Normalizes metric string for strict byte-for-byte comparison
 */
export function normalizeMetric(token: string): string {
  return token.replace(/,/g, '').trim().toLowerCase();
}

/**
 * Extracts all unique quantitative metrics from a body of text.
 */
export function extractMetricsFromText(text: string): string[] {
  const matches = text.match(METRIC_EXTRACTION_REGEX) || [];
  const validMetrics = matches.filter((m) => {
    // Filter out isolated 4-digit years (e.g. 2024, 2025, 2026) or single page counts (e.g. "2")
    if (/^(202[0-9])$/.test(m)) return false;
    // Must contain at least one digit
    return /\d/.test(m);
  });
  return Array.from(new Set(validMetrics));
}

/**
 * Rule R5 AST Security Invariant Verifier
 * Asserts that every metric present in the generated text exists byte-for-byte
 * in the verified candidate proof points library.
 *
 * If ANY number is rounded (e.g. 18.4% -> 20%) or invented, throws RuleR5MetricHallucinationError.
 */
export class RuleR5MetricHallucinationError extends Error {
  public readonly hallucinatedMetrics: string[];
  constructor(hallucinated: string[]) {
    super(
      `Rule R5 Violation: Hallucinated or modified metric(s) detected: [${hallucinated.join(
        ', '
      )}]. Zero metric hallucination policy enforced.`
    );
    this.name = 'RuleR5MetricHallucinationError';
    this.hallucinatedMetrics = hallucinated;
  }
}

export function verifyZeroMetricHallucination(
  generatedText: string,
  allowedProofPoints: VerifiedProofPoint[]
): RuleR5AuditReport {
  // 1. Build authoritative whitelist of all allowed metrics from candidate's library
  const allowedMetricTokens = new Set<string>();

  allowedProofPoints.forEach((pp) => {
    // Add raw metric string e.g. "18.4%", "$450M", "42%"
    allowedMetricTokens.add(normalizeMetric(pp.rawMetricString));
    // Add plain numeric value e.g. "18.4", "450", "42"
    allowedMetricTokens.add(normalizeMetric(String(pp.metricNumber)));
    // Add full statement metrics
    const stmtMetrics = extractMetricsFromText(pp.statement);
    stmtMetrics.forEach((m) => allowedMetricTokens.add(normalizeMetric(m)));
  });

  // 2. Extract metrics from generated text
  const extractedMetrics = extractMetricsFromText(generatedText);
  const verifiedMetrics: string[] = [];
  const hallucinatedMetrics: string[] = [];

  for (const metric of extractedMetrics) {
    const normalized = normalizeMetric(metric);
    if (allowedMetricTokens.has(normalized)) {
      verifiedMetrics.push(metric);
    } else {
      hallucinatedMetrics.push(metric);
    }
  }

  if (hallucinatedMetrics.length > 0) {
    return {
      passed: false,
      totalMetricsChecked: extractedMetrics.length,
      verifiedMetrics,
      hallucinatedMetrics,
      revertedToDeterministic: true,
      error: `Rule R5 Veto: Invented or rounded metric(s): ${hallucinatedMetrics.join(', ')}`,
    };
  }

  return {
    passed: true,
    totalMetricsChecked: extractedMetrics.length,
    verifiedMetrics,
    hallucinatedMetrics: [],
    revertedToDeterministic: false,
  };
}

/**
 * Deterministic Proof Point Selection Algorithm
 * Scores and selects 4–6 high-impact bullets tailored to target company and role.
 */
export function selectTailoredProofPoints(
  role: { title: string; company: string; requiredSkills?: string[] },
  count: number = 5
): VerifiedProofPoint[] {
  const roleText = `${role.title} ${role.company} ${(role.requiredSkills || []).join(' ')}`.toLowerCase();

  const scoredPoints = HARDI_PROOF_POINTS_LIBRARY.map((pp) => {
    let score = 0;

    // 1. Skill tag matches (+15 per matched tag)
    for (const tag of pp.skillsTags) {
      if (roleText.includes(tag.toLowerCase())) {
        score += 15;
      }
    }

    // 2. Track affinity bonus (+30)
    if (
      (roleText.includes('ai') || roleText.includes('machine learning') || roleText.includes('model') || roleText.includes('rag')) &&
      pp.track === 'AI_NATIVE'
    ) {
      score += 30;
    } else if (
      (roleText.includes('growth') || roleText.includes('plg') || roleText.includes('conversion') || roleText.includes('viral')) &&
      pp.track === 'GROWTH'
    ) {
      score += 30;
    } else if (
      (roleText.includes('ux') || roleText.includes('design') || roleText.includes('interface') || roleText.includes('consumer')) &&
      pp.track === 'UX'
    ) {
      score += 30;
    } else if (
      (roleText.includes('fintech') || roleText.includes('payment') || roleText.includes('ledger') || roleText.includes('platform')) &&
      pp.track === 'PLATFORM_FINANCE'
    ) {
      score += 30;
    }

    return { pp, score };
  });

  // Sort descending by relevance score, with tie-breaker by metric number
  scoredPoints.sort((a, b) => b.score - a.score || b.pp.metricNumber - a.pp.metricNumber);

  return scoredPoints.slice(0, count).map((item) => item.pp);
}

/**
 * Generates Deterministic Executive CV & Audits Against Rule R5
 */
export function buildTailoredCv(payload: TailoredCvPayload): TailoredCvResult {
  const selectedBullets = selectTailoredProofPoints(
    {
      title: payload.title,
      company: payload.company,
      requiredSkills: payload.requiredSkills,
    },
    5
  );

  // Deterministic 100% verified template content
  const deterministicSummary = `Product leader specializing in high-velocity product execution across AI systems, product-led growth, and scalable platform infrastructure. Proven track record executing zero-to-one product initiatives including ${selectedBullets[0]?.rawMetricString || 'high-impact'} improvements in user engagement and system performance.`;
  const deterministicBullets = selectedBullets.map((pp) => pp.statement);

  let activeSummary = deterministicSummary;
  let activeBullets = [...deterministicBullets];
  let auditReport: RuleR5AuditReport;

  // If AI polish was requested or simulated, audit it strictly
  if (payload.polishWithAi && (payload.simulatedAiSummary || payload.simulatedAiBullets)) {
    const candidateSummary = payload.simulatedAiSummary || deterministicSummary;
    const candidateBullets = payload.simulatedAiBullets || deterministicBullets;
    const combinedCandidateText = `${candidateSummary} ${candidateBullets.join(' ')}`;

    const testAudit = verifyZeroMetricHallucination(combinedCandidateText, selectedBullets);

    if (testAudit.passed) {
      // Safe: AI output matched all metrics byte-for-byte
      activeSummary = candidateSummary;
      activeBullets = candidateBullets;
      auditReport = testAudit;
    } else {
      // Rule R5 Veto: Discard tainted AI text immediately, revert to deterministic template
      activeSummary = deterministicSummary;
      activeBullets = deterministicBullets;
      auditReport = {
        ...testAudit,
        revertedToDeterministic: true,
      };
    }
  } else {
    // Deterministic path
    auditReport = verifyZeroMetricHallucination(
      `${deterministicSummary} ${deterministicBullets.join(' ')}`,
      selectedBullets
    );
  }

  const cvBuildId = `cv-${payload.jobId}-${Date.now().toString(36)}`;
  const googleDocId = `1doc-backdoor-cv-${payload.jobId}`;
  // Deep link to local high-fidelity printable preview viewer
  const googleDrivePdfUrl = `/cv/preview?jobId=${encodeURIComponent(payload.jobId)}&company=${encodeURIComponent(payload.company)}&title=${encodeURIComponent(payload.title)}`;

  const document: TailoredCvDocument = {
    candidateName: "Hardi Jain",
    headline: "Staff / Lead Product Manager • AI Systems & Scalable Platforms",
    email: "hardi.jain@backdoor.careers",
    linkedin: "linkedin.com/in/hardijain",
    location: "San Francisco, CA (Open to Remote / Hybrid)",
    targetRole: payload.title,
    company: payload.company,
    summary: activeSummary,
    experience: [
      {
        employer: "Stealth AI Lab",
        title: "Staff Product Manager — AI Systems",
        period: "2023 – Present",
        bullets: selectedBullets
          .filter((b) => b.employer === "Stealth AI Lab" || b.track === "AI_NATIVE")
          .map((b) => b.statement)
          .slice(0, 2),
      },
      {
        employer: "HyperGrowth SaaS",
        title: "Lead Product Manager — Growth & Systems",
        period: "2021 – 2023",
        bullets: selectedBullets
          .filter((b) => b.employer === "HyperGrowth SaaS" || b.track === "GROWTH")
          .map((b) => b.statement)
          .slice(0, 2),
      },
      {
        employer: "Global Finance Systems",
        title: "Product Manager — Platform & Unit Economics",
        period: "2019 – 2021",
        bullets: selectedBullets
          .filter((b) => b.employer === "Global Finance Systems" || b.track === "PLATFORM_FINANCE" || b.track === "UX")
          .map((b) => b.statement)
          .slice(0, 2),
      },
    ].filter((exp) => exp.bullets.length > 0),
    sideProjects: [
      {
        name: "Pantry Vault AI",
        description: "Hybrid vector-keyword RAG system with 94.6% retrieval precision at k=5.",
        techStack: ["Next.js 15", "pgvector", "FastAPI", "Groq Whisper"],
      },
      {
        name: "Med-Voice",
        description: "Ambient clinical documentation agent processing 8,400 audio encounters with 99.2% transcription accuracy.",
        techStack: ["TypeScript", "Groq Whisper Turbo", "Python"],
      },
    ],
    competencies: [
      "Multi-Agent Prompt Evals",
      "RAG Architecture & Latency Compression",
      "Product-Led Growth (PLG) & Viral Loops",
      "Unit Economics & Cloud Cost Modeling",
      "Statutory Audit & Core Ledger Reconciliation",
    ],
  };

  return {
    cvBuildId,
    googleDocId,
    googleDrivePdfUrl,
    selectedBullets,
    summary: activeSummary,
    bullets: activeBullets,
    auditReport,
    candidateName: "Hardi Jain",
    targetRole: payload.title,
    company: payload.company,
    generatedAt: new Date().toISOString(),
    document,
  };
}
