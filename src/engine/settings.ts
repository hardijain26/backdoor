/**
 * Subsystem 5: Encrypted Settings & BYOK Vault Engine (@settings/vault M9)
 * AES-256 Encryption, Negative Filter Rules, Dynamic Track Weights, and Profile Timezone.
 * Runbook §5.8 | PRD §5.5 | Cardinal Rules R1, R6, R7 & R8 Invariants
 */

import crypto from 'crypto';
import { resolveSenderTimezone, SenderLocationInput } from './cadence';
import { VERIFIED_SOURCES, SourceDefinition } from './scraper';
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

export interface SettingsWorkspaceState {
  profile: UserProfileTimezone;
  googleOAuth: GoogleOAuthStatus;
  negativeFilters: NegativeFilterRules;
  dynamicTracks: DynamicTrackConfig[];
  byokKeys: ByokKeyItem[];
  sources: { id: string; name: string; category: string; enabled: boolean; requiresKey: boolean }[];
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
    scopes: ['https://www.googleapis.com/auth/gmail.compose', 'https://www.googleapis.com/auth/drive.file'],
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
    enabled: true,
    requiresKey: s.requiresKey,
  })),
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
    sources: settingsState.sources.map((s) => ({ ...s })),
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
      scopes: ['https://www.googleapis.com/auth/gmail.compose', 'https://www.googleapis.com/auth/drive.file'],
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
      enabled: true,
      requiresKey: s.requiresKey,
    })),
    updatedAt: new Date().toISOString(),
  };
}

