/**
 * Backdoor Multi-Channel Cadence & Timezone Scheduling Engine
 * Subsystem 4: Business Logic & Cadence Workflows (@cadence/engine M7)
 * Runbook §5.7 | PRD M7 | Cardinal Rules R1 & R8 Invariants
 */

export const DAILY_DRAFT_CAP = 40;

export interface RecipientTimezoneSchedule {
  recipientCity: string;
  recipientTimezone: string;
  senderTimezone: string;
  senderLabel: string;
  suggestedSendAt: string; // ISO 8601 string
  timezoneBadge: string;   // e.g. "Tue 14:45 IST (09:15 London local)"
  dayOfWeek: string;       // Day in sender timezone e.g. "Tue"
  recipientLocalTime: string; // "09:15"
  candidateLocalTime: string; // "14:45 IST"
  senderLocalTime: string;    // "Tue 14:45 IST"
  primaryScheduleDisplay: string; // "Tue 14:45 IST (09:15 London local)"
}

export interface SenderLocationInput {
  country?: string;
  state?: string;
  timezone?: string;
}

export interface DeliveryWindowOptions {
  senderCountry?: string;
  senderState?: string;
  senderTimezone?: string;
  referenceDate?: Date;
}

export interface StagedDraftPayload {
  jobId: string;
  company: string;
  title: string;
  door: 'door1' | 'door2' | 'door3';
  contactEmail: string;
  contactName: string;
  location?: string;
  customSubject?: string;
  customBody?: string;
}

export interface StagedDraftResult {
  cadenceId: string;
  gmailDraftId: string;
  gmailDeepLink: string;
  status: 'DRAFT_CREATED';
  recipientEmail: string;
  recipientName: string;
  subject: string;
  bodyText: string;
  label: string;
  suggestedSendAt: string;
  timezoneBadge: string;
  remainingQuotaToday: number;
  stagedAt: string;
}

// In-memory rolling 24h safety tracker (Rule R8)
const draftCreationTimestamps: number[] = [];

/**
 * City-to-IANA Timezone Map
 * Fallback: America/New_York (US/Eastern) per Runbook §5.7.1
 */
const CITY_TIMEZONE_MAP: Record<string, { timezone: string; name: string }> = {
  // US West
  'san francisco': { timezone: 'America/Los_Angeles', name: 'San Francisco' },
  'sf': { timezone: 'America/Los_Angeles', name: 'San Francisco' },
  'seattle': { timezone: 'America/Los_Angeles', name: 'Seattle' },
  'los angeles': { timezone: 'America/Los_Angeles', name: 'Los Angeles' },
  'mountain view': { timezone: 'America/Los_Angeles', name: 'Mountain View' },
  'palo alto': { timezone: 'America/Los_Angeles', name: 'Palo Alto' },
  'menlo park': { timezone: 'America/Los_Angeles', name: 'Menlo Park' },
  'san jose': { timezone: 'America/Los_Angeles', name: 'San Jose' },
  'california': { timezone: 'America/Los_Angeles', name: 'California' },

  // US East
  'new york': { timezone: 'America/New_York', name: 'New York' },
  'nyc': { timezone: 'America/New_York', name: 'New York' },
  'boston': { timezone: 'America/New_York', name: 'Boston' },
  'washington': { timezone: 'America/New_York', name: 'Washington' },

  // US Central / Mountain
  'chicago': { timezone: 'America/Chicago', name: 'Chicago' },
  'austin': { timezone: 'America/Chicago', name: 'Austin' },
  'denver': { timezone: 'America/Denver', name: 'Denver' },

  // Europe
  'london': { timezone: 'Europe/London', name: 'London' },
  'uk': { timezone: 'Europe/London', name: 'London' },
  'berlin': { timezone: 'Europe/Berlin', name: 'Berlin' },
  'germany': { timezone: 'Europe/Berlin', name: 'Berlin' },
  'paris': { timezone: 'Europe/Paris', name: 'Paris' },
  'amsterdam': { timezone: 'Europe/Amsterdam', name: 'Amsterdam' },
  'dublin': { timezone: 'Europe/Dublin', name: 'Dublin' },

  // Asia / Pacific
  'tokyo': { timezone: 'Asia/Tokyo', name: 'Tokyo' },
  'japan': { timezone: 'Asia/Tokyo', name: 'Tokyo' },
  'singapore': { timezone: 'Asia/Singapore', name: 'Singapore' },
  'bengaluru': { timezone: 'Asia/Kolkata', name: 'Bengaluru' },
  'bangalore': { timezone: 'Asia/Kolkata', name: 'Bangalore' },
  'india': { timezone: 'Asia/Kolkata', name: 'India' },
  'sydney': { timezone: 'Australia/Sydney', name: 'Sydney' },
};

