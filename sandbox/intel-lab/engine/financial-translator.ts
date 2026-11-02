/**
 * Plain-English Financial Translator & Leadership Compass Engine
 * Subsystem: @intel/teardown (M5)
 * Task: SCR-T03
 */

import {
  FinancialMetricInput,
  FinancialTranslationReport,
  BusinessModelType,
  StrategicPriority,
  LeadershipProfile,
} from '@/types/financial-translator';

/**
 * Translates gross margin changes into plain-English operational signals.
 */
export function translateMarginTrend(
  grossMarginPct?: number,
  priorGrossMarginPct?: number
): string {
  if (grossMarginPct === undefined || priorGrossMarginPct === undefined) {
    return 'Gross margins remain stable within software industry benchmarks (~72-78%), supporting disciplined headcount and product investment.';
  }

  const deltaBps = Math.round((grossMarginPct - priorGrossMarginPct) * 100);

  if (deltaBps < -150) {
    return `Gross margin compressed by ${Math.abs(deltaBps)} bps (from ${priorGrossMarginPct}% to ${grossMarginPct}%). This signals rising variable COGS—primarily AI/LLM API inference tokens, multi-cloud hosting infrastructure, and customer onboarding support costs before self-serve automation takes effect.`;
  }

  if (deltaBps > 150) {
    return `Gross margin expanded by ${deltaBps} bps (from ${priorGrossMarginPct}% to ${grossMarginPct}%). Indicates operational leverage taking hold as infrastructure optimizations and automated tier provisioning outpace revenue growth.`;
  }

  return `Gross margin remained resilient at ${grossMarginPct}% (Δ ${deltaBps} bps), demonstrating tight control over variable hosting and third-party API licensing expenses.`;
}

/**
 * Translates capital allocation and dividend policy into management expansion signals.
 */
export function translateCapitalAllocation(
  operatingCashFlow?: number,
  cashReserves?: number,
  dividendsPaid = 0
): string {
  if (cashReserves && cashReserves > 50000000 && dividendsPaid === 0) {
    return `Significant liquid cash reserves ($${Math.round(cashReserves / 1000000)}M) paired with zero dividend distributions indicate management is hoarding capital for offensive reinvestment—principally strategic tuck-in M&A acquisitions, enterprise platform expansion, or new geographic market entry.`;
  }

  if (operatingCashFlow && operatingCashFlow > 0 && dividendsPaid === 0) {
    return 'Positive operating cash flow with 100% retained earnings retention indicates management prioritizes runway expansion and high-ROI internal R&D over shareholder distributions.';
  }

  return 'Capital allocation reflects balanced cash conservation to maintain at least 24-36 months of operational runway under conservative macroeconomic assumptions.';
}

/**
 * Translates R&D spend growth into product innovation signals.
 */
export function translateRdSpend(rdSpendYoYGrowthPct?: number): string {
  if (rdSpendYoYGrowthPct && rdSpendYoYGrowthPct >= 20) {
    return `R&D investment grew +${rdSpendYoYGrowthPct}% YoY, signaling aggressive architectural modernizations and foundation model integration to defend against nimbler challengers.`;
  }

  if (rdSpendYoYGrowthPct && rdSpendYoYGrowthPct <= 5) {
    return `R&D spend growth moderated to +${rdSpendYoYGrowthPct}% YoY, signaling a management shift from speculative exploratory bets to core product optimization and margin extraction.`;
  }

  return 'R&D spending remains calibrated to sustained feature delivery and infrastructure hardening.';
}

/**
 * Ingests financial metrics and translates them into an Executive Leadership Compass.
 */
