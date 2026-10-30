import test from 'node:test';
import assert from 'node:assert';
import {
  encryptVaultSecret,
  decryptVaultSecret,
  maskSecretValue,
  evaluateCustomNegativeFilters,
  getSettingsWorkspace,
  updateProfileLocation,
  updateNegativeFilterRules,
  updateDynamicTracks,
  saveByokSecretKey,
  testByokKey,
  resetSettingsStore,
} from '../src/engine/settings';

test('UT-SET-01: AES-256-GCM encryption and decryption roundtrip produces exact plaintext', () => {
  const secret = 'gsk_mockSecretKey1234567890abcdefghijklmnopqrstuvwxyz';
  const encrypted = encryptVaultSecret(secret);

  assert.notStrictEqual(encrypted, secret);
  assert.match(encrypted, /^[0-9a-f]+:[0-9a-f]+:[0-9a-f]+$/); // iv:tag:ciphertext

  const decrypted = decryptVaultSecret(encrypted);
  assert.strictEqual(decrypted, secret);
});

test('UT-SET-02: Decryption with tampered payload or incorrect auth tag fails securely', () => {
  const secret = 'apollo_api_key_sensitive_999';
  const encrypted = encryptVaultSecret(secret);
  const parts = encrypted.split(':');

  // Tamper with ciphertext
  const tampered = `${parts[0]}:${parts[1]}:${parts[2].slice(0, -2)}aa`;
  assert.throws(() => {
    decryptVaultSecret(tampered);
  });
});

test('UT-SET-03: Masking secret preserves prefix and suffix for candidate verification', () => {
  const secret = 'apify_sec_123456789abcdef';
  const masked = maskSecretValue(secret);

  assert.strictEqual(masked.startsWith('apif'), true);
  assert.strictEqual(masked.endsWith('cdef'), true);
  assert.ok(masked.includes('••••••••••••'));
});

test('UT-SET-04: Negative filter engine drops excluded companies, banned titles, and blocked industries', () => {
  resetSettingsStore();

  // 1. Excluded company (Meta)
  const metaJob = { title: 'Staff Product Manager', company: 'Meta Platforms' };
  const resMeta = evaluateCustomNegativeFilters(metaJob);
  assert.strictEqual(resMeta.passed, false);
  assert.match(resMeta.reason || '', /excluded companies/);

  // 2. Excluded title pattern (intern / recruiter)
  const internJob = { title: 'Product Intern', company: 'Acme AI' };
  const resIntern = evaluateCustomNegativeFilters(internJob);
  assert.strictEqual(resIntern.passed, false);
  assert.match(resIntern.reason || '', /excluded pattern/);

  // 3. Blocked industry (crypto / fintech)
  const cryptoJob = { title: 'Senior Product Manager', company: 'Apex Crypto Exchange' };
  const resCrypto = evaluateCustomNegativeFilters(cryptoJob);
  assert.strictEqual(resCrypto.passed, false);
  assert.match(resCrypto.reason || '', /blocked industry/);

  // 4. Clean job passes
  const cleanJob = { title: 'Staff Product Manager', company: 'Stripe' };
  const resClean = evaluateCustomNegativeFilters(cleanJob);
  assert.strictEqual(resClean.passed, true);
});

test('UT-SET-05: Profile location updates candidate IANA timezone canonical identifier', () => {
  resetSettingsStore();

  // Test India
  const resIndia = updateProfileLocation({ country: 'India', state: 'Karnataka' });
  assert.strictEqual(resIndia.resolvedIanaTimezone, 'Asia/Kolkata');
  assert.strictEqual(resIndia.timezoneLabel, 'IST');

  // Test United States New York
  const resUS = updateProfileLocation({ country: 'United States', state: 'New York' });
  assert.strictEqual(resUS.resolvedIanaTimezone, 'America/New_York');
  assert.strictEqual(resUS.timezoneLabel, 'EST');
});

test('UT-SET-06: BYOK key saving, encryption, and validation test runner', async () => {
  resetSettingsStore();

  // Save new Apify key
  const saved = saveByokSecretKey('apify', 'apify_new_token_12345678');
  assert.strictEqual(saved.hasKey, true);
  assert.strictEqual(saved.status, 'CONFIGURED');
  assert.ok(saved.maskedValue && saved.maskedValue.includes('••••'));

  // Test configured key
  const testRes = await testByokKey('apify');
  assert.strictEqual(testRes.success, true);
  assert.strictEqual(testRes.status, 'TEST_PASSED');

  // Test missing key (gemini)
  const missingRes = await testByokKey('gemini');
  assert.strictEqual(missingRes.success, false);
  assert.strictEqual(missingRes.status, 'MISSING');
});

