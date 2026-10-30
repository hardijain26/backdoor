/**
 * Backdoor Outreach Cadence Lifecycle State Machine & Thread Watcher Engine
 * Subsystem 4: Business Logic & Cadence Workflows (@cadence/engine M7)
 * Runbook §5.7 | PRD M7 | Cardinal Rules R1 & R8 Invariants
 */

export type CadenceStepStatus =
  | 'DRAFT_PENDING'
  | 'DRAFT_CREATED'
  | 'SENT'
  | 'FOLLOW_UP_DUE'
  | 'REPLIED'
  | 'IN_CONVERSATION'
  | 'BOUNCED'
  | 'CANCELLED';

export type CadenceSwimlane =
  | 'DRAFT_READY'
  | 'SENT'
  | 'FOLLOW_UP_DUE'
  | 'IN_CONVERSATION'
  | 'CLOSED';

export type OutreachDoor = 'door1' | 'door2' | 'door3';

export interface CadenceItem {
  id: string;
  jobId: string;
  company: string;
  jobTitle: string;
  location: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  door: OutreachDoor;
  channel: 'GMAIL' | 'LINKEDIN';
  stepNumber: 1 | 2 | 3;
  status: CadenceStepStatus;
  swimlane: CadenceSwimlane;
  suggestedSendAt: string;
  primaryDispatchWindow: string; // e.g. "Tue 14:45 IST (09:15 London local)"
  sentAt?: string;
  repliedAt?: string;
  gmailDraftId?: string;
  gmailThreadId?: string;
  gmailDeepLink: string;
  subject: string;
  bodyText: string;
  linkedInNote: string;
  followUpDueDate?: string;
  lastEventNote?: string;
  updatedAt: string;
}

export interface DecisionAuditEvent {
  id: string;
  aggregateType: 'CADENCE';
  aggregateId: string;
  action: string;
  actor: 'hardi' | 'thread_watcher' | 'manual_override';
  previousStatus: CadenceStepStatus;
  newStatus: CadenceStepStatus;
  timestamp: string;
  metadata?: Record<string, any>;
}

