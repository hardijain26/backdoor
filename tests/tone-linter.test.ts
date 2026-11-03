import test from 'node:test';
import assert from 'node:assert';
import { lintExecutiveTone, removeEmDashes, FORBIDDEN_CLICHES } from '../src/engine/tone-linter';

test('UT-TONE-01: Linting detects and removes forbidden AI clichés', () => {
  const input = "I am passionate about leading AI products and believe I would be a great fit to hit the ground running.";
  const result = lintExecutiveTone(input);

  assert.strictEqual(result.passed, false);
  assert.ok(result.violations.length >= 2);
  assert.ok(result.violations.some((v) => v.includes('passionate about')));
  assert.ok(result.violations.some((v) => v.includes('great fit')));
  assert.strictEqual(result.cleanedText.includes('passionate about'), false);
  assert.strictEqual(result.cleanedText.includes('great fit'), false);
});

test('UT-TONE-02: Linting detects and eliminates em-dashes', () => {
  const input = "Scaled enterprise ARR to $18.4M — driving 42% margin expansion -- with zero headcount inflation.";
  const result = lintExecutiveTone(input);

  assert.strictEqual(result.hasEmDash, true);
  assert.strictEqual(result.cleanedText.includes('—'), false);
  assert.strictEqual(result.cleanedText.includes('--'), false);
  assert.ok(result.cleanedText.includes('$18.4M,'));
});

test('UT-TONE-03: Linting hardens weak passive qualifiers to active executive voice', () => {
  const input = "I believe I can accelerate your roadmap and I think I would streamline deployment.";
  const result = lintExecutiveTone(input);

  assert.strictEqual(result.hasPassiveQualifiers, true);
  assert.ok(result.cleanedText.includes('I will accelerate'));
  assert.ok(result.cleanedText.includes('I am positioned to streamline'));
});

test('UT-TONE-04: Clean executive text passes with 100/100 score', () => {
  const clean = "Led cross-functional team of 14 to deliver enterprise platform, growing ARR from $10M to $25M in 14 months.";
  const result = lintExecutiveTone(clean);

  assert.strictEqual(result.passed, true);
  assert.strictEqual(result.score, 100);
  assert.strictEqual(result.violations.length, 0);
  assert.strictEqual(result.cleanedText, clean);
});