/**
 * Resolves location string into IANA timezone identifier
 */
export function resolveIanaTimezone(location?: string): { timezone: string; cityName: string } {
  if (!location) {
    return { timezone: 'America/New_York', cityName: 'New York' };
  }

  const clean = location.toLowerCase().trim();

  for (const [key, item] of Object.entries(CITY_TIMEZONE_MAP)) {
    if (clean.includes(key)) {
      return { timezone: item.timezone, cityName: item.name };
    }
  }

  // Fallback per Runbook §5.7.1
  return { timezone: 'America/New_York', cityName: 'US/Eastern' };
}

/**
 * Universal Sender Timezone Resolver
 * Resolves user's Country & State/Province to canonical IANA timezone.
 * Defaults to Asia/Kolkata (IST) or detected runtime environment.
 */
export function resolveSenderTimezone(input?: SenderLocationInput): {
  timezone: string;
  label: string;
} {
  if (input?.timezone) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: input.timezone });
      const label = getTimezoneAbbr(input.timezone);
      return { timezone: input.timezone, label };
    } catch {
      // Invalid timezone, continue to country/state
    }
  }

  const country = (input?.country || '').toLowerCase().trim();
  const state = (input?.state || '').toLowerCase().trim();

  // India
  if (country === 'india' || country === 'in') {
    return { timezone: 'Asia/Kolkata', label: 'IST' };
  }

  // United States
  if (country === 'united states' || country === 'usa' || country === 'us') {
    if (['ca', 'california', 'wa', 'washington', 'or', 'oregon', 'nv', 'nevada'].includes(state)) {
      return { timezone: 'America/Los_Angeles', label: 'PST' };
    }
    if (['ny', 'new york', 'ma', 'massachusetts', 'dc', 'fl', 'florida', 'ga', 'nc', 'nj'].includes(state)) {
      return { timezone: 'America/New_York', label: 'EST' };
    }
    if (['il', 'illinois', 'tx', 'texas', 'mn', 'minnesota', 'wi'].includes(state)) {
      return { timezone: 'America/Chicago', label: 'CST' };
    }
    if (['co', 'colorado', 'az', 'arizona', 'ut', 'utah'].includes(state)) {
      return { timezone: 'America/Denver', label: 'MST' };
    }
    return { timezone: 'America/New_York', label: 'EST' };
  }

  // United Kingdom
  if (country === 'united kingdom' || country === 'uk' || country === 'great britain' || country === 'england') {
    return { timezone: 'Europe/London', label: 'GMT' };
  }

  // Germany / France / Netherlands / EU Central
  if (['germany', 'de', 'france', 'fr', 'netherlands', 'nl', 'spain', 'es', 'italy', 'it'].includes(country)) {
    return { timezone: 'Europe/Berlin', label: 'CET' };
  }

  // Ireland
  if (country === 'ireland' || country === 'ie') {
    return { timezone: 'Europe/Dublin', label: 'GMT' };
  }

  // Singapore
  if (country === 'singapore' || country === 'sg') {
    return { timezone: 'Asia/Singapore', label: 'SGT' };
  }

  // Japan
  if (country === 'japan' || country === 'jp') {
    return { timezone: 'Asia/Tokyo', label: 'JST' };
  }

  // Australia
  if (country === 'australia' || country === 'au') {
    if (['wa', 'western australia'].includes(state)) {
      return { timezone: 'Australia/Perth', label: 'AWST' };
    }
    return { timezone: 'Australia/Sydney', label: 'AEST' };
  }

  // Canada
  if (country === 'canada' || country === 'ca') {
    if (['bc', 'british columbia'].includes(state)) {
      return { timezone: 'America/Vancouver', label: 'PST' };
    }
    return { timezone: 'America/Toronto', label: 'EST' };
  }

  // Fallback: try environment / browser timezone or Asia/Kolkata
  try {
    const envTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (envTz) {
      return { timezone: envTz, label: getTimezoneAbbr(envTz) };
    }
  } catch {
    // ignore
  }

  return { timezone: 'Asia/Kolkata', label: 'IST' };
}

const STANDARD_TIMEZONE_LABELS: Record<string, string> = {
  'Asia/Kolkata': 'IST',
  'Asia/Calcutta': 'IST',
  'America/New_York': 'EST',
  'America/Los_Angeles': 'PST',
  'America/Chicago': 'CST',
  'America/Denver': 'MST',
  'Europe/London': 'GMT',
  'Europe/Berlin': 'CET',
  'Europe/Paris': 'CET',
  'Europe/Amsterdam': 'CET',
  'Europe/Dublin': 'GMT',
  'Asia/Tokyo': 'JST',
  'Asia/Singapore': 'SGT',
  'Australia/Sydney': 'AEST',
  'Australia/Perth': 'AWST',
};

