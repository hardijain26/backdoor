import { NextRequest, NextResponse } from 'next/server';
import { testByokKey } from '@/engine/settings';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { keyId } = body;

    if (!keyId) {
      return NextResponse.json(
        { success: false, error: 'keyId is required' },
        { status: 400 }
      );
    }

    const testResult = await testByokKey(keyId);
    return NextResponse.json(testResult);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

