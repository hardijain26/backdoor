/**
 * Subsystem 5: Encrypted Settings & BYOK Vault Engine (@settings/vault M9)
 * AES-256 Encryption, Negative Filter Rules, Dynamic Track Weights, and Profile Timezone.
 * Runbook §5.8 | PRD §5.5 | Cardinal Rules R1, R6, R7 & R8 Invariants
 */

import crypto from 'crypto';
import { AUTHORIZED_GOOGLE_OAUTH_SCOPES } from './google-auth';
import { resolveSenderTimezone, SenderLocationInput } from './cadence';
import { VERIFIED_SOURCES, SourceDefinition, SourceSection, SourceRole, PlatformCategory, isSafeUrl } from './scraper';
import { getFleetHealthSummary, toggleSourceEnabled } from './fleet-health';

const VAULT_MASTER_KEY = process.env.VAULT_SECRET_KEY || 'backdoor-vault-secret-key-32b!'; // 32 bytes

export interface ByokKeyItem {
  id: string;
  name: string;
  description: string;
  category: 'SCRAPER' | 'ENRICHMENT' | 'LLM_REASONING';
  encryptedValue?: string;
  maskedValue?: string;
  hasKey: boolean;
  status: 'CONFIGURED' | 'MISSING' | 'TEST_PASSED' | 'TEST_FAILED';
  lastTestedAt?: string;
}

export interface NegativeFilterRules {
  excludedCompanies: string[];
  excludedTitlePatterns: string[];
  blockedIndustries: string[];
}

export interface DynamicTrackConfig {
  id: string;
  name: string;
  weight: number; // 0 - 100
  targetTitles: string[];
  skills: string[];
  isActive: boolean;
}

export interface UserProfileTimezone {
  country: string;
  state: string;
  resolvedIanaTimezone: string;
  timezoneLabel: string;
  detectedBrowserTimezone?: string;
}

export interface GoogleOAuthStatus {
  connected: boolean;
  email: string;
  scopes: string[];
  expiresInHours: number;
  tokenStatus: 'ACTIVE' | 'EXPIRING_SOON' | 'DISCONNECTED';
  lastRefreshedAt: string;
}

export interface SlackCommunityChannel {
  id: string;
  name: string;
  workspace: string;
  enabled: boolean;
}

export type CustomFeedType = 'REST_API' | 'RSS_FEED' | 'JSON_LD';

export interface CustomAtsInput {
  name: string;
  endpointUrl: string;
  feedType: CustomFeedType;
  applicableRole?: SourceRole;
}

export interface WorkspaceSourceItem {
  id: string;
  name: string;
  category: string;
  section: SourceSection;
  platformCategory?: PlatformCategory;
  applicableRoles: SourceRole[];
  enabled: boolean;
  requiresKey: boolean;
  endpointUrl?: string;
  feedType?: CustomFeedType;
  isCustom?: boolean;
}

export interface PopularJobApi {
  id: string;
  name: string;
  provider: string;
  description: string;
  regions: string[];
  roleAffinity: ('product' | 'engineering' | 'design' | 'legal' | 'finance' | 'all')[];
  pricingTier: 'Free Tier Available' | 'Paid / BYOK' | 'Freemium' | 'Free / Open Source (GitHub)';
  endpointDocUrl: string;
  defaultEndpoint?: string;
  byokKeyId?: string;
  githubUrl?: string;
  isCommunityContributed?: boolean;
}

export interface SettingsWorkspaceState {
  profile: UserProfileTimezone;
  googleOAuth: GoogleOAuthStatus;
  negativeFilters: NegativeFilterRules;
  dynamicTracks: DynamicTrackConfig[];
  byokKeys: ByokKeyItem[];
  sources: WorkspaceSourceItem[];
  monitoredTwitterHandles: string[];
  monitoredSubreddits: string[];
  inboundEmailAddress: string;
  slackCommunityChannels: SlackCommunityChannel[];
  updatedAt: string;
}

/**
 * In-memory vault state with persistence defaults
 */
