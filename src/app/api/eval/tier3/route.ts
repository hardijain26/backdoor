import { NextRequest, NextResponse } from 'next/server';
import { evaluateTier3Dossier, Tier3EvaluationInput } from '@/engine/tier3-eval';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body || !body.jobId || !body.company || !body.title) {
      return NextResponse.json(
        { error: 'Missing required fields: jobId, company, and title are required.' },
        { status: 400 }
      );
    }

    const input: Tier3EvaluationInput = {
      jobId: String(body.jobId),
      company: String(body.company),
      title: String(body.title),
      description: body.description ? String(body.description) : '',
      requiredSkills: Array.isArray(body.requiredSkills) ? body.requiredSkills : [],
      fitScore: typeof body.fitScore === 'number' ? body.fitScore : 75,
      targetTrack: body.targetTrack,
    };

    const result = evaluateTier3Dossier(input);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
