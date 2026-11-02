/**
 * Headless Google Docs Executive 1-Pager Exporter
 * Subsystem: @workspace/gdocs (M7 / M5)
 * Task: SCR-T07
 *
 * Responsibilities:
 * 1. Synthesizes a structured, executive-ready 1-pager document payload.
 * 2. Interacts with Google Docs API (docs.create + documents.batchUpdate) via OAuth.
 * 3. Gracefully generates preview URL when offline/unauthenticated ($0 cloud baseline).
 * 4. Persists authenticated Google Doc URL to public.company_briefs.funding_details.
 */

import { CompanyDataProduct } from '@/types/data-product';
import { RoleTeardownSynthesis } from '@/types/teardown-strategy';
import { persistGoogleDocUrl } from './teardown';

export interface TeardownExportPayload {
  candidateName: string;
  roleTitle: string;
  companyName: string;
  scopedProduct: string;
  companyId: string;
  synthesis: RoleTeardownSynthesis;
  dataProduct: CompanyDataProduct;
  googleAccessToken?: string;
  fetchFn?: typeof fetch;
}

export interface TeardownExportResult {
  success: boolean;
  documentId: string;
  googleDocUrl: string;
  title: string;
  exportedAt: string;
  persistedToBrief: boolean;
  batchUpdateApplied: boolean;
}

/**
 * Builds the plain text document structure for Google Docs batchUpdate.
 */
export function buildExecutive1PagerText(payload: {
  candidateName: string;
  roleTitle: string;
  companyName: string;
  scopedProduct: string;
  synthesis: RoleTeardownSynthesis;
  dataProduct: CompanyDataProduct;
}): string {
  const { candidateName, roleTitle, companyName, scopedProduct, synthesis, dataProduct } = payload;
  const p = dataProduct;
  const s = synthesis;

  return [
    `EXECUTIVE TEARDOWN & VALUE BLUEPRINT: ${roleTitle.toUpperCase()}`,
    `Target: ${companyName} (${scopedProduct}) | Author: ${candidateName} | Date: ${new Date().toISOString().split('T')[0]}`,
    `================================================================================`,
    ``,
    `1. CORPORATE SNAPSHOT & LEADERSHIP COMPASS`,
    `--------------------------------------------------------------------------------`,
    `• Business Model: ${p.financialTranslation.businessModel.label}`,
    `• Model Mechanics: ${p.financialTranslation.businessModel.description}`,
    `• Financial Signal: ${p.financialTranslation.metricsAnalysis.marginTrendSummary}`,
    `• Capital Allocation: ${p.financialTranslation.metricsAnalysis.capitalAllocationSignal}`,
    `• Top Strategic Priority: ${p.financialTranslation.topStrategicPriorities[0]?.priorityTitle || 'Enterprise Growth'}`,
    `  Executive Quote: ${p.financialTranslation.topStrategicPriorities[0]?.verbatimQuote || 'Accelerating adoption'}`,
    ``,
    `2. THE STRATEGIC DISCREPANCY (INTENT VS. GROUND TRUTH)`,
    `--------------------------------------------------------------------------------`,
    `• Stated Leadership Intent: ${p.discrepancy.layer1StatedIntent}`,
    `• Ground Truth Review Consensus: ${p.discrepancy.layer2GroundTruth}`,
    `• Strategic Opportunity Gap: ${p.discrepancy.discrepancyDelta}`,
    ``,
    `3. TOP 5 CUSTOMER FRICTION POINTS (MULTI-CHANNEL AUDIT)`,
    `--------------------------------------------------------------------------------`,
    ...p.topFrictionPoints.map((f, i) =>
      `[#${i + 1}] ${f.title} (${f.sourceBadge.toUpperCase()} — ${f.verificationIndicator})\n    Verbatim Quote: ${f.quote}\n    Frequency: ${f.frequencyIndicator}`
    ),
    ``,
    `4. THREE ZERO-SOLUTION DIAGNOSTIC QUESTIONS (FOR HIRING MANAGER)`,
    `--------------------------------------------------------------------------------`,
    ...s.threeDiagnosticQuestions.map((q, i) =>
      `Q${i + 1} (${q.type}):\n"${q.question}"\n`
    ),
    `5. DUAL-TRACK 30-60-90 DAY COLLABORATIVE EXECUTION BLUEPRINT`,
    `--------------------------------------------------------------------------------`,
    `• ${s.dualTrackRoadmap.days0to30_CommonBaseline}`,
    ``,
    `[PATH A: VELOCITY & TRIAGE] — Focus: ${s.dualTrackRoadmap.trackA_Velocity.focus}`,
    `  - Days 30–60: ${s.dualTrackRoadmap.trackA_Velocity.days30to60}`,
    `  - Days 60–90: ${s.dualTrackRoadmap.trackA_Velocity.days60to90}`,
    `  - Verified Proof Anchor: ${s.dualTrackRoadmap.trackA_Velocity.verifiedMetric}`,
    ``,
    `[PATH B: SCALABILITY & ARCHITECTURE] — Focus: ${s.dualTrackRoadmap.trackB_Scalability.focus}`,
    `  - Days 30–60: ${s.dualTrackRoadmap.trackB_Scalability.days30to60}`,
    `  - Days 60–90: ${s.dualTrackRoadmap.trackB_Scalability.days60to90}`,
    `  - Verified Proof Anchor: ${s.dualTrackRoadmap.trackB_Scalability.verifiedMetric}`,
    ``,
    `COLLABORATIVE CLOSING PROMPT:`,
    `"${s.dualTrackRoadmap.collaborativeClosingQuestion}"`,
    `================================================================================`,
  ].join('\n');
}

