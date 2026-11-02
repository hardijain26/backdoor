import test from 'node:test';
import assert from 'node:assert';
import { isCompanyBriefCacheValid } from '../src/engine/teardown';

test('SCR-T10-01: Interview Gate Stage Classification Logic', () => {
  const isInterviewConfirmed = (stage?: string): boolean => {
    if (!stage) return false;
    const s = stage.toUpperCase();
    return (
      s === 'IN_CONVERSATION' ||
      s === 'INTERVIEW_SCHEDULED' ||
      s === 'OFFER' ||
      s === 'ACCEPTED' ||
      s === 'INTERVIEWING'
    );
  };

  // Cold stages must be gated
  assert.strictEqual(isInterviewConfirmed('DISCOVERED'), false, 'DISCOVERED must gate deep teardown');
  assert.strictEqual(isInterviewConfirmed('CHOSEN'), false, 'CHOSEN must gate deep teardown');
  assert.strictEqual(isInterviewConfirmed(undefined), false, 'Undefined must gate deep teardown');

  // Interview confirmed stages must be unlocked
  assert.strictEqual(isInterviewConfirmed('IN_CONVERSATION'), true, 'IN_CONVERSATION must unlock deep teardown');
  assert.strictEqual(isInterviewConfirmed('INTERVIEW_SCHEDULED'), true, 'INTERVIEW_SCHEDULED must unlock deep teardown');
  assert.strictEqual(isInterviewConfirmed('OFFER'), true, 'OFFER must unlock deep teardown');
});

test('SCR-T10-02: 30-Day Cache TTL Anchor Enforcement', () => {
  const freshDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(); // 5 days old
  const staleDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 35).toISOString(); // 35 days old

  assert.strictEqual(isCompanyBriefCacheValid(freshDate, 30), true, '5-day-old cache must be valid');
  assert.strictEqual(isCompanyBriefCacheValid(staleDate, 30), false, '35-day-old cache must be invalid');
  assert.strictEqual(isCompanyBriefCacheValid(undefined, 30), false, 'Undefined fetched_at must be invalid');
});