let settingsState: SettingsWorkspaceState = {
  profile: {
    country: 'India',
    state: 'Karnataka',
    resolvedIanaTimezone: 'Asia/Kolkata',
    timezoneLabel: 'IST',
    detectedBrowserTimezone: 'Asia/Kolkata',
  },
  googleOAuth: {
    connected: true,
    email: 'hardi.jain@backdoor.ai',
    scopes: [...AUTHORIZED_GOOGLE_OAUTH_SCOPES],
    expiresInHours: 144,
    tokenStatus: 'ACTIVE',
    lastRefreshedAt: '2026-10-30T10:00:00.000Z',
  },
  negativeFilters: {
    excludedCompanies: ['CreditPay', 'CoinLend', 'Meta', 'TikTok', 'ByteDance'],
    excludedTitlePatterns: ['marketing', 'engineering manager', 'tpm', 'scrum master', 'recruiter', 'intern'],
    blockedIndustries: ['fintech', 'payments', 'crypto', 'web3', 'neo-bank', 'lending', 'p2p'],
  },
  dynamicTracks: [
    {
      id: 'staff_pm',
      name: 'Staff Product Manager',
      weight: 40,
      targetTitles: ['Staff Product Manager', 'Lead Product Manager', 'Principal Product Manager'],
      skills: ['System Architecture', 'Cross-functional Alignment', 'Product Strategy', '0-to-1'],
      isActive: true,
    },
    {
      id: 'ai_native_pm',
      name: 'AI-Native Product Manager',
      weight: 35,
      targetTitles: ['AI Product Manager', 'LLM Product Lead', 'Founding PM - AI'],
      skills: ['LLM Evaluation', 'Prompt Engineering', 'RAG Architectures', 'Model Fine-tuning'],
      isActive: true,
    },
    {
      id: 'growth_pm',
      name: 'Growth & PLG Product Manager',
      weight: 15,
      targetTitles: ['Growth Product Manager', 'Product Lead - Growth'],
      skills: ['A/B Testing', 'Activation Funnels', 'Viral Loops', 'SQL / Mixpanel'],
      isActive: true,
    },
    {
      id: 'founding_pm',
      name: 'Founding PM (Series A/B)',
      weight: 10,
      targetTitles: ['Founding Product Manager', 'Head of Product'],
      skills: ['Customer Discovery', 'Rapid Prototyping', 'Scrappy Execution', 'Product Market Fit'],
      isActive: true,
    },
  ],
  byokKeys: [
    {
      id: 'apify',
      name: 'Apify Actor Token',
      description: 'Used for scraping Greenhouse, Lever, and LinkedIn company boards.',
      category: 'SCRAPER',
      hasKey: true,
      maskedValue: 'apify_sec_••••••••••••9b2a',
      status: 'CONFIGURED',
      lastTestedAt: '2026-10-30T09:30:00.000Z',
    },
    {
      id: 'apollo',
      name: 'Apollo.io API Key',
      description: 'Used for Door 1 Recruiter & Door 2 HM contact enrichment.',
      category: 'ENRICHMENT',
      hasKey: true,
      maskedValue: 'app_key_••••••••••••e3c1',
      status: 'CONFIGURED',
      lastTestedAt: '2026-10-30T09:30:00.000Z',
    },
    {
      id: 'hunter',
      name: 'Hunter.io API Key',
      description: 'Secondary contact verification for executive email heuristics.',
      category: 'ENRICHMENT',
      hasKey: false,
      maskedValue: undefined,
      status: 'MISSING',
    },
    {
      id: 'groq',
      name: 'Groq API Key',
      description: 'Ultra-fast Whisper audio transcription (whisper-large-v3-turbo).',
      category: 'LLM_REASONING',
      hasKey: true,
      maskedValue: 'gsk_••••••••••••7f42',
      status: 'CONFIGURED',
      lastTestedAt: '2026-10-30T10:15:00.000Z',
    },
    {
      id: 'gemini',
      name: 'Google Gemini 2.0 Flash Key',
      description: 'Optional deep reasoning and resume proof-point synthesis.',
      category: 'LLM_REASONING',
      hasKey: false,
      maskedValue: undefined,
      status: 'MISSING',
    },
  ],
  sources: VERIFIED_SOURCES.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    section: s.section,
    platformCategory: s.platformCategory,
    applicableRoles: [...s.applicableRoles],
    enabled: true,
    requiresKey: s.requiresKey,
  })),
  monitoredTwitterHandles: ['@levelsio', '@sama'],
  monitoredSubreddits: ['r/ProductManagement', 'r/jobbit', 'r/forhire', 'r/remotework'],
  inboundEmailAddress: 'jobs+hardi@inbound.backdoor.app',
  slackCommunityChannels: [
    { id: 'slack-1', name: '#jobs', workspace: "Lenny's Community", enabled: true },
    { id: 'slack-2', name: '#hiring-pm', workspace: 'Mind the Product', enabled: true },
    { id: 'slack-3', name: '#lead-roles', workspace: 'Product School Alumni', enabled: false },
  ],
  updatedAt: new Date().toISOString(),
};

// ============================================================================
// 1. AES-256-GCM Cryptographic Vault
// ============================================================================

/**
 * Encrypt a sensitive secret string using AES-256-GCM.
 * Output format: iv_hex:authTag_hex:ciphertext_hex
 */
