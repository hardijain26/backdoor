import { NextRequest, NextResponse } from 'next/server';
import {
  transcribeAudioChunk,
  extractStructuredNotesFromTranscript,
  validateAudioChunkSize,
} from '@/engine/audio-transcription';
import { addInterviewRound, getInterviewById } from '@/engine/interviews-workspace';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const chunkIndex = Number(formData.get('chunkIndex') || 0);
    const isLastChunk = formData.get('isLastChunk') === 'true';
    const company = String(formData.get('company') || 'Target Company');
    const roleTitle = String(formData.get('roleTitle') || 'Product Manager');
    const existingInterviewId = formData.get('interviewId') as string | null;

    let buffer: Buffer;

    if (audioFile) {
      const arrayBuffer = await audioFile.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      // Empty buffer fallback for chunk signaling
      buffer = Buffer.alloc(1024);
    }

    if (!validateAudioChunkSize(buffer.length)) {
      return NextResponse.json(
        { error: `Audio chunk exceeds 25MB limit (${(buffer.length / (1024 * 1024)).toFixed(2)} MB)` },
        { status: 413 }
      );
    }

    const interviewId = existingInterviewId || `int-${company.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`;

    // 1. Transcribe audio with Groq Whisper
    const transcription = await transcribeAudioChunk(buffer, {
      interviewId,
      company,
      round: 'HIRING_MANAGER',
      chunkIndex,
    });

    // 2. Extract structured notes
    const notes = extractStructuredNotesFromTranscript(
      transcription.transcriptText,
      interviewId,
      company,
      roleTitle,
      'HIRING_MANAGER'
    );

    // 3. Upsert into workspace
    const existing = getInterviewById(interviewId);
    if (!existing) {
      addInterviewRound({
        company: notes.company,
        roleTitle: notes.roleTitle,
        roundType: notes.round,
        status: isLastChunk ? 'COMPLETED' : 'IN_PROGRESS',
        scheduledStart: new Date().toISOString(),
        durationMinutes: notes.durationMinutes,
        interviewerNames: notes.interviewerNames,
        interviewerTitles: ['Hiring Team Leader'],
        interviewerEmails: [`contact@${company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`],
        overallSentiment: notes.overallSentiment,
        executiveSummary: notes.executiveSummary,
        verbatimTranscript: notes.verbatimTranscript,
        myActionItems: notes.myActionItems,
        theirActionItems: notes.theirActionItems,
        nextSteps: notes.nextSteps,
        thankYouDraftStaged: false,
      });
    }

    return NextResponse.json(
      {
        success: true,
        interviewId,
        chunkIndex,
        isLastChunk,
        transcriptionSource: transcription.source,
        notes,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
