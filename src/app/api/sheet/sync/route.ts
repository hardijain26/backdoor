import { NextRequest, NextResponse } from 'next/server';
import { getSheetSyncSummary, executeSheetSyncBatch } from '@/engine/sheet-mirror';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const summary = getSheetSyncSummary();
    return NextResponse.json({ success: true, summary });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const result = await executeSheetSyncBatch({
      forceFullResync: Boolean(body?.forceFullResync),
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

