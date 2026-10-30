import { NextResponse } from 'next/server';
import { getConversionFunnelTelemetry } from '@/engine/sheet-mirror';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const funnel = getConversionFunnelTelemetry();
    return NextResponse.json({ success: true, funnel });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

