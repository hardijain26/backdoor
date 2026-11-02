# Universal Semantic Grammar & TypeScript Implementation Specification

**Document Title:** The Universal Standardization Engine & Complete TypeScript Codebase  
**Subsystem:** Module 5 (`@intel/teardown`)  
**Architecture Mandate:** Standardize the Semantic Grammar across all roles without creating separate templates.  
**Database Decision:** Zero-Migration (Persists to existing `company_briefs` and `evaluations` JSONB columns).  

---

## 1. The Universal Standardization Engine Overview

```
                       [ UNIVERSAL STANDARDIZATION ENGINE ]
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  [ FORMULA 1 ]                    [ FORMULA 2 ]                    [ FORMULA 3 ]
  Diagnostic Questions             2-3 Conversation Pitch           The "Dual-Track"
  [Macro Fact] + [Review Counter]  [Problem] ──> [Departmental      30-60-90 Options
  + [Open Dilemma (No Solution)]    Opportunity (Revenue/Speed)]    (Velocity vs. Scalability)
```

By standardizing the **grammar and logical formulas**, Backdoor supports **thousands of job titles** deterministically without writing dozens of brittle markdown template files.

---

## 2. The Three Canonical Semantic Formulas

---

### Formula 1: The Standardized Diagnostic Question Grammar

Every role’s 3 diagnostic questions follow a strict **3-part semantic anatomy**:

$$\mathbf{\text{Question}} = \underbrace{\text{[Verified Macro/Financial Fact]}}_{\text{Part A (Proof of Research)}} + \underbrace{\text{[Observed Friction/Competitor Signal]}}_{\text{Part B (The Reality Check)}} + \underbrace{\text{[Open Dilemma / Trade-Off]}}_{\text{Part C (Zero Solution)}}$$

* **Part A (Verified Macro/Financial Fact):** Cites an authentic legal/financial metric from 10-K, earnings calls, or Crunchbase.
* **Part B (Observed Friction/Competitor Signal):** References an unvarnished review complaint or competitor attack angle from G2, App Store, or Trustpilot.
* **Part C (The Open Dilemma):** Asks a diagnostic trade-off question that **withholds all solutions**, forcing the manager to explain internal constraints.

#### Formula 1 Mapping Across All Roles:
| Target Role | Part A: Verified Fact (10-K / PR) | Part B: Observed Friction (Reviews / Tech) | Part C: The Open Trade-Off (Zero Solution) |
| :--- | :--- | :--- | :--- |
| **Product Manager** | *"Leadership emphasized moving toward a self-serve PLG engine..."* | *"...yet customer feedback on Reddit indicates a 25% drop-off during initial workspace configuration..."* | *"...how is the team weighing self-serve UX simplicity against the advanced configuration needs of enterprise admins?"* |
| **Software Engineer** | *"Leadership announced a priority to scale microservices globally..."* | *"...yet recent GitHub PR logs and status pages show intermittent checkout latency spikes..."* | *"...how is the team currently balancing technical debt refactoring against hitting new feature deadlines?"* |
| **Finance / FP&A** | *"I noticed in the latest 10-K that gross margin compressed by 800 basis points due to infrastructure hosting..."* | *"...yet customer reviews on G2 show users expect AI capabilities for free without tier upgrades..."* | *"...how is finance currently modeling the trade-off between customer churn risk and charging for high-cost API usage?"* |
| **Corporate Strategy**| *"With cash reserves accumulating and core market growth plateauing..."* | *"...while 41% of enterprise prospects state on G2 they walked away because they couldn't purchase modular components..."* | *"...is leadership currently prioritizing acquiring an adjacent tool, or building the missing capabilities in-house?"* |
| **Sales (AE)** | *"The company is targeting 30% ARR expansion in mid-market..."* | *"...yet G2 reviews show prospects stall when encountering the 300% price jump to Enterprise..."* | *"...is the bigger friction deal drop-off at procurement, or losing head-to-head bake-offs to cheaper rivals?"* |
| **Customer Success** | *"The company expanded customer acquisition by 40% last quarter..."* | *"...yet Trustpilot reviews report support ticket SLA response times increasing from 2h to 24h..."* | *"...is the team feeling more pressure from onboarding bottlenecks or customer churn at the annual renewal mark?"* |
| **Founder's Office** | *"The CEO outlined plans to reach \$20M ARR without adding headcount..."* | *"...yet Trustpilot shows silent data-import errors creating dozens of manual support tickets daily..."* | *"...where does the founder currently feel the biggest operational drag: cross-team handoffs or executive context switching?"* |

