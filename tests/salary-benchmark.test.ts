import test from 'node:test';
import assert from 'node:assert';
import { benchmarkSalary, parseSalaryNumbers, detectSeniorityTier } from '../src/engine/salary-benchmark';

test('UT-SAL-01: Detects seniority tiers from title string', () => {
  assert.strictEqual(detectSeniorityTier('Senior Product Manager'), 'SENIOR');
  assert.strictEqual(detectSeniorityTier('Staff Product Manager'), 'STAFF_LEAD');
  assert.strictEqual(detectSeniorityTier('Lead PM, Core Workflows'), 'STAFF_LEAD');
  assert.strictEqual(detectSeniorityTier('Principal PM, AI Agents'), 'PRINCIPAL');
  assert.strictEqual(detectSeniorityTier('Head of Product'), 'DIRECTOR_EXEC');
  assert.strictEqual(detectSeniorityTier('VP of Product'), 'DIRECTOR_EXEC');
});

test('UT-SAL-02: Parses USD compensation strings accurately', () => {
  const r1 = parseSalaryNumbers('$180,000 - $240,000');
  assert.strictEqual(r1.min, 180000);
  assert.strictEqual(r1.max, 240000);
  assert.strictEqual(r1.currency, 'USD');

  const r2 = parseSalaryNumbers('$190K - $260K');
  assert.strictEqual(r2.min, 190000);
  assert.strictEqual(r2.max, 260000);
});

test('UT-SAL-03: Parses India LPA compensation strings accurately', () => {
  const r = parseSalaryNumbers('₹45.0L - ₹65.0L PA');
  assert.strictEqual(r.currency, 'INR');
  assert.strictEqual(r.min, 4500000);
  assert.strictEqual(r.max, 6500000);
});

test('UT-SAL-04: Computes P75 and P90 percentiles with badge labeling', () => {
  const b1 = benchmarkSalary('$260,000 - $320,000', 'Staff AI Product Manager');
  assert.ok(b1.percentile === 'P75' || b1.percentile === 'P90');
  assert.ok(b1.badgeLabel.includes('Top'));
  assert.strictEqual(b1.isAboveMarketMedian, true);

  const b2 = benchmarkSalary('$120,000 - $145,000', 'Staff Product Manager');
  assert.strictEqual(b2.percentile, 'P25');
  assert.strictEqual(b2.isAboveMarketMedian, false);
});

