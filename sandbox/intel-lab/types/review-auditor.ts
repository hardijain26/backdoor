/**
 * Multi-Channel Review Auditor Types
 * Subsystem: @intel/teardown (M5)
 * Version: 2.0.0
 */

export type ReviewSourceType =
  | 'reddit'
  | 'app_store'
  | 'play_store'
  | 'g2'
  | 'trustpilot'
  | 'capterra'
  | 'pissed_consumer';

export interface CustomerFrictionPoint {
  id: string;
  title: string;
  quote: string;
  sourceBadge: ReviewSourceType;
  verificationIndicator: string;
  frequencyIndicator: string;
  timestamp: string;
  url?: string;
  sentiment: 'critical' | 'neutral' | 'positive';
}

export interface SentimentDistribution {
  score: number; // 0 - 100
  positivePercent: number;
  neutralPercent: number;
  criticalPercent: number;
  totalReviewsAnalyzed: number;
}

export interface AuditedSourceStatus {
  source: ReviewSourceType;
  reviewCount: number;
  status: 'ACTIVE' | 'DEGRADED' | 'RATE_LIMITED' | 'FALLBACK';
}

export interface ReviewAuditorReport {
  companyName: string;
  scopedProduct: string;
  sentimentMeter: SentimentDistribution;
  frictionPoints: CustomerFrictionPoint[]; // Top 5
  sourcesAudited: AuditedSourceStatus[];
  discrepancyStatement: string; // Layer 1 (Stated Intent) vs Layer 2 (Ground Truth)
  auditedAt: string;
}

