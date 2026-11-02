/**
 * Teardown Strategy & Universal Semantic Grammar Types
 * Subsystem: @intel/teardown (M5)
 * Version: 2.1.0
 */

import { RoleArchetype } from './archetypes';
import {
  GatheredResourceCitation,
  StrategicRecentEvent,
  StrategicValueAddProposal,
} from './data-product';

export interface DiagnosticQuestion {
  type: 'MACRO_FINANCIAL' | 'COMPETITOR_PRODUCT' | 'INTERNAL_EXECUTION';
  question: string;
  verifiedFact: string;
  observedFriction: string;
  openDilemma: string;
}

export interface ConversationProgression {
  call1_ProblemValidation: string;
  call2_OpportunityPitch: string;
  call3_AlignmentPrompt: string;
}

export interface RoadmapTrack {
  trackTitle: string;
  focus: string;
  days30to60: string;
  days60to90: string;
  proofPointId: string;
  verifiedMetric: string;
}

export interface DualTrackRoadmap {
  days0to30_CommonBaseline: string;
  trackA_Velocity: RoadmapTrack;
  trackB_Scalability: RoadmapTrack;
  collaborativeClosingQuestion: string;
}

export interface RoleTeardownSynthesis {
  roleTitle: string;
  archetype: RoleArchetype;
  companyName: string;
  scopedProduct: string;
  financialTranslation: string;
  departmentalProblemDiagnosis: string;
  departmentalOpportunitySizing: string;
  threeDiagnosticQuestions: DiagnosticQuestion[];
  conversationProgression: ConversationProgression;
  dualTrackRoadmap: DualTrackRoadmap;
  threeRecentEvents?: StrategicRecentEvent[];
  threeValueAddIdeas?: StrategicValueAddProposal[];
  sourcesDirectory?: GatheredResourceCitation[];
  ruleR5Verified: boolean;
}
