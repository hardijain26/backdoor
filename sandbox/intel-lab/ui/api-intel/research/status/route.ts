/**
 * GET /api/intel/research/status?researchJobId=...
 * Subsystem: @intel/teardown (M5) - Task SCR-T11
 *
 * Polling endpoint for multi-stage research crawl status.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getResearchJobStatus, findActiveJobByTarget } from '@/engine/research-queue';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const researchJobId = searchParams.get('researchJobId');
    const companyId = searchParams.get('companyId');
    const jobId = searchParams.get('jobId');

    if (researchJobId) {
      const job = getResearchJobStatus(researchJobId);
      if (!job) {
        return NextResponse.json({ error: 'Research job not found' }, { status: 404 });
      }
      return NextResponse.json(job);
    }

    if (companyId && jobId) {
      const active = findActiveJobByTarget(companyId, jobId);
      if (active) {
        return NextResponse.json(active);
      }
      return NextResponse.json({ status: 'IDLE', message: 'No active research job for this role.' });
    }

    return NextResponse.json(
      { error: 'Must provide researchJobId or companyId and jobId' },
      { status: 400 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error fetching research job status';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