---

### Formula 2: The Standardized 2–3 Conversation Progression Pitch

Every role executes this standardized **3-step conversational ladder**:

```
[ CONVERSATION 1: Problem Validation ]   
"Based on external reviews, is [Friction X] the main challenge this role is hired to fix?"
                  │
                  ▼
[ CONVERSATION 2: Departmental Opportunity Sizing ]
"If we fix [Friction X], here is the upside for YOUR specific department's KPI [Y]."
                  │
                  ▼
[ CONVERSATION 3: The 2-Option Alignment ]
"There are two ways to stage this: Path A (Speed) vs. Path B (Scalability). Which fits your OKRs?"
```

#### Departmental Economic Currency Table:
* **Product Management:** *Time-to-Value (TTV), Trial-to-Paid Activation %, 30-Day Cohort Retention, Net Revenue Retention (NRR).*
* **Engineering / Tech:** *p99 Latency stability, Uptime SLAs, CI/CD PR cycle times, Developer hours saved per sprint.*
* **Finance / FP&A:** *EBITDA Margin, Free Cash Flow (FCF) conversion, Gross Margin recovery, Burn multiple reduction.*
* **Corporate Strategy:** *TAM expansion, LTV:CAC ratio improvement, Gross Margin expansion, M&A thesis ROI.*
* **Sales / GTM:** *Pipeline velocity, Average Contract Value (ACV) defense, Shortened trial-to-close days.*
* **Customer Success:** *Gross Revenue Retention (GRR), Net Promoter Score (NPS), First Contact Resolution (FCR).*
* **Founder's Office:** *Founder bandwidth hours saved per week, elimination of cross-functional silos, burn rate triage.*

---

### Formula 3: The Standardized Dual-Track 30–60–90 Day Menu of Options

Every roadmap is standardized into a **two-track collaborative menu**:

```
┌────────────────────────────────────────────────────────────────────────┐
│ THE UNIVERSAL DUAL-TRACK 30-60-90 DAY ENGINE                           │
├────────────────────────────────────────────────────────────────────────┤
│ DAYS 0–30: THE AUDIT & DISCOVERY BASELINE (Common to both tracks)      │
│ • Audit top 10 customer escalations + interview 5 cross-functional leads│
├────────────────────────────────────────────────────────────────────────┤
│ DAYS 30–60: THE DIVERGENT MULTIPLIER HORIZON                           │
│ • Track A (Velocity Path): Deploy immediate tactical patch / playbook  │
│ • Track B (Scalability Path): Refactor core data model / process flow  │
├────────────────────────────────────────────────────────────────────────┤
│ DAYS 60–90: THE STRATEGIC IMPACT HORIZON                               │
│ • Track A (Velocity Path): Harvest quick-win departmental KPI uplift   │
│ • Track B (Scalability Path): Package new scalable asset / enterprise tier│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Complete Production TypeScript Codebase

### 3.1 Archetypes Registry (`src/types/archetypes.ts`)

```typescript
export type RoleArchetype =
  | 'PRODUCT_MANAGEMENT'
  | 'PRODUCT_DESIGN'
  | 'ENGINEERING_TECH'
  | 'FINANCE_ACCOUNTING'
  | 'CORPORATE_STRATEGY_BIZOPS'
  | 'FOUNDER_OFFICE'
  | 'SALES_GTM'
  | 'MARKETING_GROWTH'
  | 'OPERATIONS_CS'
  | 'LEGAL_COMPLIANCE'
  | 'PEOPLE_TALENT';

