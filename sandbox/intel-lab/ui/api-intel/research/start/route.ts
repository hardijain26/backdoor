/**
 * POST /api/intel/research/start
 * Subsystem: @intel/teardown (M5) - Task SCR-T11
 *
 * Starts an asynchronous multi-stage research crawl.
 * Returns 202 Accepted with the researchJobId in <= 500ms.
 */

import { NextRequest, NextResponse } from 'next/server';
import { startAsyncResearchJob } from '@/engine/research-queue';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { jobId, companyId, companyName, roleTitle, scopedProduct, forceRefresh } = body;

    if (!companyName || !roleTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: companyName and roleTitle are required' },
        { status: 400 }
      );
    }

    const job = await startAsyncResearchJob({
      jobId: jobId || `job-${Date.now()}`,
      companyId: companyId || `comp-${companyName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      companyName,
      roleTitle,
      scopedProduct: scopedProduct || companyName,
      forceRefresh: Boolean(forceRefresh),
    });

    return NextResponse.json(job, { status: 202 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to start research job';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

