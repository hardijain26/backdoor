import { NextRequest, NextResponse } from 'next/server';
import { syncGmailJobAlerts, getIngestedAlertJobs } from '@/engine/gmail-ingest';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const jobs = getIngestedAlertJobs();
    return NextResponse.json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    let lookbackHours = 24;
    try {
      const body = await req.json();
      if (body && typeof body.lookbackHours === 'number') {
        lookbackHours = body.lookbackHours;
      }
    } catch {
      // Body is optional
    }

    const result = await syncGmailJobAlerts({ lookbackHours });
    return NextResponse.json({
      success: true,
      count: result.count,
      sources: result.sources,
      queriesScanned: result.queriesScanned,
      jobs: result.jobs,
      message: `Successfully scanned Gmail inbox (${result.queriesScanned.length} queries) and ingested ${result.count} new roles.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