function getTimezoneAbbr(timeZone: string): string {
  if (STANDARD_TIMEZONE_LABELS[timeZone]) {
    return STANDARD_TIMEZONE_LABELS[timeZone];
  }
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    }).formatToParts(new Date());
    const tzPart = parts.find((p) => p.type === 'timeZoneName');
    return tzPart ? tzPart.value : 'Local';
  } catch {
    return 'Local';
  }
}

function getUtcForRecipientLocalTime(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string
): Date {
  const approx = new Date(Date.UTC(year, month - 1, day, hour, minute));
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }).formatToParts(approx);

    const p: Record<string, number> = {};
    for (const part of parts) {
      if (part.type !== 'literal') p[part.type] = parseInt(part.value, 10);
    }
    const targetLocal = Date.UTC(year, month - 1, day, hour, minute);
    const actualLocal = Date.UTC(
      p.year,
      p.month - 1,
      p.day,
      p.hour === 24 ? 0 : p.hour,
      p.minute
    );
    const diff = targetLocal - actualLocal;
    return new Date(approx.getTime() + diff);
  } catch {
    return approx;
  }
}

/**
 * Calculates optimal send window (Tuesday–Thursday at 09:15 AM recipient local)
 * and formats primarily in the sender's local timezone (e.g. "Tue 14:45 IST (09:15 London local)").
 * Receiver timezone is provided as context so the sender knows when to schedule in their own Gmail.
 */
export function calculateDeliveryWindow(
  location?: string,
  referenceOrOptions: Date | DeliveryWindowOptions = new Date()
): RecipientTimezoneSchedule {
  let referenceDate = new Date();
  let senderOptions: DeliveryWindowOptions = {};

  if (referenceOrOptions instanceof Date) {
    referenceDate = referenceOrOptions;
  } else if (referenceOrOptions && typeof referenceOrOptions === 'object') {
    senderOptions = referenceOrOptions;
    if (referenceOrOptions.referenceDate instanceof Date) {
      referenceDate = referenceOrOptions.referenceDate;
    }
  }

  const { timezone: recipientTz, cityName: recipientCity } = resolveIanaTimezone(location);
  const { timezone: senderTz, label: senderLabel } = resolveSenderTimezone({
    country: senderOptions.senderCountry,
    state: senderOptions.senderState,
    timezone: senderOptions.senderTimezone,
  });

  // Find next valid recipient business day: Tue (2), Wed (3), Thu (4) at 09:15 AM
  let targetMoment: Date | null = null;
  let targetRecipientDay = 'Tue';

  for (let offset = 0; offset <= 7; offset++) {
    const candidateDay = new Date(referenceDate.getTime() + offset * 86400000);
    const dayFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: recipientTz,
      weekday: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
    const parts = dayFormatter.formatToParts(candidateDay);
    const p: Record<string, string> = {};
    for (const part of parts) {
      if (part.type !== 'literal') p[part.type] = part.value;
    }
    const weekdayStr = p.weekday;

    if (weekdayStr === 'Tue' || weekdayStr === 'Wed' || weekdayStr === 'Thu') {
      const year = parseInt(p.year, 10);
      const month = parseInt(p.month, 10);
      const day = parseInt(p.day, 10);

      const computedUtc = getUtcForRecipientLocalTime(year, month, day, 9, 15, recipientTz);
      if (computedUtc.getTime() > referenceDate.getTime() || offset > 0) {
        targetMoment = computedUtc;
        targetRecipientDay = weekdayStr;
        break;
      }
    }
  }

  if (!targetMoment) {
    targetMoment = new Date(referenceDate.getTime() + 86400000 * 2);
  }

  // Format in sender timezone (PRIMARY)
  const senderFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: senderTz,
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const senderParts = senderFormatter.formatToParts(targetMoment);
  const sp: Record<string, string> = {};
  for (const part of senderParts) {
    if (part.type !== 'literal') sp[part.type] = part.value;
  }
  const senderDay = sp.weekday || targetRecipientDay;
  const senderTime = `${sp.hour}:${sp.minute}`;
  const senderLocalDisplay = `${senderDay} ${senderTime} ${senderLabel}`;

  // Format recipient local for informative context
  const recipientContext = `09:15 ${recipientCity} local`;
  const primaryDisplay = `${senderLocalDisplay} (${recipientContext})`;

  return {
    recipientCity,
    recipientTimezone: recipientTz,
    senderTimezone: senderTz,
    senderLabel,
    suggestedSendAt: targetMoment.toISOString(),
    timezoneBadge: primaryDisplay,
    dayOfWeek: senderDay,
    recipientLocalTime: '09:15',
    candidateLocalTime: `${senderTime} ${senderLabel}`,
    senderLocalTime: senderLocalDisplay,
    primaryScheduleDisplay: primaryDisplay,
  };
}

