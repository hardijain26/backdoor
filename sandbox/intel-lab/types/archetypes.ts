/**
 * Universal Semantic Grammar Archetype System
 * Subsystem: @intel/teardown (M5)
 * Version: 2.0.0
 */

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
    vocabularyTokens: [
      'North Star metric',
      'Time-to-Value (TTV)',
      'PRD',
      'opportunity sizing',
      'retention curves',
      'feature cannibalization',
      'PLG flywheel',
      'technical debt allocation',
    ],
    coreFailureModes: [
      'users failing to reach the "Aha!" moment',
      'high drop-off during self-serve workspace configuration',
      'churn driven by breaking changes',
      'enterprise customers blocked by missing RBAC',
    ],
    seniorManagerTitle: 'VP of Product / Chief Product Officer (CPO)',
    velocityTrackFocus: 'Deploying self-serve interactive onboarding recipes to cut Time-to-Value (TTV) by 30%',
    scalabilityTrackFocus: 'Standardizing an outcome-driven product prioritization framework to eliminate roadmap spillover',
  },

  PRODUCT_DESIGN: {
    name: 'PRODUCT_DESIGN',
    departmentName: 'Product Design & User Experience',
    businessCurrency: 'Task Completion Rate, Usability Heuristic Scores, Drop-off %, and CSAT',
    vocabularyTokens: [
      'design system tokens',
      'cognitive load',
      'heuristic evaluation',
      'micro-interactions',
      'information architecture',
      'wireframe',
      'Figma components',
    ],
    coreFailureModes: [
      'unintuitive multi-step forms',
      'hidden actions causing user confusion',
      'poor mobile viewport responsiveness',
      'silent error feedback',
    ],
    seniorManagerTitle: 'Head of Design / VP of User Experience',
    velocityTrackFocus: 'Redesigning the top 3 high-friction configuration screens causing support tickets',
    scalabilityTrackFocus: 'Establishing a unified, tokenized Figma-to-React design system component library',
  },

  ENGINEERING_TECH: {
    name: 'ENGINEERING_TECH',
    departmentName: 'Engineering & Infrastructure',
    businessCurrency: 'p99 Latency, Uptime SLAs, CI/CD Build Velocity, and Technical Debt Ratio',
    vocabularyTokens: [
      'microservices',
      'p99 latency',
      'event-driven queue',
      'cold start',
      'test sharding',
      'PR merge time',
      'on-call alert fatigue',
      'idempotency',
    ],
    coreFailureModes: [
      'synchronous timeout spikes',
      'flaky test suites causing 45m PR wait times',
      'unmanaged database query locks',
      'on-call burnout',
    ],
    seniorManagerTitle: 'Head of Engineering / VP of Technology',
    velocityTrackFocus: 'Sharding CI/CD test suites to unblock PR merge delays',
    scalabilityTrackFocus: 'Refactoring synchronous endpoints to asynchronous event brokers',
  },

  FINANCE_ACCOUNTING: {
    name: 'FINANCE_ACCOUNTING',
    departmentName: 'Corporate Finance & FP&A',
    businessCurrency: 'EBITDA Margin, Free Cash Flow (FCF) Conversion, Gross Margin Health, Burn Multiple, and Forecast Variance',
    vocabularyTokens: [
      'EBITDA margin',
      'Free Cash Flow (FCF)',
      'Rule of 40',
      'gross margin drag',
      'burn multiple',
      'budget vs actual variance',
      'COGS allocation',
      'CapEx vs OpEx',
      'unit economics',
    ],
    coreFailureModes: [
      'unbudgeted cloud hosting cost blowouts',
      'gross margin compression due to manual onboarding',
      'opaque revenue recognition',
      'delayed month-end close cycles',
    ],
    seniorManagerTitle: 'Chief Financial Officer (CFO) / VP of Finance',
    velocityTrackFocus: 'Auditing variable COGS cost drivers (cloud infrastructure & vendor SaaS) to eliminate 15% of wasteful spend',
    scalabilityTrackFocus: 'Building an automated real-time rolling financial forecast model to replace static quarterly spreadsheets',
  },

  CORPORATE_STRATEGY_BIZOPS: {
    name: 'CORPORATE_STRATEGY_BIZOPS',
    departmentName: 'Corporate Strategy & Business Operations (BizOps)',
    businessCurrency: 'Gross Margin Expansion, Market Share in New Geographies/Segments, LTV:CAC Ratio, and Strategic Initiative ROI',
    vocabularyTokens: [
      'TAM expansion',
      'pricing & packaging overhaul',
      'unit economics',
      'build vs buy vs partner',
      'market adjacency',
      'gross margin expansion',
      'M&A thesis',
      'LTV:CAC ratio',
    ],
    coreFailureModes: [
      'top-line growth accelerating while unit economics deteriorate',
      'unprofitable international expansion',
      'tier cannibalization',
      'failed post-merger integration',
    ],
    seniorManagerTitle: 'Chief Strategy Officer (CSO) / Head of BizOps',
    velocityTrackFocus: 'Conducting a customer cohort margin audit across pricing tiers to patch immediate revenue leakage',
    scalabilityTrackFocus: 'Formulating a market expansion business case (build vs. buy) to unlock the mid-market enterprise segment',
  },

  FOUNDER_OFFICE: {
    name: 'FOUNDER_OFFICE',
    departmentName: "Founder's Office / Chief of Staff",
    businessCurrency: 'Founder Bandwidth Hours, Cross-Functional Execution Velocity, and Critical Initiative Triage',
    vocabularyTokens: [
      'founder leverage',
      'cross-functional bottlenecks',
      'firefighting bandwidth',
      'operational drag',
      'executive decision velocity',
      'silent failure triage',
    ],
    coreFailureModes: [
      'founder stuck firefighting daily support escalations',
      'inter-departmental handoff delays between Product and Sales',
      'silent onboarding drop-offs',
    ],
    seniorManagerTitle: 'Founder & CEO',
    velocityTrackFocus: 'Patching the top 3 operational fires causing manual support escalations to free up 10h/week of founder bandwidth',
    scalabilityTrackFocus: 'Establishing a standardized cross-functional operating rhythm and executive dashboard across Product, Sales, and Eng',
  },

  SALES_GTM: {
    name: 'SALES_GTM',
    departmentName: 'Revenue / Commercial Sales',
    businessCurrency: 'Pipeline Velocity, Net New ARR, Win Rates, and Average Contract Value (ACV)',
    vocabularyTokens: [
      'outbound cadence',
      'pricing cliffs',
      'deal slip',
      'procurement friction',
      'bake-off',
      'sales cycle length',
      'ACV',
      'discounting pressure',
    ],
    coreFailureModes: [
      'prospects stalling on pricing tier jumps',
      'losing deals to modular rivals',
      'unresponsive sales engineering support',
      'rigid contracts',
    ],
    seniorManagerTitle: 'VP of Sales / Chief Revenue Officer',
    velocityTrackFocus: 'Resurrecting dormant pipeline accounts lost to competitor pricing',
    scalabilityTrackFocus: 'Standardizing pre-flight security evaluation decks to shorten sales cycles',
  },

  MARKETING_GROWTH: {
    name: 'MARKETING_GROWTH',
    departmentName: 'Growth & Demand Generation',
    businessCurrency: 'Blended CAC, Organic Search Market Share, and Trial Sign-up Velocity',
    vocabularyTokens: [
      'blended CAC',
      'organic traffic conquesting',
      'LTV:CAC',
      'bottom-of-funnel conversion',
      'messaging resonance',
      'intent keywords',
    ],
    coreFailureModes: [
      'generic corporate messaging',
      'competitors outranking on alternative keywords',
      'high ad spend with plateauing sign-ups',
    ],
    seniorManagerTitle: 'Chief Marketing Officer (CMO)',
    velocityTrackFocus: 'Launching 3 competitor counter-comparison landing pages',
    scalabilityTrackFocus: 'Building an automated customer advocacy and review-generation engine',
  },

  OPERATIONS_CS: {
    name: 'OPERATIONS_CS',
    departmentName: 'Customer Success & Support Operations',
    businessCurrency: 'Gross Revenue Retention (GRR), Net Promoter Score (NPS), and Resolution SLAs',
    vocabularyTokens: [
      'First Contact Resolution (FCR)',
      'ticket backlog',
      'CSAT',
      'Net Revenue Retention (NRR)',
      'account health score',
      'escalation path',
    ],
    coreFailureModes: [
      'support SLA spikes from 2h to 24h',
      'repetitive billing tickets',
      'unresponsive onboarding reps',
      'churn at annual renewal',
    ],
    seniorManagerTitle: 'VP of Customer Success',
    velocityTrackFocus: 'Building automated macro recipes for the top 3 recurring billing inquiries',
    scalabilityTrackFocus: 'Implementing automated health-score triggers 60 days before contract renewal',
  },

  LEGAL_COMPLIANCE: {
    name: 'LEGAL_COMPLIANCE',
    departmentName: 'Legal & Enterprise Compliance',
    businessCurrency: 'Contract Redline Turnaround Time, Deal Procurement Velocity, and Regulatory Risk',
    vocabularyTokens: [
      'MSA fallback clauses',
      'procurement cycle',
      'indemnification caps',
      'GDPR/DPDP compliance',
      'SOC-2 audit',
      'liability threshold',
    ],
    coreFailureModes: [
      'deals stalled 45+ days in security review',
      'unstandardized customer redlines',
      'data localization liabilities',
    ],
    seniorManagerTitle: 'General Counsel / Head of Legal',
    velocityTrackFocus: 'Publishing a pre-approved redline fallback guide for sales reps',
    scalabilityTrackFocus: 'Standardizing automated vendor security compliance packages',
  },

  PEOPLE_TALENT: {
    name: 'PEOPLE_TALENT',
    departmentName: 'Talent Acquisition & People Operations',
    businessCurrency: 'Time-to-Hire, Offer Acceptance Rate, eNPS, and First-Year Retention',
    vocabularyTokens: [
      'offer acceptance velocity',
      'interviewer debrief loop',
      'candidate drop-off',
      'employer branding',
      'compensation band calibration',
    ],
    coreFailureModes: [
      'candidate ghosting during debriefs',
      'uncalibrated compensation bands',
      'high leadership attrition on Blind',
    ],
    seniorManagerTitle: 'Chief People Officer / Head of Talent',
    velocityTrackFocus: 'Standardizing same-day interviewer debrief loops to eliminate drop-offs',
    scalabilityTrackFocus: 'Revamping technical employer branding on GitHub and engineering blogs',
  },
};