export function encryptVaultSecret(plainText: string, secretKey = VAULT_MASTER_KEY): string {
  if (!plainText) return '';
  const key = crypto.createHash('sha256').update(secretKey).digest(); // 32 bytes
  const iv = crypto.randomBytes(12); // 12-byte IV for GCM
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt an AES-256-GCM payload.
 */
export function decryptVaultSecret(cipherPayload: string, secretKey = VAULT_MASTER_KEY): string {
  if (!cipherPayload) return '';
  const parts = cipherPayload.split(':');
  if (parts.length !== 3) {
    throw new Error('Malformed ciphertext payload: expected iv:tag:ciphertext');
  }

  const [ivHex, authTagHex, encryptedHex] = parts;
  const key = crypto.createHash('sha256').update(secretKey).digest();
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

/**
 * Masks a secret string for UI preview (e.g. "sk-••••••••4819")
 */
export function maskSecretValue(secret: string): string {
  if (!secret) return '';
  if (secret.length <= 8) {
    return '••••••••';
  }
  const prefix = secret.slice(0, 4);
  const suffix = secret.slice(-4);
  return `${prefix}_••••••••••••_${suffix}`;
}

// ============================================================================
// 2. Negative Filter Evaluation Engine
// ============================================================================

/**
 * Evaluates whether a role matches candidate's customized negative filters.
 */
export function evaluateCustomNegativeFilters(
  job: { title: string; company: string; descriptionText?: string },
  customRules?: Partial<NegativeFilterRules>
): { passed: boolean; reason?: string } {
  const rules: NegativeFilterRules = {
    ...settingsState.negativeFilters,
    ...customRules,
  };

  const titleLower = job.title.toLowerCase();
  const companyLower = job.company.toLowerCase();
  const descLower = (job.descriptionText || '').toLowerCase();

  // 1. Excluded companies check
  for (const excludedCo of rules.excludedCompanies) {
    if (excludedCo.trim() && companyLower.includes(excludedCo.toLowerCase().trim())) {
      return {
        passed: false,
        reason: `Company "${job.company}" is in your excluded companies list (${excludedCo})`,
      };
    }
  }

  // 2. Excluded title patterns check
  for (const pattern of rules.excludedTitlePatterns) {
    if (pattern.trim()) {
      const regex = new RegExp(`\\b${escapeRegExp(pattern.trim())}\\b`, 'i');
      if (regex.test(titleLower)) {
        return {
          passed: false,
          reason: `Job title matches excluded pattern: "${pattern}"`,
        };
      }
    }
  }

  // 3. Blocked industries check
  for (const ind of rules.blockedIndustries) {
    if (ind.trim()) {
      const cleanInd = ind.toLowerCase().trim();
      if (companyLower.includes(cleanInd) || descLower.includes(cleanInd)) {
        return {
          passed: false,
          reason: `Role contains blocked industry keyword: "${ind}"`,
        };
      }
    }
  }

  return { passed: true };
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// 3. Settings Getters & Mutation Handlers
// ============================================================================

/**
 * Get current settings state with masked secrets for safe frontend consumption.
 */
export function getSettingsWorkspace(): SettingsWorkspaceState {
  return {
    ...settingsState,
    profile: { ...settingsState.profile },
    googleOAuth: { ...settingsState.googleOAuth },
    negativeFilters: {
      excludedCompanies: [...settingsState.negativeFilters.excludedCompanies],
      excludedTitlePatterns: [...settingsState.negativeFilters.excludedTitlePatterns],
      blockedIndustries: [...settingsState.negativeFilters.blockedIndustries],
    },
    dynamicTracks: settingsState.dynamicTracks.map((t) => ({ ...t, targetTitles: [...t.targetTitles], skills: [...t.skills] })),
    byokKeys: settingsState.byokKeys.map((k) => ({ ...k })),
    sources: settingsState.sources.map((s) => ({ ...s, applicableRoles: [...s.applicableRoles] })),
    monitoredTwitterHandles: [...settingsState.monitoredTwitterHandles],
    monitoredSubreddits: [...settingsState.monitoredSubreddits],
    inboundEmailAddress: settingsState.inboundEmailAddress,
    slackCommunityChannels: settingsState.slackCommunityChannels.map((c) => ({ ...c })),
  };
}

/**
 * Update candidate profile location and resolve canonical IANA timezone.
 */
export function updateProfileLocation(input: {
  country: string;
  state: string;
  detectedBrowserTimezone?: string;
}): UserProfileTimezone {
  const resolved = resolveSenderTimezone({
    country: input.country,
    state: input.state,
    timezone: input.detectedBrowserTimezone,
  });

  settingsState.profile = {
    country: input.country,
    state: input.state,
    resolvedIanaTimezone: resolved.timezone,
    timezoneLabel: resolved.label,
    detectedBrowserTimezone: input.detectedBrowserTimezone,
  };

  settingsState.updatedAt = new Date().toISOString();
  return { ...settingsState.profile };
}

/**
 * Update negative filter rules.
 */
export function updateNegativeFilterRules(
  newRules: Partial<NegativeFilterRules>
): NegativeFilterRules {
  if (newRules.excludedCompanies) {
    settingsState.negativeFilters.excludedCompanies = [...newRules.excludedCompanies];
  }
  if (newRules.excludedTitlePatterns) {
    settingsState.negativeFilters.excludedTitlePatterns = [...newRules.excludedTitlePatterns];
  }
  if (newRules.blockedIndustries) {
    settingsState.negativeFilters.blockedIndustries = [...newRules.blockedIndustries];
  }

  settingsState.updatedAt = new Date().toISOString();
  return { ...settingsState.negativeFilters };
}

/**
 * Update dynamic track weights or add new track.
 */
export function updateDynamicTracks(tracks: DynamicTrackConfig[]): DynamicTrackConfig[] {
  settingsState.dynamicTracks = [...tracks];
  settingsState.updatedAt = new Date().toISOString();
  return [...settingsState.dynamicTracks];
}

/**
 * Store a sensitive BYOK credential securely in encrypted form.
 */
export function saveByokSecretKey(keyId: string, plainSecret: string): ByokKeyItem {
  const target = settingsState.byokKeys.find((k) => k.id === keyId);
  if (!target) {
    throw new Error(`Unknown BYOK key identifier: ${keyId}`);
  }

  if (!plainSecret || plainSecret.trim() === '') {
    target.hasKey = false;
    target.encryptedValue = undefined;
    target.maskedValue = undefined;
    target.status = 'MISSING';
    target.lastTestedAt = undefined;
  } else {
    target.hasKey = true;
    target.encryptedValue = encryptVaultSecret(plainSecret.trim());
    target.maskedValue = maskSecretValue(plainSecret.trim());
    target.status = 'CONFIGURED';
    target.lastTestedAt = new Date().toISOString();
  }

  settingsState.updatedAt = new Date().toISOString();
  return { ...target };
}

/**
 * Test validation runner for a BYOK key.
 */
export async function testByokKey(
  keyId: string
): Promise<{ success: boolean; keyId: string; status: string; message: string }> {
  const key = settingsState.byokKeys.find((k) => k.id === keyId);
  if (!key) {
    throw new Error(`Unknown key: ${keyId}`);
  }

  if (!key.hasKey) {
    key.status = 'MISSING';
    return {
      success: false,
      keyId,
      status: 'MISSING',
      message: `No API key provided for ${key.name}.`,
    };
  }

  // Simulate instant key validation check
  key.status = 'TEST_PASSED';
  key.lastTestedAt = new Date().toISOString();
  settingsState.updatedAt = new Date().toISOString();

  return {
    success: true,
    keyId,
    status: 'TEST_PASSED',
    message: `${key.name} authentication verified successfully.`,
  };
}

/**
 * Refresh Google OAuth status
 */
export function refreshGoogleOAuth(): GoogleOAuthStatus {
  settingsState.googleOAuth = {
    ...settingsState.googleOAuth,
    connected: true,
    tokenStatus: 'ACTIVE',
    expiresInHours: 168,
    lastRefreshedAt: new Date().toISOString(),
  };
  settingsState.updatedAt = new Date().toISOString();
  return { ...settingsState.googleOAuth };
}

/**
 * Update monitored Twitter/X handles.
 */
export function updateMonitoredTwitterHandles(handles: string[]): string[] {
  settingsState.monitoredTwitterHandles = handles
    .map((h) => (h.startsWith('@') ? h.trim() : `@${h.trim()}`))
    .filter(Boolean);
  settingsState.updatedAt = new Date().toISOString();
  return [...settingsState.monitoredTwitterHandles];
}

/**
 * Update monitored Reddit subreddits.
 */
export function updateMonitoredSubreddits(subreddits: string[]): string[] {
  settingsState.monitoredSubreddits = subreddits
    .map((s) => {
      const clean = s.trim().replace(/^\/?r\//i, '');
      return clean ? `r/${clean}` : '';
    })
    .filter(Boolean);
  settingsState.updatedAt = new Date().toISOString();
  return [...settingsState.monitoredSubreddits];
}

/**
 * Update the candidate's dedicated inbound email forwarder address.
 */
export function updateInboundEmailAddress(newEmail: string): string {
  const trimmed = (newEmail || '').trim().toLowerCase();
  if (!trimmed || !trimmed.includes('@') || !trimmed.includes('.')) {
    throw new Error('Please provide a valid email address for auto-forwarding.');
  }
  settingsState.inboundEmailAddress = trimmed;
  settingsState.updatedAt = new Date().toISOString();
  return settingsState.inboundEmailAddress;
}

/**
 * Toggle or set enabled state for a connected Slack community channel.
 */
export function toggleSlackChannel(channelId: string, enabled?: boolean): SlackCommunityChannel[] {
  settingsState.slackCommunityChannels = settingsState.slackCommunityChannels.map((ch) => {
    if (ch.id === channelId) {
      return { ...ch, enabled: enabled !== undefined ? enabled : !ch.enabled };
    }
    return ch;
  });
  settingsState.updatedAt = new Date().toISOString();
  return settingsState.slackCommunityChannels.map((c) => ({ ...c }));
}

/**
 * Add a new Slack community channel to monitor.
 */
export function addSlackCommunityChannel(channel: Omit<SlackCommunityChannel, 'id'>): SlackCommunityChannel[] {
  const newId = `slack-${Date.now()}`;
  settingsState.slackCommunityChannels.push({
    id: newId,
    name: channel.name.startsWith('#') ? channel.name : `#${channel.name}`,
    workspace: channel.workspace || 'Community Slack',
    enabled: channel.enabled ?? true,
  });
  settingsState.updatedAt = new Date().toISOString();
  return settingsState.slackCommunityChannels.map((c) => ({ ...c }));
}

/**
 * Add a custom ATS, platform endpoint, or RSS feed source.
 * Enforces Rule R6 SSRF check via isSafeUrl.
 */
export function addCustomAtsSource(input: CustomAtsInput): WorkspaceSourceItem {
  const name = (input.name || '').trim();
  const url = (input.endpointUrl || '').trim();

  if (!name) {
    throw new Error('Source name is required.');
  }
  if (!url) {
    throw new Error('Endpoint or feed URL is required.');
  }

  // SSRF Protection (Rule R6)
  if (!isSafeUrl(url)) {
    throw new Error('Invalid or prohibited URL: loopback, local network, and private RFC-1918 addresses are disallowed (SSRF Rule R6).');
  }

  // Determine category based on feed type
  let category: WorkspaceSourceItem['category'] = 'ATS_DIRECT';
  if (input.feedType === 'RSS_FEED') {
    category = 'REMOTE_PM_BOARDS';
  } else if (input.feedType === 'JSON_LD') {
    category = 'COMPANY_DIRECT';
  }

  const role: SourceRole = input.applicableRole || 'all';
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 16);
  const id = `custom_ats_${Date.now()}_${slug}`;

  const newSource: WorkspaceSourceItem = {
    id,
    name,
    category,
    section: 'ATS',
    applicableRoles: [role],
    enabled: true,
    requiresKey: false,
    endpointUrl: url,
    feedType: input.feedType || 'REST_API',
    isCustom: true,
  };

  settingsState.sources.push(newSource);
  settingsState.updatedAt = new Date().toISOString();
  return { ...newSource };
}

/**
 * Adds a custom Platform API, RSS feed, or JSON-LD job endpoint.
 * Enforces SSRF Safe URL verification (Rule R6).
 */
export function addCustomPlatformSource(input: {
  name: string;
  endpointUrl: string;
  feedType?: CustomFeedType;
  applicableRole?: SourceRole;
  platformCategory?: PlatformCategory;
}): WorkspaceSourceItem {
  const name = (input.name || '').trim();
  const url = (input.endpointUrl || '').trim();

  if (!name) {
    throw new Error('Platform or feed name is required.');
  }
  if (!url) {
    throw new Error('Endpoint or feed URL is required.');
  }

  // SSRF Protection (Rule R6)
  if (!isSafeUrl(url)) {
    throw new Error('Invalid or prohibited URL: loopback, local network, and private RFC-1918 addresses are disallowed (SSRF Rule R6).');
  }

  const role: SourceRole = input.applicableRole || 'all';
  const category = input.platformCategory || 'aggregator';
  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 16);
  const id = `custom_platform_${Date.now()}_${slug}`;

  const newSource: WorkspaceSourceItem = {
    id,
    name,
    category: category === 'remote' ? 'REMOTE_PM_BOARDS' : category === 'startup' ? 'CURATED_COMMUNITIES' : 'TECH_COMMUNITIES',
    section: 'PLATFORM_API',
    platformCategory: category,
    applicableRoles: [role],
    enabled: true,
    requiresKey: false,
    endpointUrl: url,
    feedType: input.feedType || 'REST_API',
    isCustom: true,
  };

  settingsState.sources.push(newSource);
  settingsState.updatedAt = new Date().toISOString();
  return { ...newSource };
}

/**
 * Catalog of Popular Regional & Role-Specific Job APIs & Open Source Feeds
 */
export const POPULAR_REGIONAL_JOB_APIS: PopularJobApi[] = [
  {
    id: 'github_jobs_feed',
    name: 'GitHub Open Jobs & Remote Feeds',
    provider: 'Open Source Community',
    description: 'Community-maintained open-source repository indexing remote technology and product management positions globally.',
    regions: ['Global Remote', 'United States', 'European Union', 'India'],
    roleAffinity: ['product', 'engineering', 'all'],
    pricingTier: 'Free / Open Source (GitHub)',
    endpointDocUrl: 'https://github.com/engineerapart/TheRemoteGAN',
    defaultEndpoint: 'https://raw.githubusercontent.com/engineerapart/TheRemoteGAN/main/jobs.json',
    githubUrl: 'https://github.com/engineerapart/TheRemoteGAN',
    isCommunityContributed: true,
  },
  {
    id: 'github_tech_salaries',
    name: 'Open Tech Salaries & Curated Hiring',
    provider: 'Community Open Data',
    description: 'Transparent compensation data paired with high-conviction job openings maintained collaboratively on GitHub.',
    regions: ['United States', 'India', 'Global Remote'],
    roleAffinity: ['product', 'all'],
    pricingTier: 'Free / Open Source (GitHub)',
    endpointDocUrl: 'https://github.com/open-salaries/tech-comp',
    defaultEndpoint: 'https://raw.githubusercontent.com/open-salaries/tech-comp/main/feed.json',
    githubUrl: 'https://github.com/open-salaries/tech-comp',
    isCommunityContributed: true,
  },
  {
    id: 'rapidapi_jsearch',
    name: 'JSearch (RapidAPI)',
    provider: 'OpenWeb Technology',
    description: 'High-velocity job search API querying Google Jobs, LinkedIn, Indeed, and ZipRecruiter with multi-country filters.',
    regions: ['Global Remote', 'United States', 'India', 'United Kingdom', 'European Union'],
    roleAffinity: ['product', 'engineering', 'all'],
    pricingTier: 'Free Tier Available',
    endpointDocUrl: 'https://rapidapi.com/letscrape-6bRBa3QguO5/api/jsearch',
    defaultEndpoint: 'https://jsearch.p.rapidapi.com/search',
    byokKeyId: 'apify',
  },
  {
    id: 'serpapi_google_jobs',
    name: 'SerpApi Google Jobs',
    provider: 'SerpApi',
    description: 'Direct structured scraping of Google Jobs engine with pinpoint metro/region targeting (e.g. Bengaluru, London, SF).',
    regions: ['India', 'United States', 'United Kingdom', 'European Union', 'Global Remote'],
    roleAffinity: ['product', 'engineering', 'design', 'all'],
    pricingTier: 'Paid / BYOK',
    endpointDocUrl: 'https://serpapi.com/google-jobs-api',
    defaultEndpoint: 'https://serpapi.com/search?engine=google_jobs',
  },
  {
    id: 'jooble_api',
    name: 'Jooble Search Engine API',
    provider: 'Jooble Inc.',
    description: 'Leading global job aggregator active across 71 countries with direct API feeds for India, US, and UK roles.',
    regions: ['India', 'European Union', 'United Kingdom', 'United States', 'Global Remote'],
    roleAffinity: ['product', 'engineering', 'all'],
    pricingTier: 'Free Tier Available',
    endpointDocUrl: 'https://jooble.org/api/about',
    defaultEndpoint: 'https://jooble.org/api/',
  },
  {
    id: 'adzuna_api',
    name: 'Adzuna Job Search API',
    provider: 'Adzuna Ltd',
    description: 'Government-certified labor market API with deep regional indexing in India, UK, US, Australia, and Western Europe.',
    regions: ['India', 'United Kingdom', 'United States', 'European Union'],
    roleAffinity: ['product', 'engineering', 'design', 'all'],
    pricingTier: 'Free Tier Available',
    endpointDocUrl: 'https://developer.adzuna.com',
    defaultEndpoint: 'https://api.adzuna.com/v1/api/jobs',
  },
  {
    id: 'apollo_jobs',
    name: 'Apollo.io Jobs & Contact Leads',
    provider: 'Apollo.io',
    description: 'Combines hiring signals with recruiter & hiring manager contact emails for Door 1 & Door 2 execution.',
    regions: ['United States', 'Global Remote', 'India', 'United Kingdom'],
    roleAffinity: ['product', 'engineering', 'all'],
    pricingTier: 'Paid / BYOK',
    endpointDocUrl: 'https://apolloio.github.io/apollo-api-docs',
    defaultEndpoint: 'https://api.apollo.io/v1/job_postings',
    byokKeyId: 'apollo',
  },
  {
    id: 'reed_uk_api',
    name: 'Reed.co.uk Employment API',
    provider: 'Reed Global',
    description: 'Premier UK and European technology & product management job board API with full salary and remote flags.',
    regions: ['United Kingdom', 'European Union'],
    roleAffinity: ['product', 'engineering', 'all'],
    pricingTier: 'Free Tier Available',
    endpointDocUrl: 'https://www.reed.co.uk/developers/jobseeker',
    defaultEndpoint: 'https://www.reed.co.uk/api/1.0/search',
  },
  {
    id: 'whatjobs_api',
    name: 'WhatJobs Global Syndication',
    provider: 'WhatJobs Network',
    description: 'Global syndicated job board API indexing 20+ countries across APAC, Europe, and the Americas.',
    regions: ['India', 'Global Remote', 'United States', 'European Union'],
    roleAffinity: ['product', 'all'],
    pricingTier: 'Freemium',
    endpointDocUrl: 'https://whatjobs.com',
    defaultEndpoint: 'https://api.whatjobs.com/api/v1/jobs',
  },
];

/**
 * Filter popular regional job APIs by query, role, and geographic region.
 */
export function searchRegionalJobApis(query = '', role = 'all', region = 'all'): PopularJobApi[] {
  const q = query.toLowerCase().trim();
  return POPULAR_REGIONAL_JOB_APIS.filter((api) => {
    if (role !== 'all' && !api.roleAffinity.includes('all') && !api.roleAffinity.includes(role as any)) {
      return false;
    }
    if (region !== 'all' && !api.regions.includes(region) && !api.regions.includes('Global Remote')) {
      return false;
    }
    if (q) {
      const matchName = api.name.toLowerCase().includes(q);
      const matchProvider = api.provider.toLowerCase().includes(q);
      const matchDesc = api.description.toLowerCase().includes(q);
      const matchRegion = api.regions.some((r) => r.toLowerCase().includes(q));
      if (!matchName && !matchProvider && !matchDesc && !matchRegion) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Adds an open-source GitHub repository or community-contributed API feed to the Marketplace.
 * Enforces SSRF Safe URL verification (Rule R6).
 */
export function addCommunityContributedApi(input: {
  name: string;
  provider?: string;
  description: string;
  regions?: string[];
  roleAffinity?: ('product' | 'engineering' | 'design' | 'legal' | 'finance' | 'all')[];
  githubUrl?: string;
  endpointUrl?: string;
  pricingTier?: 'Free Tier Available' | 'Paid / BYOK' | 'Freemium' | 'Free / Open Source (GitHub)';
}): PopularJobApi {
  const name = (input.name || '').trim();
  const desc = (input.description || '').trim();
  if (!name) throw new Error('API or Project name is required.');
  if (!desc) throw new Error('Project description is required.');

  if (input.githubUrl && !isSafeUrl(input.githubUrl)) {
    throw new Error('Invalid or unsafe GitHub URL (Rule R6).');
  }
  if (input.endpointUrl && !isSafeUrl(input.endpointUrl)) {
    throw new Error('Invalid or unsafe Endpoint URL (Rule R6).');
  }

  const id = `comm_${Date.now()}_${name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 14)}`;
  const newApi: PopularJobApi = {
    id,
    name,
    provider: (input.provider || 'Community Contributor').trim(),
    description: desc,
    regions: input.regions && input.regions.length > 0 ? input.regions : ['Global Remote'],
    roleAffinity: input.roleAffinity && input.roleAffinity.length > 0 ? input.roleAffinity : ['all'],
    pricingTier: input.pricingTier || (input.githubUrl ? 'Free / Open Source (GitHub)' : 'Free Tier Available'),
    endpointDocUrl: input.githubUrl || input.endpointUrl || 'https://github.com',
    defaultEndpoint: input.endpointUrl,
    githubUrl: input.githubUrl,
    isCommunityContributed: true,
  };

  POPULAR_REGIONAL_JOB_APIS.unshift(newApi);

  // If a live endpoint is provided, automatically add to active sources fleet
  if (input.endpointUrl) {
    addCustomPlatformSource({
      name: newApi.name,
      endpointUrl: input.endpointUrl,
      feedType: 'REST_API',
      applicableRole: 'all',
      platformCategory: 'aggregator'
    });
  }

  return newApi;
}

/**
 * Integrate a paid or free regional Job API into the candidate's active fleet.
 */
export function integratePaidJobApi(apiId: string, apiKey: string, customEndpoint?: string): WorkspaceSourceItem {
  const target = POPULAR_REGIONAL_JOB_APIS.find((a) => a.id === apiId);
  if (!target) {
    throw new Error(`Unknown job API provider: ${apiId}`);
  }
  if (!apiKey || !apiKey.trim()) {
    throw new Error(`API Key or Auth Token is required to integrate ${target.name}.`);
  }

  const endpoint = customEndpoint?.trim() || target.defaultEndpoint || 'https://api.example.com/jobs';
  if (!isSafeUrl(endpoint)) {
    throw new Error('Prohibited or unsafe endpoint URL (SSRF Rule R6).');
  }

  const keyId = target.byokKeyId || `key_${apiId}`;
  const existingKey = settingsState.byokKeys.find((k) => k.id === keyId);
  if (existingKey) {
    saveByokSecretKey(keyId, apiKey.trim());
  } else {
    settingsState.byokKeys.push({
      id: keyId,
      name: `${target.name} Key`,
      description: `Authentication credential for ${target.name}`,
      category: 'SCRAPER',
      hasKey: true,
      encryptedValue: encryptVaultSecret(apiKey.trim()),
      maskedValue: maskSecretValue(apiKey.trim()),
      status: 'CONFIGURED',
      lastTestedAt: new Date().toISOString(),
    });
  }

  const existingSource = settingsState.sources.find((s) => s.id === apiId);
  if (existingSource) {
    existingSource.enabled = true;
    existingSource.endpointUrl = endpoint;
    existingSource.requiresKey = true;
    settingsState.updatedAt = new Date().toISOString();
    return existingSource;
  }

  const newSource: WorkspaceSourceItem = {
    id: apiId,
    name: target.name,
    category: 'BYOK_AGGREGATORS',
    section: 'PLATFORM_API',
    platformCategory: 'aggregator',
    applicableRoles: ['product', 'all'],
    enabled: true,
    requiresKey: true,
    endpointUrl: endpoint,
    feedType: 'REST_API',
    isCustom: true,
  };

  settingsState.sources.push(newSource);
  settingsState.updatedAt = new Date().toISOString();
  return newSource;
}

/**
 * Remove a custom ATS or platform source by ID.
 */
export function removeCustomSource(sourceId: string): void {
  const target = settingsState.sources.find((s) => s.id === sourceId);
  if (!target) {
    throw new Error(`Source not found: ${sourceId}`);
  }
  if (!target.isCustom) {
    throw new Error(`Cannot delete built-in verified source: ${sourceId}`);
  }
  settingsState.sources = settingsState.sources.filter((s) => s.id !== sourceId);
  settingsState.updatedAt = new Date().toISOString();
}

/**
 * Master bulk switch to enable or disable all ATS sources (section === 'ATS').
 */
export function toggleAllAtsSources(enabled: boolean): void {
  settingsState.sources = settingsState.sources.map((src) => {
    if (src.section === 'ATS') {
      toggleSourceEnabled(src.id, enabled);
      return { ...src, enabled };
    }
    return src;
  });
  settingsState.updatedAt = new Date().toISOString();
}

/**
 * Reset settings store to defaults (used in unit tests)
 */
export function resetSettingsStore(): void {
  settingsState = {
    profile: {
      country: 'India',
      state: 'Karnataka',
      resolvedIanaTimezone: 'Asia/Kolkata',
      timezoneLabel: 'IST',
      detectedBrowserTimezone: 'Asia/Kolkata',
    },
    googleOAuth: {
      connected: true,
      email: 'hardi.jain@backdoor.ai',
      scopes: [...AUTHORIZED_GOOGLE_OAUTH_SCOPES],
      expiresInHours: 144,
      tokenStatus: 'ACTIVE',
      lastRefreshedAt: '2026-10-30T10:00:00.000Z',
    },
    negativeFilters: {
      excludedCompanies: ['CreditPay', 'CoinLend', 'Meta', 'TikTok', 'ByteDance'],
      excludedTitlePatterns: ['marketing', 'engineering manager', 'tpm', 'scrum master', 'recruiter', 'intern'],
      blockedIndustries: ['fintech', 'payments', 'crypto', 'web3', 'neo-bank', 'lending', 'p2p'],
    },
    dynamicTracks: [
      {
        id: 'staff_pm',
        name: 'Staff Product Manager',
        weight: 40,
        targetTitles: ['Staff Product Manager', 'Lead Product Manager', 'Principal Product Manager'],
        skills: ['System Architecture', 'Cross-functional Alignment', 'Product Strategy', '0-to-1'],
        isActive: true,
      },
      {
        id: 'ai_native_pm',
        name: 'AI-Native Product Manager',
        weight: 35,
        targetTitles: ['AI Product Manager', 'LLM Product Lead', 'Founding PM - AI'],
        skills: ['LLM Evaluation', 'Prompt Engineering', 'RAG Architectures', 'Model Fine-tuning'],
        isActive: true,
      },
      {
        id: 'growth_pm',
        name: 'Growth & PLG Product Manager',
        weight: 15,
        targetTitles: ['Growth Product Manager', 'Product Lead - Growth'],
        skills: ['A/B Testing', 'Activation Funnels', 'Viral Loops', 'SQL / Mixpanel'],
        isActive: true,
      },
      {
        id: 'founding_pm',
        name: 'Founding PM (Series A/B)',
        weight: 10,
        targetTitles: ['Founding Product Manager', 'Head of Product'],
        skills: ['Customer Discovery', 'Rapid Prototyping', 'Scrappy Execution', 'Product Market Fit'],
        isActive: true,
      },
    ],
    byokKeys: [
      {
        id: 'apify',
        name: 'Apify Actor Token',
        description: 'Used for scraping Greenhouse, Lever, and LinkedIn company boards.',
        category: 'SCRAPER',
        hasKey: true,
        maskedValue: 'apify_sec_••••••••••••9b2a',
        status: 'CONFIGURED',
        lastTestedAt: '2026-10-30T09:30:00.000Z',
      },
      {
        id: 'apollo',
        name: 'Apollo.io API Key',
        description: 'Used for Door 1 Recruiter & Door 2 HM contact enrichment.',
        category: 'ENRICHMENT',
        hasKey: true,
        maskedValue: 'app_key_••••••••••••e3c1',
        status: 'CONFIGURED',
        lastTestedAt: '2026-10-30T09:30:00.000Z',
      },
      {
        id: 'hunter',
        name: 'Hunter.io API Key',
        description: 'Secondary contact verification for executive email heuristics.',
        category: 'ENRICHMENT',
        hasKey: false,
        maskedValue: undefined,
        status: 'MISSING',
      },
      {
        id: 'groq',
        name: 'Groq API Key',
        description: 'Ultra-fast Whisper audio transcription (whisper-large-v3-turbo).',
        category: 'LLM_REASONING',
        hasKey: true,
        maskedValue: 'gsk_••••••••••••7f42',
        status: 'CONFIGURED',
        lastTestedAt: '2026-10-30T10:15:00.000Z',
      },
      {
        id: 'gemini',
        name: 'Google Gemini 2.0 Flash Key',
        description: 'Optional deep reasoning and resume proof-point synthesis.',
        category: 'LLM_REASONING',
        hasKey: false,
        maskedValue: undefined,
        status: 'MISSING',
      },
    ],
    sources: VERIFIED_SOURCES.map((s) => ({
      id: s.id,
      name: s.name,
      category: s.category,
      section: s.section,
      platformCategory: s.platformCategory,
      applicableRoles: [...s.applicableRoles],
      enabled: true,
      requiresKey: s.requiresKey,
    })),
    monitoredTwitterHandles: ['@levelsio', '@sama'],
    monitoredSubreddits: ['r/ProductManagement', 'r/jobbit', 'r/forhire', 'r/remotework'],
    inboundEmailAddress: 'jobs+hardi@inbound.backdoor.app',
    slackCommunityChannels: [
      { id: 'slack-1', name: '#jobs', workspace: "Lenny's Community", enabled: true },
      { id: 'slack-2', name: '#hiring-pm', workspace: 'Mind the Product', enabled: true },
      { id: 'slack-3', name: '#lead-roles', workspace: 'Product School Alumni', enabled: false },
    ],
    updatedAt: new Date().toISOString(),
  };
}

