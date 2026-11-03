import { NextRequest, NextResponse } from 'next/server';
import { fetchVentureHnJobs } from '@/engine/venture-hn-crawler';
import { fetchDirectFeedJobs } from '@/engine/direct-feeds';
import { addWebhookIngestedJob } from '@/engine/webhook-ingest';

export const dynamic = 'force-dynamic';

/**
 * GET /api/ingest/funding
 * Returns live/cached roles from Hacker News, Venture Funding tracker, Headcount Labs & YubHub.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetRole = searchParams.get('role') || undefined;

    const [ventureHnJobs, directFeedJobs] = await Promise.all([
      fetchVentureHnJobs(targetRole),
      fetchDirectFeedJobs()
    ]);

    const allJobs = [...ventureHnJobs, ...directFeedJobs];

    return NextResponse.json({
      success: true,
      count: allJobs.length,
      sources: ['hacker_news', 'venture_funding', 'headcount_labs', 'yubhub'],
      jobs: allJobs
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to ingest funding & directory feeds'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/ingest/funding
 * Triggers live sync of Hacker News, TechCrunch/Crunchbase funding rounds, Headcount Labs & YubHub,
 * staging all items directly into Backdoor's active job store.
 */
export async function POST(req: NextRequest) {
  try {
    let targetRole: string | undefined;
    try {
      const body = await req.json();
      targetRole = body?.role;
    } catch {
      // Body is optional
    }
    const { searchParams } = new URL(req.url);
    if (!targetRole) {
      targetRole = searchParams.get('role') || undefined;
    }

    const [ventureHnJobs, directFeedJobs] = await Promise.all([
      fetchVentureHnJobs(targetRole),
      fetchDirectFeedJobs()
    ]);

    const allJobs = [...ventureHnJobs, ...directFeedJobs];

    for (const job of allJobs) {
      addWebhookIngestedJob(job);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${allJobs.length} opportunities from Hacker News, Venture Funding, Headcount Labs & YubHub!`,
      count: allJobs.length,
      jobs: allJobs
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to sync funding & directory feeds'
      },
      { status: 500 }
    );
  }
}

