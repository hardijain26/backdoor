import { NextRequest, NextResponse } from 'next/server';
import { toggleActionItem, stageInterviewThankYouDraft } from '@/engine/interviews-workspace';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ interview_id: string }> }
) {
  try {
    const { interview_id } = await params;
    const body = await req.json();

    if (body.action === 'STAGE_THANK_YOU') {
      const res = stageInterviewThankYouDraft(interview_id, body.email);
      if (!res.success) {
        return NextResponse.json({ error: res.error }, { status: 404 });
      }
      return NextResponse.json(res, { status: 200 });
    }

    if (!body.actionItemId) {
      return NextResponse.json(
        { error: 'actionItemId is required to toggle completion status' },
        { status: 400 }
      );
    }

    const result = toggleActionItem(interview_id, body.actionItemId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
