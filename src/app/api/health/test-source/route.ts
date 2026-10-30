import { NextRequest, NextResponse } from 'next/server';
import { testSourceRunner } from '@/engine/fleet-health';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.sourceId) {
      return NextResponse.json({ error: 'sourceId is required' }, { status: 400 });
    }

    const result = await testSourceRunner(String(body.sourceId));
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
