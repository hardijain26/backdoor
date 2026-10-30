import { NextRequest, NextResponse } from 'next/server';
import { stageGmailDraft, RuleR8SafetyCapExceededError, StagedDraftPayload } from '@/engine/cadence';
import { addStagedCadence } from '@/engine/cadence-lifecycle';

/**
 * POST /api/cadence/stage
 * Stages an outreach email draft in Gmail (Rule R1: Zero automated sends)
 * Enforces Rule R8 rolling 24h cap of 40 drafts.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body || !body.jobId || !body.company || !body.contactEmail || !body.contactName) {
      return NextResponse.json(
        { error: 'Missing mandatory fields: jobId, company, contactEmail, contactName are required.' },
        { status: 400 }
      );
    }

    const payload: StagedDraftPayload = {
      jobId: body.jobId,
      company: body.company,
      title: body.title || 'Product Manager',
      door: body.door || 'door1',
      contactEmail: body.contactEmail,
      contactName: body.contactName,
      location: body.location,
      customSubject: body.customSubject,
      customBody: body.customBody,
    };

    const staged = stageGmailDraft(payload);

    // Register active campaign into Module 7 Cadence Board
    addStagedCadence({
      id: staged.cadenceId,
      jobId: payload.jobId,
      company: payload.company,
      jobTitle: payload.title,
      location: payload.location || 'Remote',
      contactName: payload.contactName,
      contactTitle:
        payload.door === 'door1'
          ? 'VP of Product'
          : payload.door === 'door2'
          ? 'Lead Recruiter'
          : 'Staff PM',
      contactEmail: payload.contactEmail,
      door: payload.door,
      channel: 'GMAIL',
      stepNumber: 1,
      status: 'DRAFT_CREATED',
      suggestedSendAt: staged.suggestedSendAt,
      primaryDispatchWindow: staged.timezoneBadge,
      gmailDraftId: staged.gmailDraftId,
      gmailDeepLink: staged.gmailDeepLink,
      subject: staged.subject,
      bodyText: staged.bodyText,
      linkedInNote: `Hi ${payload.contactName.split(' ')[0]}, noticed ${payload.company}'s product momentum. Having scaled systems from 0 to 1M users, I have specific ideas on your growth roadmap.`,
    });

    return NextResponse.json(staged, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    if (error instanceof RuleR8SafetyCapExceededError) {
      return NextResponse.json(
        {
          error: error.message,
          currentCount: error.currentCount,
          cap: error.cap,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Failed to stage email draft in Gmail.' },
      { status: 500 }
    );
  }
}