/**
 * Creates and formats a Google Doc via Google Docs API or returns a deterministic preview URL.
 */
export async function exportTeardownToGoogleDoc(
  payload: TeardownExportPayload
): Promise<TeardownExportResult> {
  const title = `Executive Teardown: ${payload.roleTitle} — ${payload.scopedProduct}`;
  const docText = buildExecutive1PagerText(payload);
  const fetcher = payload.fetchFn || fetch;

  let documentId = `doc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
  let googleDocUrl = `/intel/teardown/preview?companyId=${encodeURIComponent(payload.companyId)}&company=${encodeURIComponent(payload.companyName)}&role=${encodeURIComponent(payload.roleTitle)}&scopedProduct=${encodeURIComponent(payload.scopedProduct)}`;
  let batchUpdateApplied = false;

  // If live Google OAuth Access Token is provided, execute Google Docs API call
  if (payload.googleAccessToken && payload.googleAccessToken.trim().length > 10) {
    try {
      // 1. docs.create
      const createRes = await fetcher('https://docs.googleapis.com/v1/documents', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${payload.googleAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });

      if (createRes.ok) {
        const createJson = await createRes.json();
        documentId = createJson.documentId || documentId;
        googleDocUrl = `https://docs.google.com/document/d/${documentId}/edit`;

        // 2. documents.batchUpdate to populate text
        const updateRes = await fetcher(
          `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${payload.googleAccessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              requests: [
                {
                  insertText: {
                    location: { index: 1 },
                    text: docText,
                  },
                },
              ],
            }),
          }
        );

        if (updateRes.ok) {
          batchUpdateApplied = true;
        }
      }
    } catch {
      // Fallback gracefully to offline preview URL ($0 infrastructure cost)
    }
  }

  // 3. Persist URL into public.company_briefs.funding_details
  const persistedToBrief = persistGoogleDocUrl(payload.companyId, googleDocUrl);

  return {
    success: true,
    documentId,
    googleDocUrl,
    title,
    exportedAt: new Date().toISOString(),
    persistedToBrief,
    batchUpdateApplied,
  };
}

