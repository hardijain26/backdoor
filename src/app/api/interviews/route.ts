import { NextRequest, NextResponse } from 'next/server';
import { getInterviewsWorkspaceState, addInterviewRound } from '@/engine/interviews-workspace';

export async function GET() {
  try {
    const state = getInterviewsWorkspaceState();
    return NextResponse.json(state, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.company || !body.roleTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: company and roleTitle are required' },
        { status: 400 }
      );
    }

    const created = addInterviewRound({
      company: String(body.company),
      roleTitle: String(body.roleTitle),
      roundType: body.roundType || 'HIRING_MANAGER',
      status: body.status || 'SCHEDULED',
      scheduledStart: body.scheduledStart || new Date().toISOString(),
      durationMinutes: Number(body.durationMinutes) || 45,
      meetUrl: body.meetUrl || 'https://meet.google.com/new',
      interviewerNames: Array.isArray(body.interviewerNames) ? body.interviewerNames : ['Interviewer'],
      interviewerTitles: Array.isArray(body.interviewerTitles) ? body.interviewerTitles : ['Hiring Team'],
      interviewerEmails: Array.isArray(body.interviewerEmails) ? body.interviewerEmails : [],
      overallSentiment: body.overallSentiment || 'NEUTRAL',
      executiveSummary: body.executiveSummary || 'New interview round scheduled.',
      verbatimTranscript: body.verbatimTranscript || '',
      myActionItems: Array.isArray(body.myActionItems) ? body.myActionItems : [],
      theirActionItems: Array.isArray(body.theirActionItems) ? body.theirActionItems : [],
      nextSteps: Array.isArray(body.nextSteps) ? body.nextSteps : [],
      thankYouDraftStaged: false,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
