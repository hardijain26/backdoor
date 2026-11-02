/**
 * Google Slides Executive Deck Exporter
 * Subsystem: @workspace/google (M7) / @intel/teardown (M5)
 * Version: 3.0.0
 *
 * Generates structured 6-slide executive presentation payload and Drive export.
 */

import { CompanyDataProduct } from '@/types/data-product';
import { RoleTeardownSynthesis } from '@/types/teardown-strategy';

export interface SlideContent {
  slideNumber: number;
  slideTitle: string;
  subtitle: string;
  bulletPoints: string[];
  calloutBox?: {
    label: string;
    content: string;
  };
  metricsHighlight?: Array<{ label: string; value: string }>;
}

export interface ExecutiveDeckPayload {
  companyName: string;
  roleTitle: string;
  scopedProduct: string;
  slides: SlideContent[];
  generatedAt: string;
}

/**
 * Builds the canonical 6-slide executive teardown presentation
 */
export function buildExecutiveSlidesDeck(params: {
  companyName: string;
  roleTitle: string;
  scopedProduct?: string;
  dataProduct: CompanyDataProduct;
  synthesis: RoleTeardownSynthesis;
}): ExecutiveDeckPayload {
  const { companyName, roleTitle, dataProduct, synthesis } = params;
  const scopedEntity = params.scopedProduct || companyName;

  const slides: SlideContent[] = [
    // Slide 1: Executive Scope
    {
      slideNumber: 1,
      slideTitle: `${scopedEntity} — Executive Value Teardown`,
      subtitle: `Diagnostic Proposal & Strategic Execution Blueprint for ${roleTitle}`,
      bulletPoints: [
        `Target Division: ${scopedEntity} (Parent Entity: ${companyName})`,
        `Mandate: Diagnostic operational analysis & cross-functional alignment proposal`,
        `Presenter: Executive Candidate (tailored to verified production metrics)`,
        `Confidentiality: Prepared exclusively for strategic interview discussion`,
      ],
      calloutBox: {
        label: 'STRATEGIC SCOPE',
        content: `Bridging corporate market ambition with practitioner ground truth across engineering, product, and customer delivery.`,
      },
      metricsHighlight: [
        { label: 'Customer Sentiment', value: `${dataProduct.sentimentMeter.score}/100` },
        { label: 'Verified Proof Points', value: '4 Metric-Anchored' },
      ],
    },

    // Slide 2: The Discrepancy Hook
    {
      slideNumber: 2,
      slideTitle: 'The Discrepancy Hook: Corporate Narrative vs. User Ground Truth',
      subtitle: 'Where marketing promises collide with real-world customer friction',
      bulletPoints: [
        `Layer 1 (Declared Intent): ${dataProduct.discrepancy.layer1StatedIntent}`,
        `Layer 2 (Practitioner Ground Truth): ${dataProduct.discrepancy.layer2GroundTruth}`,
        `Critical Discrepancy Delta: ${dataProduct.discrepancy.discrepancyDelta}`,
      ],
      calloutBox: {
        label: 'DIAGNOSTIC SUMMARY',
        content: dataProduct.discrepancy.discrepancyDelta,
      },
      metricsHighlight: [
        { label: 'Positive Sentiment', value: `${dataProduct.sentimentMeter.positivePercent}%` },
        { label: 'Critical Friction', value: `${dataProduct.sentimentMeter.criticalPercent}%` },
      ],
    },

    // Slide 3: Horizon 1-3 Customer Friction Triage
    {
      slideNumber: 3,
      slideTitle: 'Top Customer Friction Points Mapped to Execution Priorities',
      subtitle: 'Multi-channel customer complaint clustering (Reddit, G2, Trustpilot, App Store)',
      bulletPoints: dataProduct.topFrictionPoints.slice(0, 3).map((fric, idx) => {
        return `Priority ${idx + 1} (${fric.sourceBadge.toUpperCase()}): "${fric.title}" — ${fric.quote} [${fric.frequencyIndicator}]`;
      }),
      calloutBox: {
        label: 'OPERATIONAL IMPLICATION',
        content: `Unchecked configuration friction directly compresses net revenue retention and inflates tier-2 customer support escalations.`,
      },
    },

    // Slide 4: Dual-Track 30-60-90 Day Blueprint
    {
      slideNumber: 4,
      slideTitle: 'Dual-Track 30–60–90 Day Execution Roadmap',
      subtitle: 'Track A (Velocity Triage) vs. Track B (Scalability & Structural Refactor)',
      bulletPoints: [
        `Days 0–30: Common Baseline: ${synthesis.dualTrackRoadmap.days0to30_CommonBaseline}`,
        `Days 31–60: Track A (Velocity): ${synthesis.dualTrackRoadmap.trackA_Velocity.days30to60} | Track B (Scalability): ${synthesis.dualTrackRoadmap.trackB_Scalability.days30to60}`,
        `Days 61–90+: Track A (Velocity): ${synthesis.dualTrackRoadmap.trackA_Velocity.days60to90} | Track B (Scalability): ${synthesis.dualTrackRoadmap.trackB_Scalability.days60to90}`,
      ],
      calloutBox: {
        label: 'COLLABORATIVE ENGAGEMENT PROMPT',
        content: synthesis.dualTrackRoadmap.collaborativeClosingQuestion,
      },
    },

    // Slide 5: 3 Zero-Solution Diagnostic Questions
    {
      slideNumber: 5,
      slideTitle: 'Three Diagnostic Questions for the Leadership Team',
      subtitle: 'Exploring internal trade-offs, constraints, and capital allocation mandates',
      bulletPoints: (synthesis.threeDiagnosticQuestions || []).map((q, idx) => {
        return `${idx + 1}. [${q.type}]: "${q.question}" (Observed Fact: ${q.verifiedFact})`;
      }),
      calloutBox: {
        label: 'FACILITATION RULE',
        content: `Withhold solutions during initial rounds. Diagnose internal bandwidth, historical attempts, and hidden dependencies first.`,
      },
    },

    // Slide 6: Strategic Moat & Collaborative Next Steps
    {
      slideNumber: 6,
      slideTitle: 'Strategic Moat & Next Steps',
      subtitle: 'Transitioning from diagnostic validation to collaborative execution',
      bulletPoints: [
        `Call 1 (Validation): Validate whether diagnosed friction matches Q1/Q2 internal retrospectives`,
        `Call 2 (Sizing): Co-design sprint allocations between velocity triage and architectural refactor`,
        `Call 3 (Alignment): Finalize measurable success milestones and first 90-day ownership`,
      ],
      calloutBox: {
        label: 'DECISION ALIGNMENT',
        content: `Which of the two tracks—Velocity Triage or Scalability Infrastructure—removes the most pressure from the executive team's desk right now?`,
      },
    },
  ];

  return {
    companyName,
    roleTitle,
    scopedProduct: scopedEntity,
    slides,
    generatedAt: new Date().toISOString(),
  };
}