export interface ArchetypeProfile {
  name: RoleArchetype;
  departmentName: string;
  businessCurrency: string;
  vocabularyTokens: string[];
  coreFailureModes: string[];
  seniorManagerTitle: string;
  velocityTrackFocus: string;
  scalabilityTrackFocus: string;
}

export const ARCHETYPE_PROFILES: Record<RoleArchetype, ArchetypeProfile> = {
  PRODUCT_MANAGEMENT: {
    name: 'PRODUCT_MANAGEMENT',
    departmentName: 'Product Management',
    businessCurrency: 'Feature Adoption %, Cohort Retention, Time-to-Value (TTV), Net Revenue Retention (NRR), and Roadmap Velocity',
    vocabularyTokens: ['North Star metric', 'Time-to-Value (TTV)', 'PRD', 'opportunity sizing', 'retention curves', 'feature cannibalization', 'PLG flywheel', 'technical debt allocation'],
    coreFailureModes: ['users failing to reach the "Aha!" moment', 'high drop-off during self-serve workspace configuration', 'churn driven by breaking changes', 'enterprise customers blocked by missing RBAC'],
    seniorManagerTitle: 'VP of Product / Chief Product Officer (CPO)',
    velocityTrackFocus: 'Deploying self-serve interactive onboarding recipes to cut Time-to-Value (TTV) by 30%',
    scalabilityTrackFocus: 'Standardizing an outcome-driven product prioritization framework to eliminate roadmap spillover'
  },

  PRODUCT_DESIGN: {
    name: 'PRODUCT_DESIGN',
    departmentName: 'Product Design & User Experience',
    businessCurrency: 'Task Completion Rate, Usability Heuristic Scores, Drop-off %, and CSAT',
    vocabularyTokens: ['design system tokens', 'cognitive load', 'heuristic evaluation', 'micro-interactions', 'information architecture', 'wireframe', 'Figma components'],
    coreFailureModes: ['unintuitive multi-step forms', 'hidden actions causing user confusion', 'poor mobile viewport responsiveness', 'silent error feedback'],
    seniorManagerTitle: 'Head of Design / VP of User Experience',
    velocityTrackFocus: 'Redesigning the top 3 high-friction configuration screens causing support tickets',
    scalabilityTrackFocus: 'Establishing a unified, tokenized Figma-to-React design system component library'
  },

  ENGINEERING_TECH: {
    name: 'ENGINEERING_TECH',
    departmentName: 'Engineering & Infrastructure',
    businessCurrency: 'p99 Latency, Uptime SLAs, CI/CD Build Velocity, and Technical Debt Ratio',
    vocabularyTokens: ['microservices', 'p99 latency', 'event-driven queue', 'cold start', 'test sharding', 'PR merge time', 'on-call alert fatigue', 'idempotency'],
    coreFailureModes: ['synchronous timeout spikes', 'flaky test suites causing 45m PR wait times', 'unmanaged database query locks', 'on-call burnout'],
    seniorManagerTitle: 'Head of Engineering / VP of Technology',
    velocityTrackFocus: 'Sharding CI/CD test suites to unblock PR merge delays',
    scalabilityTrackFocus: 'Refactoring synchronous endpoints to asynchronous event brokers'
  },

  FINANCE_ACCOUNTING: {
    name: 'FINANCE_ACCOUNTING',
    departmentName: 'Corporate Finance & FP&A',
    businessCurrency: 'EBITDA Margin, Free Cash Flow (FCF) Conversion, Gross Margin Health, Burn Multiple, and Forecast Variance',
    vocabularyTokens: ['EBITDA margin', 'Free Cash Flow (FCF)', 'Rule of 40', 'gross margin drag', 'burn multiple', 'budget vs actual variance', 'COGS allocation', 'CapEx vs OpEx', 'unit economics'],
    coreFailureModes: ['unbudgeted cloud hosting cost blowouts', 'gross margin compression due to manual onboarding', 'opaque revenue recognition', 'delayed month-end close cycles'],
    seniorManagerTitle: 'Chief Financial Officer (CFO) / VP of Finance',
    velocityTrackFocus: 'Auditing variable COGS cost drivers (cloud infrastructure & vendor SaaS) to eliminate 15% of wasteful spend',
    scalabilityTrackFocus: 'Building an automated real-time rolling financial forecast model to replace static quarterly spreadsheets'
  },

  CORPORATE_STRATEGY_BIZOPS: {
    name: 'CORPORATE_STRATEGY_BIZOPS',
    departmentName: 'Corporate Strategy & Business Operations (BizOps)',
    businessCurrency: 'Gross Margin Expansion, Market Share in New Geographies/Segments, LTV:CAC Ratio, and Strategic Initiative ROI',
    vocabularyTokens: ['TAM expansion', 'pricing & packaging overhaul', 'unit economics', 'build vs buy vs partner', 'market adjacency', 'gross margin expansion', 'M&A thesis', 'LTV:CAC ratio'],
    coreFailureModes: ['top-line growth accelerating while unit economics deteriorate', 'unprofitable international expansion', 'tier cannibalization', 'failed post-merger integration'],
    seniorManagerTitle: 'Chief Strategy Officer (CSO) / Head of BizOps',
    velocityTrackFocus: 'Conducting a customer cohort margin audit across pricing tiers to patch immediate revenue leakage',
    scalabilityTrackFocus: 'Formulating a market expansion business case (build vs. buy) to unlock the mid-market enterprise segment'
  },

  FOUNDER_OFFICE: {
    name: 'FOUNDER_OFFICE',
    departmentName: "Founder's Office / Chief of Staff",
    businessCurrency: 'Founder Bandwidth Hours, Cross-Functional Execution Velocity, and Critical Initiative Triage',
    vocabularyTokens: ['founder leverage', 'cross-functional bottlenecks', 'firefighting bandwidth', 'operational drag', 'executive decision velocity', 'silent failure triage'],
    coreFailureModes: ['founder stuck firefighting daily support escalations', 'inter-departmental handoff delays between Product and Sales', 'silent onboarding drop-offs'],
    seniorManagerTitle: 'Founder & CEO',
    velocityTrackFocus: 'Patching the top 3 operational fires causing manual support escalations to free up 10h/week of founder bandwidth',
    scalabilityTrackFocus: 'Establishing a standardized cross-functional operating rhythm and executive dashboard across Product, Sales, and Eng'
  },

  SALES_GTM: {
    name: 'SALES_GTM',
    departmentName: 'Revenue / Commercial Sales',
    businessCurrency: 'Pipeline Velocity, Net New ARR, Win Rates, and Average Contract Value (ACV)',
    vocabularyTokens: ['outbound cadence', 'pricing cliffs', 'deal slip', 'procurement friction', 'bake-off', 'sales cycle length', 'ACV', 'discounting pressure'],
    coreFailureModes: ['prospects stalling on pricing tier jumps', 'losing deals to modular rivals', 'unresponsive sales engineering support', 'rigid contracts'],
    seniorManagerTitle: 'VP of Sales / Chief Revenue Officer',
    velocityTrackFocus: 'Resurrecting dormant pipeline accounts lost to competitor pricing',
    scalabilityTrackFocus: 'Standardizing pre-flight security evaluation decks to shorten sales cycles'
  },

  MARKETING_GROWTH: {
    name: 'MARKETING_GROWTH',
    departmentName: 'Growth & Demand Generation',
    businessCurrency: 'Blended CAC, Organic Search Market Share, and Trial Sign-up Velocity',
    vocabularyTokens: ['blended CAC', 'organic traffic conquesting', 'LTV:CAC', 'bottom-of-funnel conversion', 'messaging resonance', 'intent keywords'],
    coreFailureModes: ['generic corporate messaging', 'competitors outranking on alternative keywords', 'high ad spend with plateauing sign-ups'],
    seniorManagerTitle: 'Chief Marketing Officer (CMO)',
    velocityTrackFocus: 'Launching 3 competitor counter-comparison landing pages',
    scalabilityTrackFocus: 'Building an automated customer advocacy and review-generation engine'
  },

  OPERATIONS_CS: {
    name: 'OPERATIONS_CS',
    departmentName: 'Customer Success & Support Operations',
    businessCurrency: 'Gross Revenue Retention (GRR), Net Promoter Score (NPS), and Resolution SLAs',
    vocabularyTokens: ['First Contact Resolution (FCR)', 'ticket backlog', 'CSAT', 'Net Revenue Retention (NRR)', 'account health score', 'escalation path'],
    coreFailureModes: ['support SLA spikes from 2h to 24h', 'repetitive billing tickets', 'unresponsive onboarding reps', 'churn at annual renewal'],
    seniorManagerTitle: 'VP of Customer Success',
    velocityTrackFocus: 'Building automated macro recipes for the top 3 recurring billing inquiries',
    scalabilityTrackFocus: 'Implementing automated health-score triggers 60 days before contract renewal'
  },

  LEGAL_COMPLIANCE: {
    name: 'LEGAL_COMPLIANCE',
    departmentName: 'Legal & Enterprise Compliance',
    businessCurrency: 'Contract Redline Turnaround Time, Deal Procurement Velocity, and Regulatory Risk',
    vocabularyTokens: ['MSA fallback clauses', 'procurement cycle', 'indemnification caps', 'GDPR/DPDP compliance', 'SOC-2 audit', 'liability threshold'],
    coreFailureModes: ['deals stalled 45+ days in security review', 'unstandardized customer redlines', 'data localization liabilities'],
    seniorManagerTitle: 'General Counsel / Head of Legal',
    velocityTrackFocus: 'Publishing a pre-approved redline fallback guide for sales reps',
    scalabilityTrackFocus: 'Standardizing automated vendor security compliance packages'
  },

  PEOPLE_TALENT: {
    name: 'PEOPLE_TALENT',
    departmentName: 'Talent Acquisition & People Operations',
    businessCurrency: 'Time-to-Hire, Offer Acceptance Rate, eNPS, and First-Year Retention',
    vocabularyTokens: ['offer acceptance velocity', 'interviewer debrief loop', 'candidate drop-off', 'employer branding', 'compensation band calibration'],
    coreFailureModes: ['candidate ghosting during debriefs', 'uncalibrated compensation bands', 'high leadership attrition on Blind'],
    seniorManagerTitle: 'Chief People Officer / Head of Talent',
    velocityTrackFocus: 'Standardizing same-day interviewer debrief loops to eliminate drop-offs',
    scalabilityTrackFocus: 'Revamping technical employer branding on GitHub and engineering blogs'
  }
};
```

---

### 3.2 Role Classifier Engine (`src/engine/role-classifier.ts`)

```typescript
import { RoleArchetype } from '@/types/archetypes';

