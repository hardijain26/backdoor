import { NextRequest, NextResponse } from 'next/server';
import { buildTailoredCv, TailoredCvPayload } from '@/engine/cv-builder';

/**
 * POST /api/cv/tailor
 * Generates role-tailored CV bullets and enforces Cardinal Rule R5 byte-for-byte verification.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || !body.company || !body.title) {
      return NextResponse.json(
        { error: 'Missing required fields: company and title are mandatory.' },
        { status: 400 }
      );
    }

    const payload: TailoredCvPayload = {
      jobId: body.jobId || `job-${Date.now().toString(36)}`,
      company: body.company,
      title: body.title,
      requiredSkills: body.requiredSkills || [],
      polishWithAi: Boolean(body.polishWithAi),
      simulatedAiSummary: body.simulatedAiSummary,
      simulatedAiBullets: body.simulatedAiBullets,
    };

    const tailoredCv = buildTailoredCv(payload);

    return NextResponse.json(tailoredCv, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error during CV generation.' },
      { status: 500 }
    );
  }
}

