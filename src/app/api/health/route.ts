import { NextResponse } from 'next/server';
import { getFleetHealthSummary } from '@/engine/fleet-health';

export async function GET() {
  try {
    const summary = getFleetHealthSummary();
    return NextResponse.json(summary, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

