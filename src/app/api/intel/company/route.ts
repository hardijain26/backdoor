import { NextRequest, NextResponse } from 'next/server';
import { getCompanyResearch, setCompanyResearchCache, CompanyResearchIntel } from '@/engine/company-research';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const company = searchParams.get('company') || searchParams.get('name');

    if (!company) {
      return NextResponse.json(
        { error: 'Missing required "company" search parameter' },
        { status: 400 }
      );
    }

    const intel = getCompanyResearch(company);
    return NextResponse.json(intel);
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve company intelligence', details: err?.message || String(err) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || !body.companyName) {
      return NextResponse.json(
        { error: 'Invalid payload: companyName is required' },
        { status: 400 }
      );
    }

    const intel: CompanyResearchIntel = {
      ...body,
      cachedAt: Date.now(),
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
    };

    setCompanyResearchCache(intel);
    return NextResponse.json({ ok: true, intel });
  } catch (err: any) {
    return NextResponse.json(
      { error: 'Failed to update company intelligence', details: err?.message || String(err) },
      { status: 500 }
    );
  }
}

