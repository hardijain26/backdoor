import { NextResponse } from 'next/server';
import { getRemainingDraftQuota } from '@/engine/cadence';

/**
 * GET /api/cadence/quota
 * Returns real-time draft quota utilization for current rolling 24-hour window (Rule R8).
 */
export async function GET() {
  const quota = getRemainingDraftQuota();
  return NextResponse.json(quota, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, must-revalidate',
    },
  });
}

