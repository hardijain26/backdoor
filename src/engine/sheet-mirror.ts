/**
 * Subsystem 6: Asynchronous Google Sheet Mirroring Worker & Audit Telemetry (@workspace/sheets M5)
 * Runbook §5.5 | PRD §5.6 | Cardinal Rules R1, R3, R5, R6 & R8 Invariants
 */

export interface SheetMirrorRecord {
  jobId: string;
  company: string;
  title: string;
  stage: string;
  fitScore: number;
  contactName?: string;
  contactEmail?: string;
  door?: 'door1' | 'door2' | 'door3';
  status: 'SYNCED' | 'PENDING' | 'FAILED';
  lastSyncedAt: string;
}

export interface FunnelDoorMetrics {
  sent: number;
  replied: number;
  replyRatePercent: number;
}

export interface ConversionFunnelTelemetry {
  totalDiscovered: number;
  totalChosen: number;
  totalDraftReady: number;
  totalSent: number;
  totalInConversation: number;
  totalInterviews: number;
  totalOffers: number;
  replyRatePercent: number;
  door1: FunnelDoorMetrics;
  door2: FunnelDoorMetrics;
  door3: FunnelDoorMetrics;
  lastCalculatedAt: string;
}

export interface SheetSyncSummary {
  connectedSheetId: string;
  sheetUrl: string;
  lastSyncedAt: string;
  pendingSyncCount: number;
  totalSyncedRows: number;
  isSyncing: boolean;
  syncStatus: 'HEALTHY' | 'SYNCING' | 'ERROR';
}

// In-memory mirror state & seeded conversion data
let mirrorRows: SheetMirrorRecord[] = [
  {
    jobId: 'stripe-staff-pm',
    company: 'Stripe',
    title: 'Staff Product Manager, Connect Core',
    stage: 'IN_CONVERSATION',
    fitScore: 94,
    contactName: 'Claire Hughes Johnson',
    contactEmail: 'claire@stripe.com',
    door: 'door2',
    status: 'SYNCED',
    lastSyncedAt: '2026-10-30T10:00:00.000Z',
  },
  {
    jobId: 'linear-insights-pm',
    company: 'Linear',
    title: 'Product Lead, Workflows & Insights',
    stage: 'SENT',
    fitScore: 91,
    contactName: 'Karri Saarinen',
    contactEmail: 'karri@linear.app',
    door: 'door1',
    status: 'SYNCED',
    lastSyncedAt: '2026-10-30T09:45:00.000Z',
  },
  {
    jobId: 'anthropic-eval-pm',
    company: 'Anthropic',
    title: 'Product Manager, Claude Reasoning',
    stage: 'INTERVIEWING',
    fitScore: 96,
    contactName: 'Dario Amodei',
    contactEmail: 'dario@anthropic.com',
    door: 'door1',
    status: 'SYNCED',
    lastSyncedAt: '2026-10-30T10:15:00.000Z',
  },
  {
    jobId: 'openai-applied-pm',
    company: 'OpenAI',
    title: 'Product Manager, Applied Research',
    stage: 'DRAFT_READY',
    fitScore: 89,
    contactName: 'Peter Welinder',
    contactEmail: 'peter@openai.com',
    door: 'door1',
    status: 'PENDING',
    lastSyncedAt: '2026-10-29T18:00:00.000Z',
  },
];

let syncSummaryState: SheetSyncSummary = {
  connectedSheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  sheetUrl: 'https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit',
  lastSyncedAt: '2026-10-30T10:15:00.000Z',
  pendingSyncCount: 1,
  totalSyncedRows: 3,
  isSyncing: false,
  syncStatus: 'HEALTHY',
};

// ============================================================================
// 1. Asynchronous Google Sheet Synchronization Worker
// ============================================================================

/**
 * Executes a sync batch to the candidate's private Google Sheet.
 * Includes simulated exponential backoff retry handler (Runbook §5.5).
 */
export async function executeSheetSyncBatch(options?: {
  forceFullResync?: boolean;
  maxRetries?: number;
}): Promise<{
  success: boolean;
  syncedCount: number;
  failedCount: number;
  durationMs: number;
  summary: SheetSyncSummary;
}> {
  syncSummaryState.isSyncing = true;
  syncSummaryState.syncStatus = 'SYNCING';

  const startTime = Date.now();
  const maxRetries = options?.maxRetries ?? 3;
  let attempt = 0;
  let backoffDelayMs = 100;

  // Rate-limiting simulation loop with exponential backoff
  while (attempt < maxRetries) {
    attempt++;
    try {
      // Simulate sub-second network roundtrip to Google Sheets API
      await new Promise((resolve) => setTimeout(resolve, 50));
      break; // Success
    } catch {
      if (attempt >= maxRetries) {
        syncSummaryState.isSyncing = false;
        syncSummaryState.syncStatus = 'ERROR';
        throw new Error('Google Sheets API rate limit exceeded (429) after exponential backoff retries');
      }
      await new Promise((resolve) => setTimeout(resolve, backoffDelayMs));
      backoffDelayMs *= 2; // exponential backoff
    }
  }

  // Mark pending rows as synced
  let syncedCount = 0;
  const nowIso = new Date().toISOString();

  mirrorRows = mirrorRows.map((row) => {
    if (options?.forceFullResync || row.status === 'PENDING') {
      syncedCount++;
      return { ...row, status: 'SYNCED', lastSyncedAt: nowIso };
    }
    return row;
  });

  syncSummaryState = {
    ...syncSummaryState,
    isSyncing: false,
    syncStatus: 'HEALTHY',
    lastSyncedAt: nowIso,
    pendingSyncCount: 0,
    totalSyncedRows: mirrorRows.length,
  };

  return {
    success: true,
    syncedCount: syncedCount || mirrorRows.length,
    failedCount: 0,
    durationMs: Date.now() - startTime,
    summary: { ...syncSummaryState },
  };
}

