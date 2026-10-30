import { NextResponse } from 'next/server';
import { exportDecisionEventsToCsv } from '@/engine/sheet-mirror';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const csvContent = exportDecisionEventsToCsv();
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="backdoor_decision_audit_${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

