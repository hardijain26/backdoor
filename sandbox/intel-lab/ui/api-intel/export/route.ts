import { NextRequest, NextResponse } from 'next/server';
import { exportTeardownToGoogleDoc } from '@/engine/gdocs-exporter';
import { getOrFetchCompanyDataProduct, getOrGenerateRoleTeardown } from '@/engine/teardown';
import { HARDI_PROOF_POINTS_LIBRARY } from '@/engine/cv-builder';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      companyId = 'comp-default',
      companyName = 'Target Company',
      roleTitle = 'Product Manager',
      scopedProduct,
      candidateProofPoints,
      googleAccessToken,
    } = body;

    const proofPoints = candidateProofPoints && candidateProofPoints.length >= 2
      ? candidateProofPoints
      : HARDI_PROOF_POINTS_LIBRARY.slice(0, 2).map((pp) => ({
          id: pp.id,
          metricText: pp.statement,
        }));

    // 1. Resolve Company Data Product
    const { dataProduct } = await getOrFetchCompanyDataProduct({
      companyId,
      companyName,
      scopedProduct,
    });

    // 2. Resolve Role Teardown
    const { synthesis } = await getOrGenerateRoleTeardown({
      userId: 'user-default',
      jobId: `job-${companyId}`,
      companyId,
      companyName,
      roleTitle,
      scopedProduct,
      candidateProofPoints: proofPoints,
    });

    // 3. Export to Google Doc
    const result = await exportTeardownToGoogleDoc({
      candidateName: 'Hardi Jain',
      roleTitle,
      companyName,
      scopedProduct: scopedProduct || companyName,
      companyId,
      synthesis,
      dataProduct,
      googleAccessToken,
    });

    const targetScoped = scopedProduct || companyName;
    const googleSlidesUrl = `/intel/teardown/slides?companyId=${encodeURIComponent(companyId)}&company=${encodeURIComponent(companyName)}&role=${encodeURIComponent(roleTitle)}&scopedProduct=${encodeURIComponent(targetScoped)}`;
    const googleSheetsUrl = `/intel/teardown/sheets?companyId=${encodeURIComponent(companyId)}&company=${encodeURIComponent(companyName)}&role=${encodeURIComponent(roleTitle)}&scopedProduct=${encodeURIComponent(targetScoped)}`;

    return NextResponse.json({
      ...result,
      googleSlidesUrl,
      googleSheetsUrl,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to export teardown to Google Docs' },
      { status: 500 }
    );
  }
}