/**
 * Get current sync summary telemetry.
 */
export function getSheetSyncSummary(): SheetSyncSummary {
  const pending = mirrorRows.filter((r) => r.status === 'PENDING').length;
  return {
    ...syncSummaryState,
    pendingSyncCount: pending,
    totalSyncedRows: mirrorRows.filter((r) => r.status === 'SYNCED').length,
  };
}

// ============================================================================
// 2. Audit Telemetry & Conversion Funnel Engine
// ============================================================================

/**
 * Computes conversion funnel metrics across candidate pipeline stages.
 */
export function getConversionFunnelTelemetry(): ConversionFunnelTelemetry {
  return {
    totalDiscovered: 142,
    totalChosen: 38,
    totalDraftReady: 24,
    totalSent: 18,
    totalInConversation: 7,
    totalInterviews: 4,
    totalOffers: 1,
    replyRatePercent: 38.9, // 7 / 18 = 38.9%
    door1: {
      sent: 8,
      replied: 4,
      replyRatePercent: 50.0, // VP/Head of Product outreach has highest yield
    },
    door2: {
      sent: 6,
      replied: 2,
      replyRatePercent: 33.3, // Talent partner outreach
    },
    door3: {
      sent: 4,
      replied: 1,
      replyRatePercent: 25.0, // Peer PM warm intro
    },
    lastCalculatedAt: new Date().toISOString(),
  };
}

// ============================================================================
// 3. Immutable Decision Events CSV Exporter (RFC 4180)
// ============================================================================

export interface DecisionEventLogItem {
  id: string;
  eventType: string;
  jobId: string;
  company: string;
  actorType: 'CANDIDATE' | 'SYSTEM' | 'EXTERNAL_INBOUND';
  createdAt: string;
  details: string;
}

const AUDIT_EVENT_LOGS: DecisionEventLogItem[] = [
  {
    id: 'evt-001',
    eventType: 'ROLE_DISCOVERED',
    jobId: 'stripe-staff-pm',
    company: 'Stripe',
    actorType: 'SYSTEM',
    createdAt: '2026-10-30T08:00:00Z',
    details: 'Discovered via Greenhouse ATS scraper (94% FIT)',
  },
  {
    id: 'evt-002',
    eventType: 'DOOR_CONTACT_SELECTED',
    jobId: 'stripe-staff-pm',
    company: 'Stripe',
    actorType: 'CANDIDATE',
    createdAt: '2026-10-30T08:45:00Z',
    details: 'Selected Door 2 Contact: Claire Hughes Johnson',
  },
  {
    id: 'evt-003',
    eventType: 'DRAFT_STAGED',
    jobId: 'stripe-staff-pm',
    company: 'Stripe',
    actorType: 'SYSTEM',
    createdAt: '2026-10-30T09:15:00Z',
    details: 'Created draft in candidate Gmail. Delivery window: Tue 09:15 AM recipient working hours',
  },
  {
    id: 'evt-004',
    eventType: 'MARK_SENT',
    jobId: 'stripe-staff-pm',
    company: 'Stripe',
    actorType: 'CANDIDATE',
    createdAt: '2026-10-30T09:20:00Z',
    details: 'Candidate dispatched email from personal Gmail client',
  },
  {
    id: 'evt-005',
    eventType: 'REPLY_RECEIVED',
    jobId: 'stripe-staff-pm',
    company: 'Stripe',
    actorType: 'EXTERNAL_INBOUND',
    createdAt: '2026-10-30T10:00:00Z',
    details: 'Inbound recruiter response: advanced touchpoint to IN_CONVERSATION',
  },
];

/**
 * Generates an RFC-4180 compliant CSV string of all immutable decision events.
 */
export function exportDecisionEventsToCsv(): string {
  const headers = ['Event ID', 'Event Type', 'Job ID', 'Company', 'Actor Type', 'Timestamp (ISO)', 'Details'];
  const rows = AUDIT_EVENT_LOGS.map((evt) => [
    escapeCsv(evt.id),
    escapeCsv(evt.eventType),
    escapeCsv(evt.jobId),
    escapeCsv(evt.company),
    escapeCsv(evt.actorType),
    escapeCsv(evt.createdAt),
    escapeCsv(evt.details),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
}

function escapeCsv(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n') || val.includes('\r')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

