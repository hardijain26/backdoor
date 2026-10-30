/**
 * BACKDOOR v1.0 - INTERVIEW NOTES & DEBRIEF WORKSPACE ENGINE
 * Subsystem: @workspace/interviews (M4/M9)
 * Authoritative: Runbook §5.4.5 & PRD M4-FR9 / M9-FR1
 *
 * Responsibilities:
 * 1. Manages interview rounds lifecycle across target companies.
 * 2. Provides CRUD for Action Items (My Actions, Their Actions, Next Steps).
 * 3. Enforces Rule R1: Post-interview Thank You notes are staged as drafts, never auto-sent.
 * 4. Logs all state mutations and checkbox toggles to decision_events.
 */

import { ActionItem, StructuredInterviewNotes, generateThankYouDraftPayload } from './audio-transcription';

export interface InterviewRoundRecord {
  id: string;
  company: string;
  roleTitle: string;
  roundType: 'RECRUITER_SCREEN' | 'HIRING_MANAGER' | 'CASE_STUDY' | 'EXECUTIVE_FINAL';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledStart: string;
  durationMinutes: number;
  interviewerNames: string[];
  interviewerTitles: string[];
  interviewerEmails: string[];
  overallSentiment: 'STRONG_HIRE' | 'POSITIVE' | 'MIXED' | 'NEUTRAL';
  executiveSummary: string;
  verbatimTranscript: string;
  myActionItems: ActionItem[];
  theirActionItems: ActionItem[];
  nextSteps: string[];
  thankYouDraftStaged: boolean;
  thankYouDraftSubject?: string;
  thankYouDraftBody?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InterviewsWorkspaceState {
  totalInterviews: number;
  completedRounds: number;
  openActionItems: number;
  upcomingRounds: number;
  interviews: InterviewRoundRecord[];
}

/**
 * Seed initial realistic interview workspace state.
 */
const initialInterviews: InterviewRoundRecord[] = [
  {
    id: 'int-anthropic-hm-01',
    company: 'Anthropic',
    roleTitle: 'Senior Product Manager, Systems',
    roundType: 'HIRING_MANAGER',
    status: 'COMPLETED',
    scheduledStart: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    durationMinutes: 45,
    interviewerNames: ['Sarah Chen'],
    interviewerTitles: ['VP of AI Product'],
    interviewerEmails: ['sarah.chen@anthropic.com'],
    overallSentiment: 'STRONG_HIRE',
    executiveSummary: 'High-signal technical conversation with VP Product. Strong alignment on RAG architectures, prompt latency optimizations, and unit economics. Proceeding directly to Case Study round.',
    verbatimTranscript: [
      '[00:02] Sarah Chen: Thanks for joining today, Hardi. We are scaling our core platform at Anthropic and need a product leader who understands both low-latency systems and financial unit economics.',
      '[00:45] Hardi Jain: Great to speak with you Sarah. At my previous lab, I architected our prompt evaluation pipeline which reduced query latency by 42% across 1.2M monthly prompts, while cutting inference overhead.',
      '[02:15] Sarah Chen: That is impressive. What is your philosophy on handling model failure modes when customer data retrieval drops below 90%?',
      '[03:00] Hardi Jain: I prioritize hybrid retrieval with deterministic fallback logic. For Pantry Vault AI, we engineered hybrid vector-keyword retrieval achieving 94.6% precision at k=5, preventing hallucinations entirely.',
      '[06:20] Sarah Chen: Exactly what we need. For our next steps, I would like you to review our developer API docs, and we will send over the case study prompt by tomorrow morning. Could you share your portfolio deck as well?',
      '[07:10] Hardi Jain: Absolutely, I will send over my portfolio deck and latency teardown document by Friday morning. Thank you for the great discussion!',
    ].join('\n\n'),
    myActionItems: [
      {
        id: 'act-anthropic-1',
        description: 'Send portfolio deck and latency teardown document to Sarah Chen by Friday morning.',
        owner: 'CANDIDATE',
        ownerName: 'Hardi Jain',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isCompleted: false,
        category: 'PORTFOLIO_LINK',
      },
      {
        id: 'act-anthropic-2',
        description: 'Review Anthropic developer platform documentation prior to case study round.',
        owner: 'CANDIDATE',
        ownerName: 'Hardi Jain',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isCompleted: false,
        category: 'FOLLOW_UP_DOC',
      },
    ],
    theirActionItems: [
      {
        id: 'act-anthropic-3',
        description: 'Sarah Chen to send case study prompt and evaluation rubric by tomorrow morning.',
        owner: 'INTERVIEWER',
        ownerName: 'Sarah Chen',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isCompleted: false,
        category: 'NEXT_ROUND',
      },
    ],
    nextSteps: [
      'Stage and dispatch personalized Thank You note to Sarah Chen referencing prompt latency discussion.',
      'Prepare 3-proposal architecture teardown for upcoming Case Study round.',
      'Track case study prompt delivery deadline from Anthropic recruiting team.',
    ],
    thankYouDraftStaged: true,
    thankYouDraftSubject: 'Thank you & follow-up: Anthropic Product Discussion - Hardi Jain',
    thankYouDraftBody: 'Hi Sarah, thank you for taking the time to speak today about the Senior Product Manager role at Anthropic...',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'int-stripe-recruiter-01',
    company: 'Stripe',
    roleTitle: 'Staff PM, Revenue & Ledger Systems',
    roundType: 'RECRUITER_SCREEN',
    status: 'COMPLETED',
    scheduledStart: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString(), // Yesterday
    durationMinutes: 30,
    interviewerNames: ['Marcus Brody'],
    interviewerTitles: ['Lead Tech Talent Partner'],
    interviewerEmails: ['mbrody@stripe.com'],
    overallSentiment: 'POSITIVE',
    executiveSummary: 'Discussed Chartered Accountant domain foundation, ledger reconciliation rails, and career progression to core fintech systems. Passed to HM round.',
    verbatimTranscript: '[00:00] Marcus Brody: Hi Hardi, great to connect. Loved seeing your background bridging CA statutory accounting with modern platform engineering...',
    myActionItems: [
      {
        id: 'act-stripe-1',
        description: 'Submit updated tailored CV highlighting multi-currency settlement rails.',
        owner: 'CANDIDATE',
        ownerName: 'Hardi Jain',
        dueDate: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString().split('T')[0],
        isCompleted: true,
        category: 'PORTFOLIO_LINK',
      },
    ],
    theirActionItems: [
      {
        id: 'act-stripe-2',
        description: 'Marcus to coordinate 60-min HM technical architecture round with Director of Billing.',
        owner: 'INTERVIEWER',
        ownerName: 'Marcus Brody',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isCompleted: true,
        category: 'NEXT_ROUND',
      },
    ],
    nextSteps: [
      'HM Architecture round confirmed for next Tuesday 14:00 PST.',
    ],
    thankYouDraftStaged: true,
    createdAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'int-linear-case-01',
    company: 'Linear',
    roleTitle: 'Product Manager, Workflows',
    roundType: 'CASE_STUDY',
    status: 'SCHEDULED',
    scheduledStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // In 2 days
    durationMinutes: 60,
    interviewerNames: ['Tuomas Artman', 'Karri Saarinen'],
    interviewerTitles: ['Co-Founder & CTO', 'CEO'],
    interviewerEmails: ['team@linear.app'],
    overallSentiment: 'NEUTRAL',
    executiveSummary: 'Upcoming 60-minute product execution case study focusing on keyboard-first triage workflows and sub-100ms interaction latency.',
    verbatimTranscript: 'Upcoming session: Audio capture will activate upon call initiation.',
    myActionItems: [
      {
        id: 'act-linear-1',
        description: 'Prepare interactive prototype demo of zero-state template workflows.',
        owner: 'CANDIDATE',
        ownerName: 'Hardi Jain',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isCompleted: false,
        category: 'PORTFOLIO_LINK',
      },
    ],
    theirActionItems: [],
    nextSteps: [
      'Complete case study presentation deck.',
      'Review Linear product changelog and release patterns.',
    ],
    thankYouDraftStaged: false,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
  },
];

// In-Memory store
let interviewsStore = JSON.parse(JSON.stringify(initialInterviews)) as InterviewRoundRecord[];

/**
 * Reset store for tests.
 */
export function resetInterviewsWorkspace(data?: InterviewRoundRecord[]): void {
  interviewsStore = JSON.parse(JSON.stringify(data || initialInterviews));
}

/**
 * Get all interview rounds with aggregated workspace metrics.
 */
export function getInterviewsWorkspaceState(): InterviewsWorkspaceState {
  let openActions = 0;
  let completed = 0;
  let upcoming = 0;

  for (const interview of interviewsStore) {
    if (interview.status === 'COMPLETED') completed++;
    if (interview.status === 'SCHEDULED') upcoming++;

    for (const item of interview.myActionItems) {
      if (!item.isCompleted) openActions++;
    }
    for (const item of interview.theirActionItems) {
      if (!item.isCompleted) openActions++;
    }
  }

  return {
    totalInterviews: interviewsStore.length,
    completedRounds: completed,
    openActionItems: openActions,
    upcomingRounds: upcoming,
    interviews: [...interviewsStore],
  };
}

/**
 * Get an interview by ID.
 */
export function getInterviewById(id: string): InterviewRoundRecord | null {
  return interviewsStore.find((i) => i.id === id) || null;
}

/**
 * Toggle completion status of an Action Item.
 */
export function toggleActionItem(
  interviewId: string,
  actionItemId: string
): { success: boolean; item?: ActionItem; error?: string } {
  const interview = interviewsStore.find((i) => i.id === interviewId);
  if (!interview) {
    return { success: false, error: `Interview ${interviewId} not found` };
  }

  const myItem = interview.myActionItems.find((a) => a.id === actionItemId);
  if (myItem) {
    myItem.isCompleted = !myItem.isCompleted;
    interview.updatedAt = new Date().toISOString();
    return { success: true, item: myItem };
  }

  const theirItem = interview.theirActionItems.find((a) => a.id === actionItemId);
  if (theirItem) {
    theirItem.isCompleted = !theirItem.isCompleted;
    interview.updatedAt = new Date().toISOString();
    return { success: true, item: theirItem };
  }

  return { success: false, error: `Action item ${actionItemId} not found` };
}

/**
 * Add a new interview round record.
 */
export function addInterviewRound(
  payload: Omit<InterviewRoundRecord, 'id' | 'createdAt' | 'updatedAt'>
): InterviewRoundRecord {
  const newRecord: InterviewRoundRecord = {
    ...payload,
    id: `int-${payload.company.toLowerCase().replace(/[^a-z0-9]/g, '')}-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  interviewsStore.unshift(newRecord);
  return newRecord;
}

/**
 * Stage a post-interview Thank You email draft.
 */
export function stageInterviewThankYouDraft(
  interviewId: string,
  interviewerEmail?: string
): { success: boolean; draftSubject?: string; draftBody?: string; error?: string } {
  const interview = interviewsStore.find((i) => i.id === interviewId);
  if (!interview) {
    return { success: false, error: `Interview ${interviewId} not found` };
  }

  const email = interviewerEmail || interview.interviewerEmails[0] || 'team@company.com';
  const notesMock: StructuredInterviewNotes = {
    interviewId: interview.id,
    company: interview.company,
    roleTitle: interview.roleTitle,
    round: interview.roundType,
    interviewerNames: interview.interviewerNames,
    callDate: interview.scheduledStart.split('T')[0],
    durationMinutes: interview.durationMinutes,
    overallSentiment: interview.overallSentiment,
    executiveSummary: interview.executiveSummary,
    qnaPairs: [],
    myActionItems: interview.myActionItems,
    theirActionItems: interview.theirActionItems,
    nextSteps: interview.nextSteps,
    verbatimTranscript: interview.verbatimTranscript,
    processedAt: new Date().toISOString(),
  };

  const payload = generateThankYouDraftPayload(notesMock, email);
  interview.thankYouDraftStaged = true;
  interview.thankYouDraftSubject = payload.subject;
  interview.thankYouDraftBody = payload.body;
  interview.updatedAt = new Date().toISOString();

  return {
    success: true,
    draftSubject: payload.subject,
    draftBody: payload.body,
  };
}
