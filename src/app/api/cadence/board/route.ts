import { NextResponse } from 'next/server';
import { getCadenceBoard } from '@/engine/cadence-lifecycle';
import { getRemainingDraftQuota } from '@/engine/cadence';

export async function GET() {
  try {
    const board = getCadenceBoard();
    const quota = getRemainingDraftQuota();

    return NextResponse.json({
      success: true,
      swimlanes: board.swimlanes,
      metrics: {
        ...board.metrics,
        quotaUsedToday: quota.usedToday,
        quotaRemainingToday: quota.remainingQuotaToday,
        quotaCap: quota.cap,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch cadence board' },
      { status: 500 }
    );
  }
}

