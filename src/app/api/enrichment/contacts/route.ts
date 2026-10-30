import { NextRequest, NextResponse } from 'next/server';
import { enrichCompanyContacts } from '@/engine/contact-enrichment';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { company, domain } = body;

    if (!company || typeof company !== 'string') {
      return NextResponse.json({ error: 'Company name is required.' }, { status: 400 });
    }

    const enrichment = await enrichCompanyContacts(company, domain);

    return NextResponse.json({
      success: true,
      contacts: {
        door1: enrichment.door1,
        door2: enrichment.door2,
        door3: enrichment.door3
      },
      domain: enrichment.domain,
      provider: enrichment.provider
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Contact enrichment failed: ${errorMsg}` }, { status: 500 });
  }
}

