import { NextRequest, NextResponse } from 'next/server';
import { getOrFetchCompanyDataProduct, getOrGenerateRoleTeardown } from '@/engine/teardown';
import { HARDI_PROOF_POINTS_LIBRARY } from '@/engine/cv-builder';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('companyId') || 'comp-default';
    const companyName = searchParams.get('companyName') || 'Target Company';
    const roleTitle = searchParams.get('roleTitle') || 'Product Manager';
    const scopedProduct = searchParams.get('scopedProduct') || companyName;
    const forceRefresh = searchParams.get('forceRefresh') === 'true';

    const proofPoints = HARDI_PROOF_POINTS_LIBRARY.slice(0, 2).map((pp) => ({
      id: pp.id,
      metricText: pp.statement,
    }));

    const { dataProduct } = await getOrFetchCompanyDataProduct({
      companyId,
      companyName,
      scopedProduct,
      forceRefresh,
    });

    const { synthesis } = await getOrGenerateRoleTeardown({
      userId: 'user-default',
      jobId: `job-${companyId}`,
      companyId,
      companyName,
      roleTitle,
      scopedProduct,
      candidateProofPoints: proofPoints,
      forceRefresh,
    });

    return NextResponse.json({
      success: true,
      dataProduct,
      synthesis,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch company product intel' },
      { status: 500 }
    );
  }
}