export function classifyArchetype(roleTitle: string): RoleArchetype {
  const t = roleTitle.toLowerCase();

  if (/product manager|pm\b|product lead|group pm|gpm|director of product|vp of product|cpo\b/i.test(t)) {
    return 'PRODUCT_MANAGEMENT';
  }
  if (/finance|fp&a|fpa|accounting|controller|treasury|financial analyst|cfo\b/i.test(t)) {
    return 'FINANCE_ACCOUNTING';
  }
  if (/strategy|corporate strategy|bizops|business operations|corp dev|cso\b|strategic planning/i.test(t)) {
    return 'CORPORATE_STRATEGY_BIZOPS';
  }
  if (/founder|chief of staff|cos\b|special projects/i.test(t)) {
    return 'FOUNDER_OFFICE';
  }
  if (/ux|ui\b|designer|design lead|product design|user researcher/i.test(t)) {
    return 'PRODUCT_DESIGN';
  }
  if (/software|engineer|developer|devops|sre|backend|frontend|fullstack|data engineer/i.test(t)) {
    return 'ENGINEERING_TECH';
  }
  if (/sales|account exec|sdr|bdr|revenue|cro\b|ae\b/i.test(t)) {
    return 'SALES_GTM';
  }
  if (/marketing|growth|seo|content|brand|demand gen|cmo\b/i.test(t)) {
    return 'MARKETING_GROWTH';
  }
  if (/customer success|support|csm|client ops|implementation/i.test(t)) {
    return 'OPERATIONS_CS';
  }
  if (/legal|counsel|compliance|regulatory/i.test(t)) {
    return 'LEGAL_COMPLIANCE';
  }
  if (/recruiter|talent|people|hr\b|hrbp/i.test(t)) {
    return 'PEOPLE_TALENT';
  }

  return 'CORPORATE_STRATEGY_BIZOPS'; // Default fallback
}
```

---

### 3.3 Dynamic Prompt Generator (`src/engine/prompt-builder.ts`)

```typescript
import { ARCHETYPE_PROFILES, RoleArchetype } from '@/types/archetypes';