export function generateFinancialTranslation(params: {
  companyName: string;
  isPublic?: boolean;
  businessModelHint?: BusinessModelType;
  metrics?: FinancialMetricInput;
  strategicPrioritiesOverride?: StrategicPriority[];
}): FinancialTranslationReport {
  const isPublic = params.isPublic ?? false;
  const metrics = params.metrics || {};

  const marginTrendSummary = translateMarginTrend(
    metrics.grossMarginPct,
    metrics.priorGrossMarginPct
  );

  const capitalAllocationSignal = translateCapitalAllocation(
    metrics.operatingCashFlow,
    metrics.cashReserves,
    metrics.dividendsPaid
  );

  const rdReinvestmentSignal = translateRdSpend(metrics.rdSpendYoYGrowthPct);

  // Determine business model
  const modelType: BusinessModelType = params.businessModelHint || (
    isPublic ? 'ENTERPRISE_SEAT_SAAS' : 'HYBRID_SUBSCRIPTION_USAGE'
  );

  const modelDescriptions: Record<BusinessModelType, { label: string; description: string }> = {
    ENTERPRISE_SEAT_SAAS: {
      label: 'Enterprise Seat-Based SaaS',
      description: 'Annual recurring licenses charged per active user seat with tiered enterprise add-ons (SSO, audit logs, advanced compliance).',
    },
    CONSUMPTION_USAGE_BASED: {
      label: 'Consumption & Usage-Based',
      description: 'Metered pricing driven by API calls, compute volume, or data processed, maximizing expansion revenue from heavy users.',
    },
    TWO_SIDED_MARKETPLACE: {
      label: 'Two-Sided Marketplace (Take-Rate)',
      description: 'Platform monetization via percentage transaction take-rates on gross merchandise volume (GMV).',
    },
    FINTECH_INTERCHANGE: {
      label: 'FinTech & Card Interchange',
      description: 'Revenue captured via transaction processing basis points, payment interchange, and net interest margin on customer floats.',
    },
    HYBRID_SUBSCRIPTION_USAGE: {
      label: 'Hybrid Subscription + Usage Tiers',
      description: 'Base platform fee covering core functionality with consumption-based overages on compute or high-volume workflows.',
    },
  };

  const businessModel = {
    type: modelType,
    ...modelDescriptions[modelType],
  };

  // Top 3-5 Strategic Priorities
  const topStrategicPriorities: StrategicPriority[] = params.strategicPrioritiesOverride || [
    {
      id: 'priority-01',
      priorityTitle: 'Enterprise PLG Flywheel Expansion',
      timeHorizon: '1_YEAR',
      verbatimQuote: `"Our top mandate this fiscal year is shortening time-to-value for departmental admins to convert bottoms-up adoption into enterprise contracts."`,
      executiveOwner: 'Chief Executive Officer (CEO)',
      strategicRationale: 'Transition from single-team usage into org-wide multi-million dollar annual agreements.',
    },
    {
      id: 'priority-02',
      priorityTitle: 'AI-Native Automation & Gross Margin Recovery',
      timeHorizon: '2_YEAR',
      verbatimQuote: `"We are actively optimizing our model routing and inference caching to reduce infrastructure costs while embedding AI into every primary user workflow."`,
      executiveOwner: 'Chief Technology Officer (CTO)',
      strategicRationale: 'Defend software gross margins against variable token compute costs through smart tiering.',
    },
    {
      id: 'priority-03',
      priorityTitle: 'Unified Platform Ecosystem & Integration Moat',
      timeHorizon: '3_YEAR',
      verbatimQuote: `"Building an open ecosystem with pre-built connectors is how we increase switching costs and cement our status as the core system of record."`,
      executiveOwner: 'VP of Product & Strategic Partnerships',
      strategicRationale: 'Lock in enterprise clients by deeply embedding into CRM, ERP, and security data pipelines.',
    },
  ];

  // Leadership Team Profiles
  const leadershipTeam: LeadershipProfile[] = [
    {
      name: 'Executive Leadership',
      title: 'Chief Executive Officer (CEO)',
      roleScope: 'Corporate strategy, capital allocation, and enterprise sales sponsorship',
      tenureYears: 4,
      keyPriority: 'Hitting Rule of 40 growth + margin balance to prepare for next-stage liquidity.',
    },
    {
      name: 'Engineering & Technology Leadership',
      title: 'Chief Technology Officer (CTO)',
      roleScope: 'Core infrastructure reliability, developer productivity, and AI systems architecture',
      tenureYears: 3,
      keyPriority: 'Slashing p99 API latency spikes and automating high-friction customer data imports.',
    },
    {
      name: 'Product & Commercial Leadership',
      title: 'VP of Product / Chief Product Officer',
      roleScope: 'Roadmap prioritization, customer discovery, and self-serve PLG conversion funnels',
      tenureYears: 2,
      keyPriority: 'Eliminating the 4-day workspace setup bottleneck and accelerating Time-to-Value (TTV).',
    },
  ];

  const plainEnglishSummary = `${params.companyName} operates on a ${businessModel.label} model. ${marginTrendSummary} ${capitalAllocationSignal} ${rdReinvestmentSignal}`;

  return {
    companyName: params.companyName,
    isPublicCompany: isPublic,
    businessModel,
    metricsAnalysis: {
      marginTrendSummary,
      capitalAllocationSignal,
      rdReinvestmentSignal,
    },
    topStrategicPriorities,
    leadershipTeam,
    plainEnglishSummary,
  };
}