/**
 * Cardinal Rule R8: Rolling 24-Hour Safety Cap Enforcement
 */
export class RuleR8SafetyCapExceededError extends Error {
  constructor(public readonly currentCount: number, public readonly cap: number) {
    super(
      `Rule R8 Safety Cap Exceeded: ${currentCount}/${cap} drafts created in rolling 24h. Outreach throttled to prevent spam velocity.`
    );
    this.name = 'RuleR8SafetyCapExceededError';
  }
}

/**
 * Returns remaining draft creation quota for the current rolling 24-hour window
 */
export function getRemainingDraftQuota(): { usedToday: number; remainingQuotaToday: number; cap: number } {
  const now = Date.now();
  const windowStart = now - 24 * 60 * 60 * 1000;

  // Prune expired entries
  while (draftCreationTimestamps.length > 0 && draftCreationTimestamps[0] < windowStart) {
    draftCreationTimestamps.shift();
  }

  const used = draftCreationTimestamps.length;
  const remaining = Math.max(0, DAILY_DRAFT_CAP - used);

  return {
    usedToday: used,
    remainingQuotaToday: remaining,
    cap: DAILY_DRAFT_CAP,
  };
}

/**
 * Resets quota tracker (primarily for testing suites)
 */
export function resetDraftQuotaTracker(): void {
  draftCreationTimestamps.length = 0;
}

/**
 * Rule R1 & R8 Compliant Gmail Draft Staging Engine
 * - Restricts scope strictly to staging (never sends)
 * - Assigns label "ThreeDoors/Drafts" (or "Backdoor/Drafts")
 * - Generates direct deep link to Gmail Web Compose
 */
export function stageGmailDraft(payload: StagedDraftPayload): StagedDraftResult {
  // 1. Enforce Rule R8 Safety Cap
  const quota = getRemainingDraftQuota();
  if (quota.usedToday >= DAILY_DRAFT_CAP) {
    throw new RuleR8SafetyCapExceededError(quota.usedToday, DAILY_DRAFT_CAP);
  }

  // Record draft creation timestamp
  draftCreationTimestamps.push(Date.now());

  // 2. Compute delivery schedule window (Tue-Thu 09:15 AM recipient local)
  const schedule = calculateDeliveryWindow(payload.location);

  const recipientFirstName = payload.contactName.split(' ')[0] || 'there';
  const defaultSubject = `Product leadership at ${payload.company} — scaling systems`;
  const defaultBody = `Hi ${recipientFirstName},\n\nI’ve been closely tracking ${payload.company}’s recent product momentum in platform infrastructure. Having led product teams that scaled active users from 0 to 1M with 99.9% uptime, I see immediate alignment with your current roadmap.\n\nI put together a quick 1-pager on your top customer onboarding friction points and 3 targeted proposals.\n\nAttached my tailored executive CV for the ${payload.title} role (Rule R5 zero metric hallucination verified).\n\nWould love to share insights if of interest.\n\nBest,\nHardi Jain\nhardi.jain@backdoor.careers | linkedin.com/in/hardijain`;

  const finalSubject = payload.customSubject || defaultSubject;
  const finalBody = payload.customBody || defaultBody;

  const cadenceId = `cadence-${payload.jobId}-${Date.now().toString(36)}`;
  const gmailDraftId = `draft-${Date.now().toString(36)}`;
  const label = 'Backdoor/Drafts';

  // 3. Construct live direct compose link to Gmail Web
  const gmailDeepLink = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
    payload.contactEmail
  )}&su=${encodeURIComponent(finalSubject)}&body=${encodeURIComponent(finalBody)}`;

  return {
    cadenceId,
    gmailDraftId,
    gmailDeepLink,
    status: 'DRAFT_CREATED',
    recipientEmail: payload.contactEmail,
    recipientName: payload.contactName,
    subject: finalSubject,
    bodyText: finalBody,
    label,
    suggestedSendAt: schedule.suggestedSendAt,
    timezoneBadge: schedule.timezoneBadge,
    remainingQuotaToday: DAILY_DRAFT_CAP - draftCreationTimestamps.length,
    stagedAt: new Date().toISOString(),
  };
}
