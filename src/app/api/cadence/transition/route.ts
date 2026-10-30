import { NextResponse } from 'next/server';
import { transitionCadence } from '@/engine/cadence-lifecycle';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cadenceId, action, actor, note } = body;

    if (!cadenceId || !action) {
      return NextResponse.json(
        { error: 'cadenceId and action are required parameters' },
        { status: 400 }
      );
    }

    const result = transitionCadence(cadenceId, action, actor || 'hardi', note);

    return NextResponse.json({
      success: true,
      cadence: result.cadence,
      event: result.event,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to transition cadence' },
      { status: 400 }
    );
  }
}

