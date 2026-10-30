import { NextRequest, NextResponse } from 'next/server';
import { updateProfileLocation } from '@/engine/settings';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { country, state, detectedBrowserTimezone } = body;

    if (!country) {
      return NextResponse.json(
        { success: false, error: 'Country is required' },
        { status: 400 }
      );
    }

    const updatedProfile = updateProfileLocation({
      country,
      state: state || '',
      detectedBrowserTimezone,
    });

    return NextResponse.json({ success: true, profile: updatedProfile });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

