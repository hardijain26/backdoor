/**
 * Backdoor Google OAuth 2.0 Security & Scope Configuration
 * Scope policy: Strictly minimal privileges.
 * 
 * In accordance with Sprint 6 data protection invariants:
 * - Explicitly excludes https://www.googleapis.com/auth/spreadsheets to prevent outbound data mirroring.
 * - Retains strictly: documents, drive.file, gmail.compose, gmail.readonly, and calendar.events.
 */

export const AUTHORIZED_GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/documents',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.events',
] as const;

export const FORBIDDEN_GOOGLE_OAUTH_SCOPES = [
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
] as const;

/**
 * Returns authorized Google OAuth permission scopes.
 */
export function getAuthorizedGoogleOAuthScopes(): string[] {
  return [...AUTHORIZED_GOOGLE_OAUTH_SCOPES];
}

/**
 * Verifies that a given scope list strictly excludes spreadsheets permissions.
 */
export function isSpreadsheetScopeExcluded(scopes: string[]): boolean {
  return !scopes.some((s) => s.toLowerCase().includes('spreadsheets'));
}

/**
 * Validates requested scopes against platform data sovereignty policy.
 */
export function validateOAuthScopes(scopes: string[]): {
  valid: boolean;
  hasSpreadsheetsScope: boolean;
  authorizedScopes: string[];
} {
  const hasSpreadsheets = !isSpreadsheetScopeExcluded(scopes);
  return {
    valid: !hasSpreadsheets,
    hasSpreadsheetsScope: hasSpreadsheets,
    authorizedScopes: getAuthorizedGoogleOAuthScopes(),
  };
}
