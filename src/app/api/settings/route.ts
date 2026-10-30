import { NextRequest, NextResponse } from 'next/server';
import {
  getSettingsWorkspace,
  updateNegativeFilterRules,
  updateDynamicTracks,
  saveByokSecretKey,
} from '@/engine/settings';
import { toggleSourceEnabled } from '@/engine/fleet-health';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = getSettingsWorkspace();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.negativeFilters) {
      updateNegativeFilterRules(body.negativeFilters);
    }

    if (body.dynamicTracks) {
      updateDynamicTracks(body.dynamicTracks);
    }

    if (body.byokKey) {
      saveByokSecretKey(body.byokKey.id, body.byokKey.value);
    }

    if (body.sourceToggle) {
      toggleSourceEnabled(body.sourceToggle.sourceId, body.sourceToggle.enabled);
    }

    const updated = getSettingsWorkspace();
    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 400 }
    );
  }
}