export function buildRoleLanguagePrompt(params: {
  roleTitle: string;
  archetype: RoleArchetype;
  companyName: string;
  scopedProduct: string;
  intelPayload: any;
  candidateProofPoints: Array<{ id: string; metricText: string }>;
}) {
  const profile = ARCHETYPE_PROFILES[params.archetype];

  const systemPrompt = `
You are an Elite Executive Search Partner and Management Consultant.
You are preparing a high-value candidate for an interview for the role: "${params.roleTitle}"
Target Company: "${params.companyName}" | Scoped Product Line: "${params.scopedProduct}"
Functional Department: "${profile.departmentName}"
Hiring Manager Persona: "${profile.seniorManagerTitle}"

CRITICAL MANDATE — BUSINESS COMMON LANGUAGE:
You must frame all findings, opportunities, and proposals exclusively using the authentic vocabulary of ${profile.departmentName}.
Key Vocabulary to weave into the prose: ${profile.vocabularyTokens.join(', ')}.
The Hiring Manager's primary economic currency is: ${profile.businessCurrency}.

STRICT METHODOLOGICAL CONSTRAINTS:
1. RULE R5 (NO INVENTED METRICS): You may ONLY anchor proposals to the candidate's verified proof points below. Never generate fake past metrics:
${JSON.stringify(params.candidateProofPoints, null, 2)}

2. ZERO-SOLUTION DIAGNOSTIC QUESTIONS:
Formulate 3 exploratory diagnostic questions for the Hiring Manager.
MANDATE: Withhold all solutions in these questions. Do NOT suggest a fix. Ask deep trade-off questions that force the manager to explain their internal resource constraints.

3. DUAL-TRACK 30-60-90 DAY MENU OF OPTIONS:
Do NOT prescribe a single rigid solution. Present TWO collaborative execution tracks:
- Track A (The Velocity Path): Focuses on "${profile.velocityTrackFocus}".
- Track B (The Scalability Path): Focuses on "${profile.scalabilityTrackFocus}".
Conclude with a collaborative closing prompt inviting the manager to choose which path fits their quarterly OKRs.
`;

  const userPrompt = `
COMPANY INTELLIGENCE & REVIEWS:
${JSON.stringify(params.intelPayload, null, 2)}

Synthesize the strategic dossier adhering strictly to this JSON schema:
{
  "financialTranslation": "Plain-English interpretation of financial numbers in relation to this department",
  "departmentalProblemDiagnosis": "The specific operational or revenue friction impacting this role's team",
  "departmentalOpportunitySizing": "Quantified upside for the Hiring Manager if solved, framed in their currency",
  "threeDiagnosticQuestions": [
    { "type": "MACRO_FINANCIAL", "question": "..." },
    { "type": "COMPETITOR_PRODUCT", "question": "..." },
    { "type": "INTERNAL_EXECUTION", "question": "..." }
  ],
  "conversationProgression": {
    "call1_ProblemValidation": "Pitch to validate the friction exists without sounding arrogant",
    "call2_OpportunityPitch": "Script framing the departmental upside and economic leverage",
    "call3_AlignmentPrompt": "Collaborative transition into the 30-60-90 roadmap"
  },
  "dualTrackRoadmap": {
    "days0to30_CommonBaseline": "Common audit and listening horizon",
    "trackA_Velocity": {
      "days30to60": "Tactical patch",
      "days60to90": "Quick-win metric recovery",
      "proofPointId": "Exact ID from candidate proof points"
    },
    "trackB_Scalability": {
      "days30to60": "Structural architectural/process fix",
      "days60to90": "Scalable asset/tier rollout",
      "proofPointId": "Exact ID from candidate proof points"
    },
    "collaborativeClosingQuestion": "Question asking the manager which track takes more pressure off their desk"
  }
}
`;

  return { systemPrompt, userPrompt };
}
```

---

### 3.4 Zero-Migration Teardown Service (`src/engine/teardown.ts`)

Persists all synthesized intelligence into **existing Supabase tables** (`company_briefs` and `evaluations`) with zero migrations:

```typescript
import { createClient } from '@supabase/supabase-js';
import { classifyArchetype } from './role-classifier';
import { buildRoleLanguagePrompt } from './prompt-builder';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getOrGenerateTeardown(params: {
  jobId: string;
  userId: string;
  companyId: string;
  companyName: string;
  scopedProduct?: string;
  roleTitle: string;
  candidateProofPoints: Array<{ id: string; metricText: string }>;
  callLLM: (system: string, user: string) => Promise<string>;
}) {
  // 1. Check existing role teardown in public.evaluations (why_you_excel JSONB)
  const { data: existingEval } = await supabase
    .from('evaluations')
    .select('strategic_positioning_angle, tier2_breakdown, why_you_excel, score_booster_gaps')
    .eq('user_id', params.userId)
    .eq('job_id', params.jobId)
    .single();

  if (existingEval?.why_you_excel && Object.keys(existingEval.why_you_excel).length > 0) {
    return {
      departmentalOpportunity: existingEval.strategic_positioning_angle,
      diagnosticQuestions: existingEval.tier2_breakdown,
      dualTrackRoadmap: existingEval.why_you_excel,
      stakeholderScripts: existingEval.score_booster_gaps
    };
  }

  // 2. Fetch or initialize company-level intelligence from public.company_briefs (recent_news JSONB)
  const { data: existingBrief } = await supabase
    .from('company_briefs')
    .select('one_sentence_summary, funding_details, recent_news, fetched_at')
    .eq('company_id', params.companyId)
    .single();

  const scopedProduct = params.scopedProduct || params.companyName;
  const archetype = classifyArchetype(params.roleTitle);

  // 3. Build dynamic prompt and execute LLM synthesis
  const { systemPrompt, userPrompt } = buildRoleLanguagePrompt({
    roleTitle: params.roleTitle,
    archetype,
    companyName: params.companyName,
    scopedProduct,
    intelPayload: existingBrief?.recent_news || { companyName: params.companyName },
    candidateProofPoints: params.candidateProofPoints
  });

  const rawLLMResponse = await params.callLLM(systemPrompt, userPrompt);
  const synthesized = JSON.parse(rawLLMResponse);

  // 4. Rule R5 Validation: Proof points must exist in candidate's verified profile
  const validIds = new Set(params.candidateProofPoints.map((p) => p.id));
  const proofA = synthesized.dualTrackRoadmap.trackA_Velocity.proofPointId;
  const proofB = synthesized.dualTrackRoadmap.trackB_Scalability.proofPointId;

  if (!validIds.has(proofA) || !validIds.has(proofB)) {
    throw new Error('Rule R5 Violation: Synthesis invented a metric not present in candidate profile.');
  }

  // 5. Zero-Migration Persistence: Write back into public.evaluations JSONB columns
  await supabase
    .from('evaluations')
    .update({
      strategic_positioning_angle: synthesized.departmentalOpportunitySizing,
      tier2_breakdown: synthesized.threeDiagnosticQuestions,
      why_you_excel: synthesized.dualTrackRoadmap,
      score_booster_gaps: synthesized.conversationProgression,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', params.userId)
    .eq('job_id', params.jobId);

  return synthesized;
}
```
