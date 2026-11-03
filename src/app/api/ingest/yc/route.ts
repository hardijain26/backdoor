import { NextRequest, NextResponse } from 'next/server';
import { fetchYcStartupJobs } from '@/engine/yc-crawler';
import { addWebhookIngestedJob } from '@/engine/webhook-ingest';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ingest/yc
 * Returns all active YC Product roles from the autonomous crawler cache.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const force = searchParams.get('force') === 'true';
    const roleCategory = searchParams.get('category') || searchParams.get('role') || undefined;

    const jobs = await fetchYcStartupJobs({ forceRefresh: force, roleCategory });

    return NextResponse.json({
      success: true,
      count: jobs.length,
      source: 'yc_startup',
      service: 'Backdoor Autonomous YC Startup Crawler',
      jobs
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to crawl YC Startup roles'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ingest/yc
 * Forces an immediate live crawl of Y Combinator / Work at a Startup,
 * stages all extracted roles into Backdoor's active job store, and returns the result.
 */
export async function POST(req: NextRequest) {
  try {
    let roleCategory: string | undefined;
    try {
      const body = await req.json();
      roleCategory = body?.category || body?.role;
    } catch {
      // Body is optional
    }

    const jobs = await fetchYcStartupJobs({ forceRefresh: true, roleCategory });

    // Stage into persistent webhook store so Morning Radar displays them
    for (const job of jobs) {
      addWebhookIngestedJob(job);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully crawled and staged ${jobs.length} YC Product roles directly into Backdoor.`,
      count: jobs.length,
      source: 'yc_startup',
      jobs
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to crawl and stage YC Startup roles'
      },
      { status: 500 }
    );
  }
}
