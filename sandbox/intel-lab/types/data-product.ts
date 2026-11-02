/**
 * Company Intelligence Data Product Types
 * Subsystem: @intel/teardown (M5)
 * Version: 2.1.0
 *
 * Implements the 3-Stage Architecture:
 * 1. Information Gathering with verified resource citations (Financials, Leadership, VoC, Competitors)
 * 2. Strategic Synthesis Layer (Stated Intent vs. Ground Truth Discrepancy)
 * 3. Strategic Outcome & Growth Assessment (Financial growth verdict, leadership stability, candidate value-add)
 */

import { CustomerFrictionPoint, SentimentDistribution } from './review-auditor';
import { FinancialTranslationReport } from './financial-translator';

export type GrowthVerdictType =
  | 'STRONG_GROWTH'
  | 'CAPITAL_EFFICIENT_GROWTH'
  | 'MODERATE_GROWTH'
  | 'SLOWING_GROWTH'
  | 'CONTRACTION_COST_CUTTING';

export type LeadershipVerdictType =
  | 'STABLE_VISIONARY'
  | 'SCALING_DISCIPLINED'
  | 'TRANSITIONAL'
  | 'CHURN_RISK';

export interface GatheredResourceCitation {
  id: string;
  title: string;
  url: string;
  domain: string;
  category: 'OFFICIAL' | 'FINANCIAL' | 'LEADERSHIP' | 'CUSTOMER_REVIEWS' | 'COMPETITIVE_TOOL';
  verifiedDate: string;
  keyExcerpt: string;
}

export interface FinancialGrowthDetails {
  fundingStage: string;
  totalFundingRaised: string;
  estimatedValuation: string;
  estimatedRevenueOrArr: string;
  headcountTrend: string;
  capitalAllocationVerdict: GrowthVerdictType;
  growthPerspectiveSummary: string; // Plain-English analysis: Is the company growing or not from a financial perspective?
  sources: GatheredResourceCitation[];
}

export interface LeadershipCompassDetails {
  keyExecutives: Array<{
    name: string;
    title: string;
    background: string;
    interviewSnippet?: string;
    interviewUrl?: string;
  }>;
  strategicVision: string;
  executionDiscipline: string;
  leadershipTrajectoryVerdict: LeadershipVerdictType;
  sources: GatheredResourceCitation[];
}

export interface VoCAnswer {
  questionId: string;
  question: string;
  summary: string;
  verbatimQuote: string;
  sourceBadge: string;
  sourceUrl?: string;
}

export interface CompetitorSwotItem {
  competitorName: string;
  productLine: string;
  estimatedRevenueOrArr?: string;
  pricingModel?: string;
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  differentiationAngle: string;
  sourceUrl?: string;
}

export interface DiscrepancyComparison {
  layer1StatedIntent: string;
  layer2GroundTruth: string;
  discrepancyDelta: string;
}

export interface StrategicRecentEvent {
  id: string;
  title: string;
  date: string;
  impactAnalysis: string;
  sourceUrl: string;
}

export interface StrategicValueAddProposal {
  id: string;
  title: string;
  problemObserved: string;
  candidateProposedPath: string;
  expectedBusinessOutcome: string;
  candidateProofPointAnchor: string;
}

export interface CompanyDataProduct {
  companyName: string;
  scopedProduct: string;
  
  // STAGE 1: Gathered Information with Resources
  financialDetails?: FinancialGrowthDetails;
  leadershipCompass?: LeadershipCompassDetails;
  sentimentMeter: SentimentDistribution;
  vocAnswers: VoCAnswer[]; // 8-question framework
  topFrictionPoints: CustomerFrictionPoint[];
  competitorSwot: CompetitorSwotItem[]; // Top 3 product rivals (16-point matrix)
  gatheredResources?: GatheredResourceCitation[]; // Master verified citations directory

  // STAGE 2: Synthesis Layer
  discrepancy: DiscrepancyComparison;
  financialTranslation: FinancialTranslationReport;

  // STAGE 3: Strategic Outcome & Growth Assessment
  growthPerspectiveAssessment?: {
    isGrowing: boolean;
    growthVerdict: GrowthVerdictType;
    plainEnglishGrowthAnalysis: string;
    leadershipStabilityAnalysis: string;
    productMarketMoatAnalysis: string;
  };
  threeRecentEvents?: StrategicRecentEvent[];
  threeValueAddIdeas?: StrategicValueAddProposal[];

  synthesizedAt: string;
}
