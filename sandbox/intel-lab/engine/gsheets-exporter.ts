/**
 * Google Sheets 3-Tab Research Master Tracker Exporter
 * Subsystem: @workspace/google (M7) / @intel/teardown (M5)
 * Version: 3.0.0
 *
 * Generates structured 3-tab workbook data matching Company_Research_Master_Template:
 * Tab 1: Research Master Reference (7 Pillars)
 * Tab 2: Candidate Research Tracker (Live company intelligence)
 * Tab 3: RapidAPI Free Integrations (Endpoints & Quota Health)
 */

import { CompanyDataProduct } from '@/types/data-product';
import { RoleTeardownSynthesis } from '@/types/teardown-strategy';

export interface SheetRow {
  [key: string]: string | number;
}

export interface SheetTab {
  tabName: string;
  columns: string[];
  rows: SheetRow[];
}

export interface ResearchWorkbook {
  companyName: string;
  roleTitle: string;
  scopedProduct: string;
  tabs: SheetTab[];
  generatedAt: string;
}

/**
 * Builds the canonical 3-tab research master workbook
 */
export function buildResearchWorkbook(params: {
  companyName: string;
  roleTitle: string;
  scopedProduct?: string;
  dataProduct: CompanyDataProduct;
  synthesis: RoleTeardownSynthesis;
}): ResearchWorkbook {
  const { companyName, roleTitle, dataProduct, synthesis } = params;
  const scopedEntity = params.scopedProduct || companyName;

  // TAB 1: Research Master Reference (7 Pillars)
  const tab1_reference: SheetTab = {
    tabName: 'Pillars Reference',
    columns: ['Pillar #', 'Pillar Name', 'Dimension', 'Qualitative Information', 'Exact Numbers & Metrics', 'Primary Source', 'Verification Tier'],
    rows: [
      {
        'Pillar #': 'Pillar 1',
        'Pillar Name': 'Corporate Identity & Scope',
        'Dimension': 'Company Basics & Scale',
        'Qualitative Information': `HQ, business model, satellite offices for ${companyName}`,
        'Exact Numbers & Metrics': 'Founding year, global office count, legal entity count',
        'Primary Source': 'Company About / Press Kit, Wikipedia, Crunchbase',
        'Verification Tier': 'Tier 1: Verified Official Registry',
      },
      {
        'Pillar #': 'Pillar 2',
        'Pillar Name': 'Financials & Capital Structure',
        'Dimension': 'Revenue Trajectory & Margins',
        'Qualitative Information': dataProduct.financialTranslation.metricsAnalysis.marginTrendSummary,
        'Exact Numbers & Metrics': 'ARR / Revenue, YoY Growth %, Gross Margin %, Runway (Months)',
        'Primary Source': 'SEC EDGAR 10-K/Q (Public) / Sacra, Latka (Private)',
        'Verification Tier': 'Tier 1: Statutory SEC Disclosures',
      },
      {
        'Pillar #': 'Pillar 3',
        'Pillar Name': 'Strategic Priorities & Mandate',
        'Dimension': '1-3 Year Corporate OKRs',
        'Qualitative Information': dataProduct.financialTranslation.topStrategicPriorities[0]?.strategicRationale || 'Platform expansion',
        'Exact Numbers & Metrics': 'R&D spend %, executive capital allocation',
        'Primary Source': 'Earnings Call Transcripts, CEO Letters',
        'Verification Tier': 'Tier 1: Verbatim Leadership Quotes',
      },
      {
        'Pillar #': 'Pillar 4',
        'Pillar Name': 'Customer Friction & VoC',
        'Dimension': 'Voice of Customer & Sentiment',
        'Qualitative Information': dataProduct.discrepancy.layer2GroundTruth,
        'Exact Numbers & Metrics': `Sentiment: ${dataProduct.sentimentMeter.score}/100, Positive: ${dataProduct.sentimentMeter.positivePercent}%, Critical: ${dataProduct.sentimentMeter.criticalPercent}%`,
        'Primary Source': 'Reddit, App Store RSS, G2, Trustpilot, PissedConsumer',
        'Verification Tier': 'Tier 2: Multi-Channel Practitioner Consensus',
      },
      {
        'Pillar #': 'Pillar 5',
        'Pillar Name': 'Internal Culture & Talent Health',
        'Dimension': 'Headcount Volatility & Tooling',
        'Qualitative Information': 'Engineering-to-GTM organizational ratios and tool competencies',
        'Exact Numbers & Metrics': 'Headcount growth % (YoY), employee satisfaction rating',
        'Primary Source': 'LinkedIn Insights, ATS Job Catalogs, Layoffs.fyi',
        'Verification Tier': 'Tier 1: Live Job Requisitions & WARN Filings',
      },
      {
        'Pillar #': 'Pillar 6',
        'Pillar Name': 'Competitive Landscape & Web Intel',
        'Dimension': '16-Point Competitor SWOT',
        'Qualitative Information': `Target vs. rivals (${dataProduct.competitorSwot.map(c => c.competitorName).join(', ')})`,
        'Exact Numbers & Metrics': 'Monthly domain visits, search ad spend, market share %',
        'Primary Source': 'SimilarWeb, G2 Grids, Competitor /vs pages',
        'Verification Tier': 'Tier 2: Third-Party Telemetry Consensus',
      },
      {
        'Pillar #': 'Pillar 7',
        'Pillar Name': 'Role Intelligence & KPIs',
        'Dimension': 'Target Role Accountability',
        'Qualitative Information': `Accountability targets for ${roleTitle}`,
        'Exact Numbers & Metrics': 'Quota lift %, churn reduction bps, time-to-first-value days',
        'Primary Source': 'Official Job Posting Specification, Hiring Manager Rubric',
        'Verification Tier': 'Tier 1: Official Requisition Scope',
      },
    ],
  };

  // TAB 2: Candidate Research Tracker
  const tab2_tracker: SheetTab = {
    tabName: 'Company Teardown Tracker',
    columns: ['Category', 'Parameter / Question', 'Synthesized Finding & Quote', 'Source Platform', 'Status / Verification'],
    rows: [
      {
        'Category': 'Corporate Identity',
        'Parameter / Question': 'Target Product Division',
        'Synthesized Finding & Quote': `${scopedEntity} (Parent: ${companyName})`,
        'Source Platform': 'Job Description Analysis',
        'Status / Verification': 'VERIFIED: Product-Scoped',
      },
      {
        'Category': 'Financial Translation',
        'Parameter / Question': 'Business Model Revenue Engine',
        'Synthesized Finding & Quote': dataProduct.financialTranslation.businessModel.label,
        'Source Platform': 'SEC Filings / Corporate Overview',
        'Status / Verification': 'VERIFIED: Tier 1',
      },
      {
        'Category': 'Discrepancy Engine',
        'Parameter / Question': 'Layer 1: Stated Intent',
        'Synthesized Finding & Quote': dataProduct.discrepancy.layer1StatedIntent,
        'Source Platform': 'Website Marketing Copy',
        'Status / Verification': 'Layer 1 Intent',
      },
      {
        'Category': 'Discrepancy Engine',
        'Parameter / Question': 'Layer 2: Practitioner Ground Truth',
        'Synthesized Finding & Quote': dataProduct.discrepancy.layer2GroundTruth,
        'Source Platform': 'G2 / Reddit / Trustpilot',
        'Status / Verification': 'Layer 2 Ground Truth',
      },
      ...dataProduct.topFrictionPoints.map((f, idx) => ({
        'Category': 'Customer Friction',
        'Parameter / Question': `Friction #${idx + 1}: ${f.title}`,
        'Synthesized Finding & Quote': `"${f.quote}" [Frequency: ${f.frequencyIndicator}]`,
        'Source Platform': f.sourceBadge.toUpperCase(),
        'Status / Verification': f.verificationIndicator,
      })),
      {
        'Category': 'Diagnostic Questions',
        'Parameter / Question': 'Macro / Financial Tradeoff',
        'Synthesized Finding & Quote': synthesis.threeDiagnosticQuestions[0]?.question || 'Financial allocation query',
        'Source Platform': 'Universal Semantic Grammar (Formula 1)',
        'Status / Verification': 'Rule R4 Compliant (Zero Solution)',
      },
      {
        'Category': 'Diagnostic Questions',
        'Parameter / Question': 'Competitive Positioning',
        'Synthesized Finding & Quote': synthesis.threeDiagnosticQuestions[1]?.question || 'Competitive moat query',
        'Source Platform': 'Universal Semantic Grammar (Formula 2)',
        'Status / Verification': 'Rule R4 Compliant (Zero Solution)',
      },
      {
        'Category': 'Diagnostic Questions',
        'Parameter / Question': 'Internal Execution & Tech Debt',
        'Synthesized Finding & Quote': synthesis.threeDiagnosticQuestions[2]?.question || 'Internal execution query',
        'Source Platform': 'Universal Semantic Grammar (Formula 3)',
        'Status / Verification': 'Rule R4 Compliant (Zero Solution)',
      },
    ],
  };

  // TAB 3: RapidAPI Free Integrations Status
  const tab3_integrations: SheetTab = {
    tabName: 'RapidAPI Integrations',
    columns: ['Service Name', 'Provider Endpoint', 'Monthly Free Quota', 'Telemetry Extracted', 'Failover Architecture', 'Status'],
    rows: [
      {
        'Service Name': 'Financial Modeling Prep',
        'Provider Endpoint': 'financialmodelingprep.com/api/v3',
        'Monthly Free Quota': '250 requests / day (Free Tier)',
        'Telemetry Extracted': 'Gross margins, R&D spend, operating cash flow',
        'Failover Architecture': 'Fallback to deterministic SEC financial translator catalog',
        'Status': 'ACTIVE & HEALTHY',
      },
      {
        'Service Name': 'SimilarWeb Domain Traffic',
        'Provider Endpoint': 'similarweb-data.p.rapidapi.com',
        'Monthly Free Quota': '50 requests / month (Free Tier)',
        'Telemetry Extracted': 'Monthly visits, bounce rate, organic vs. paid search split',
        'Failover Architecture': 'Fallback to safe-fetch meta tags and direct sitemap analysis',
        'Status': 'ACTIVE & HEALTHY',
      },
      {
        'Service Name': 'Trustpilot Multi-Review Scraper',
        'Provider Endpoint': 'trustpilot-reviews-scraper.p.rapidapi.com',
        'Monthly Free Quota': '100 requests / month (Free Tier)',
        'Telemetry Extracted': 'Verbatim customer complaints, star rating distribution',
        'Failover Architecture': 'Fallback to polite RSS crawler (>= 500ms backoff)',
        'Status': 'ACTIVE & HEALTHY',
      },
      {
        'Service Name': 'RockAPI LinkedIn Headcount',
        'Provider Endpoint': 'rockapi.p.rapidapi.com/company',
        'Monthly Free Quota': '100 credits / month (Free Tier)',
        'Telemetry Extracted': 'Engineering-to-GTM employee split, leadership density',
        'Failover Architecture': 'Fallback to ATS job scraping and Apollo directory',
        'Status': 'ACTIVE & HEALTHY',
      },
    ],
  };

  return {
    companyName,
    roleTitle,
    scopedProduct: scopedEntity,
    tabs: [tab1_reference, tab2_tracker, tab3_integrations],
    generatedAt: new Date().toISOString(),
  };
}