// In-memory campaign store initialized with high-signal Backdoor roles
const initialCampaigns: CadenceItem[] = [
  {
    id: 'cadence-figma-01',
    jobId: 'job-4',
    company: 'Figma',
    jobTitle: 'Senior Product Manager, Systems',
    location: 'Remote (US)',
    contactName: 'Sho Kuwamoto',
    contactTitle: 'VP of Product',
    contactEmail: 'skuwamoto@figma.com',
    door: 'door1',
    channel: 'GMAIL',
    stepNumber: 1,
    status: 'DRAFT_CREATED',
    swimlane: 'DRAFT_READY',
    suggestedSendAt: new Date(Date.now() + 86400000).toISOString(),
    primaryDispatchWindow: 'Tue 22:45 IST (09:15 San Francisco local)',
    gmailDraftId: 'draft-figma-101',
    gmailDeepLink: 'https://mail.google.com/mail/?view=cm&fs=1&to=skuwamoto%40figma.com&su=Product%20leadership%20at%20Figma%20%E2%80%94%20scaling%20systems',
    subject: 'Product leadership at Figma — scaling systems',
    bodyText: 'Hi Sho,\n\nNoticed Figma’s recent platform expansions into systems-level developer tooling. Having scaled user onboarding from 0 to 1M users with 99.9% uptime, I put together a teardown on enterprise workflow friction.\n\nAttached my tailored CV for the Systems role.\n\nBest,\nHardi Jain',
    linkedInNote: 'Hi Sho, noticed Figma is scaling systems-level workflows. Having scaled product systems from 0 to 1M users, I have specific ideas on team adoption friction. Would love to share insights.',
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'cadence-openai-02',
    jobId: 'job-3',
    company: 'OpenAI',
    jobTitle: 'Product Manager, Applied Research',
    location: 'San Francisco, CA',
    contactName: 'Peter Welinder',
    contactTitle: 'VP Product',
    contactEmail: 'pwelinder@openai.com',
    door: 'door1',
    channel: 'GMAIL',
    stepNumber: 1,
    status: 'SENT',
    swimlane: 'SENT',
    suggestedSendAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    primaryDispatchWindow: 'Thu 22:45 IST (09:15 San Francisco local)',
    sentAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
    followUpDueDate: new Date(Date.now() + 86400000 * 1.5).toISOString(),
    gmailThreadId: 'thread-openai-202',
    gmailDeepLink: 'https://mail.google.com/mail/#inbox/thread-openai-202',
    subject: 'Applied research product acceleration at OpenAI',
    bodyText: 'Hi Peter,\n\nFollowing OpenAI’s enterprise API expansions, I evaluated your developer platform onboarding pipeline and highlighted 3 scaling friction points with concrete proposals.\n\nAttached my tailored CV.',
    linkedInNote: 'Hi Peter, tracking your applied research team momentum. Having shipped developer platforms to 1M+ users, I put together thoughts on enterprise evaluation friction.',
    lastEventNote: 'Candidate clicked manual Send in Gmail Web',
    updatedAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
  },
  {
    id: 'cadence-stripe-03',
    jobId: 'job-1',
    company: 'Stripe',
    jobTitle: 'Staff AI Product Manager',
    location: 'Remote (US/EU)',
    contactName: 'Sarah Lin',
    contactTitle: 'Lead Recruiter, Infrastructure',
    contactEmail: 'sarah.lin@stripe.com',
    door: 'door2',
    channel: 'GMAIL',
    stepNumber: 2,
    status: 'FOLLOW_UP_DUE',
    swimlane: 'FOLLOW_UP_DUE',
    suggestedSendAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    primaryDispatchWindow: 'Tue 14:45 IST (09:15 London local)',
    sentAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    followUpDueDate: new Date(Date.now() - 3600000 * 6).toISOString(), // overdue by 6 hours
    gmailThreadId: 'thread-stripe-303',
    gmailDeepLink: 'https://mail.google.com/mail/?view=cm&fs=1&to=sarah.lin%40stripe.com&su=Re%3A%20Staff%20AI%20Product%20Manager%20at%20Stripe',
    subject: 'Re: Staff AI Product Manager at Stripe — scaling systems',
    bodyText: 'Hi Sarah,\n\nCircling back on my note below regarding the Staff AI PM opening. Wanted to share a quick 1-pager on onboarding developer retention.\n\nBest,\nHardi Jain',
    linkedInNote: 'Hi Sarah, circling back on my application note for the Staff AI PM role. Looking forward to connecting when convenient.',
    lastEventNote: 'Day 3 milestone elapsed with zero inbound reply. Follow-up draft ready.',
    updatedAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 'cadence-linear-04',
    jobId: 'job-2',
    company: 'Linear',
    jobTitle: 'Lead Product Manager, Workflows',
    location: 'Remote (Global)',
    contactName: 'Karri Saarinen',
    contactTitle: 'Co-Founder & CEO',
    contactEmail: 'karri@linear.app',
    door: 'door1',
    channel: 'GMAIL',
    stepNumber: 1,
    status: 'IN_CONVERSATION',
    swimlane: 'IN_CONVERSATION',
    suggestedSendAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    primaryDispatchWindow: 'Wed 14:45 IST (09:15 SF local)',
    sentAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    repliedAt: new Date(Date.now() - 86400000).toISOString(),
    gmailThreadId: 'thread-linear-404',
    gmailDeepLink: 'https://mail.google.com/mail/#inbox/thread-linear-404',
    subject: 'Linear Workflows & Team Telemetry',
    bodyText: 'Hi Karri,\n\nLove the precision craftsmanship of Linear. Having built dev tools used daily by 100k+ engineers, I have a few specific ideas on async issue handoffs.',
    linkedInNote: 'Hi Karri, loved the recent Linear workflows launch. Having scaled dev productivity tools from 0 to 1M, would love to share a few observations.',
    lastEventNote: 'Inbound email received: "Thanks Hardi, lets chat Thursday." Follow-ups halted.',
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'cadence-notion-05',
    jobId: 'job-6',
    company: 'Notion',
    jobTitle: 'AI Workspaces PM',
    location: 'San Francisco, CA',
    contactName: 'Nadia Thorne',
    contactTitle: 'Director of Product',
    contactEmail: 'nadia@notion.so',
    door: 'door1',
    channel: 'GMAIL',
    stepNumber: 1,
    status: 'BOUNCED',
    swimlane: 'CLOSED',
    suggestedSendAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    primaryDispatchWindow: 'Tue 22:45 IST (09:15 SF local)',
    sentAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    gmailDeepLink: 'https://mail.google.com/mail/#sent',
    subject: 'AI Workspaces product architecture at Notion',
    bodyText: 'Hi Nadia,\n\nTracking Notion’s workspace velocity. Evaluating your permission architectures...',
    linkedInNote: 'Hi Nadia, following your AI workspace launch. Would love to share perspectives.',
    lastEventNote: 'Mail delivery subsystem returned 550 No Such User Here. Draft archived.',
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

let activeCampaigns: CadenceItem[] = JSON.parse(JSON.stringify(initialCampaigns));
const auditEvents: DecisionAuditEvent[] = [];

/**
 * Maps raw status to canonical Kanban swimlane
 */
export function mapStatusToSwimlane(status: CadenceStepStatus): CadenceSwimlane {
  switch (status) {
    case 'DRAFT_PENDING':
    case 'DRAFT_CREATED':
      return 'DRAFT_READY';
    case 'SENT':
      return 'SENT';
    case 'FOLLOW_UP_DUE':
      return 'FOLLOW_UP_DUE';
    case 'REPLIED':
    case 'IN_CONVERSATION':
      return 'IN_CONVERSATION';
    case 'BOUNCED':
    case 'CANCELLED':
      return 'CLOSED';
  }
}

/**
 * Returns all active campaigns grouped by Kanban swimlane
 */
export function getCadenceBoard(): {
  swimlanes: Record<CadenceSwimlane, CadenceItem[]>;
  metrics: {
    totalActive: number;
    inConversation: number;
    followUpsDue: number;
    draftsReady: number;
    closed: number;
  };
} {
  const swimlanes: Record<CadenceSwimlane, CadenceItem[]> = {
    DRAFT_READY: [],
    SENT: [],
    FOLLOW_UP_DUE: [],
    IN_CONVERSATION: [],
    CLOSED: [],
  };

  for (const item of activeCampaigns) {
    swimlanes[item.swimlane].push(item);
  }

  return {
    swimlanes,
    metrics: {
      totalActive: activeCampaigns.filter((c) => c.swimlane !== 'CLOSED').length,
      inConversation: swimlanes.IN_CONVERSATION.length,
      followUpsDue: swimlanes.FOLLOW_UP_DUE.length,
      draftsReady: swimlanes.DRAFT_READY.length,
      closed: swimlanes.CLOSED.length,
    },
  };
}

/**
 * Transitions a cadence campaign to a new status according to state machine rules
 */
export function transitionCadence(
  cadenceId: string,
  action: 'MARK_SENT' | 'ADVANCE_FOLLOW_UP' | 'INBOUND_REPLY' | 'REPLIED_LINKEDIN' | 'CANCEL' | 'BOUNCE',
  actor: 'hardi' | 'thread_watcher' | 'manual_override' = 'hardi',
  note?: string
): { success: boolean; cadence: CadenceItem; event: DecisionAuditEvent } {
  const index = activeCampaigns.findIndex((c) => c.id === cadenceId);
  if (index === -1) {
    throw new Error(`Cadence with ID "${cadenceId}" not found`);
  }

  const current = activeCampaigns[index];
  const prevStatus = current.status;
  let newStatus: CadenceStepStatus = current.status;
  let eventNote = note || '';

  const now = new Date().toISOString();

  switch (action) {
    case 'MARK_SENT':
      newStatus = 'SENT';
      current.sentAt = now;
      // Follow up scheduled for +3 business days (~72h)
      current.followUpDueDate = new Date(Date.now() + 86400000 * 3).toISOString();
      eventNote = eventNote || 'Marked as sent by candidate. Thread watcher activated.';
      break;

    case 'ADVANCE_FOLLOW_UP':
      newStatus = 'FOLLOW_UP_DUE';
      current.stepNumber = (Math.min(3, current.stepNumber + 1) as 1 | 2 | 3);
      eventNote = eventNote || `Follow-up Day ${current.stepNumber === 2 ? '3' : '5'} due.`;
      break;

    case 'INBOUND_REPLY':
    case 'REPLIED_LINKEDIN':
      newStatus = 'IN_CONVERSATION';
      current.repliedAt = now;
      eventNote =
        action === 'INBOUND_REPLY'
          ? 'Inbound Gmail reply detected by thread watcher. Automated follow-ups halted.'
          : 'Candidate marked reply received on LinkedIn. Touchpoint advanced to In Conversation.';
      break;

    case 'CANCEL':
      newStatus = 'CANCELLED';
      eventNote = eventNote || 'Cadence cancelled by candidate.';
      break;

    case 'BOUNCE':
      newStatus = 'BOUNCED';
      eventNote = eventNote || 'Delivery failed or bounced. Cadence closed.';
      break;
  }

  current.status = newStatus;
  current.swimlane = mapStatusToSwimlane(newStatus);
  current.lastEventNote = eventNote;
  current.updatedAt = now;

  const event: DecisionAuditEvent = {
    id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    aggregateType: 'CADENCE',
    aggregateId: cadenceId,
    action,
    actor,
    previousStatus: prevStatus,
    newStatus,
    timestamp: now,
    metadata: { note: eventNote },
  };

  auditEvents.push(event);

  return {
    success: true,
    cadence: current,
    event,
  };
}

/**
 * Ingests a new staged draft from /radar into the Cadence Board
 */
export function addStagedCadence(item: Omit<CadenceItem, 'swimlane' | 'updatedAt'>): CadenceItem {
  const fullItem: CadenceItem = {
    ...item,
    swimlane: mapStatusToSwimlane(item.status),
    updatedAt: new Date().toISOString(),
  };

  // Add to top of active list
  activeCampaigns = [fullItem, ...activeCampaigns];
  return fullItem;
}

/**
 * Returns immutable decision events audit trail
 */
export function getDecisionAuditEvents(cadenceId?: string): DecisionAuditEvent[] {
  if (cadenceId) {
    return auditEvents.filter((e) => e.aggregateId === cadenceId);
  }
  return [...auditEvents];
}

/**
 * Resets state (for testing harness isolation)
 */
export function resetCadenceBoard(): void {
  activeCampaigns = JSON.parse(JSON.stringify(initialCampaigns));
  auditEvents.length = 0;
}
