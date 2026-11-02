/**
 * Plain-English Financial Translator & Leadership Compass Types
 * Subsystem: @intel/teardown (M5)
 * Version: 2.0.0
 */

export type BusinessModelType =
  | 'ENTERPRISE_SEAT_SAAS'
  | 'CONSUMPTION_USAGE_BASED'
  | 'TWO_SIDED_MARKETPLACE'
  | 'FINTECH_INTERCHANGE'
  | 'HYBRID_SUBSCRIPTION_USAGE';

export interface FinancialMetricInput {
  grossMarginPct?: number;
  priorGrossMarginPct?: number;
  revenueYoYGrowthPct?: number;
  operatingCashFlow?: number;
  cashReserves?: number;
  dividendsPaid?: number;
  rdSpendYoYGrowthPct?: number;
  cacTrend?: 'rising' | 'flat' | 'declining';
  fundingStage?: string;
  totalRaised?: string;
  leadInvestors?: string[];
}

export interface StrategicPriority {
  id: string;
  priorityTitle: string;
  timeHorizon: '1_YEAR' | '2_YEAR' | '3_YEAR';
  verbatimQuote: string;
  executiveOwner: string;
  strategicRationale: string;
}

export interface LeadershipProfile {
  name: string;
  title: string;
  roleScope: string;
  tenureYears?: number;
  keyPriority: string;
}

export interface FinancialTranslationReport {
  companyName: string;
  isPublicCompany: boolean;
  businessModel: {
    type: BusinessModelType;
    label: string;
    description: string;
  };
  metricsAnalysis: {
    marginTrendSummary: string;
    capitalAllocationSignal: string;
    rdReinvestmentSignal: string;
  };
  topStrategicPriorities: StrategicPriority[];
  leadershipTeam: LeadershipProfile[];
  plainEnglishSummary: string;
}

