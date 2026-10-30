import { NextResponse } from 'next/server';
import { refreshGoogleOAuth } from '@/engine/settings';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const updatedOAuth = refreshGoogleOAuth();
    return NextResponse.json({ success: true, googleOAuth: updatedOAuth });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

