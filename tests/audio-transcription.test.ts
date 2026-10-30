/**
 * BACKDOOR v1.0 - AUDIO TRANSCRIPTION & GROQ WHISPER UNIT TESTS
 * Test Suite: tests/audio-transcription.test.ts
 * Authoritative: Runbook §5.4.5 & PRD M4-FR9
 */

import { test } from 'node:test';
import assert from 'node:assert';
import {
  validateAudioChunkSize,
  transcribeAudioChunk,
  extractStructuredNotesFromTranscript,
  generateThankYouDraftPayload,
  MAX_AUDIO_CHUNK_BYTES,
} from '../src/engine/audio-transcription';

test('UT-AUDIO-01: 25MB audio chunk size boundary enforcement', () => {
  // Valid <= 25MB
  assert.strictEqual(validateAudioChunkSize(1024), true);
  assert.strictEqual(validateAudioChunkSize(MAX_AUDIO_CHUNK_BYTES), true);

  // Invalid: 0 bytes or > 25MB
  assert.strictEqual(validateAudioChunkSize(0), false);
  assert.strictEqual(validateAudioChunkSize(MAX_AUDIO_CHUNK_BYTES + 1), false);
  assert.strictEqual(validateAudioChunkSize(30 * 1024 * 1024), false);
});

test('UT-AUDIO-02: Groq Whisper transcription with deterministic fallback ($0 cost)', async () => {
  const dummyBuffer = Buffer.alloc(5000); // 5KB audio chunk
  const result = await transcribeAudioChunk(dummyBuffer, {
    interviewId: 'test-int-01',
    company: 'Anthropic',
    round: 'HIRING_MANAGER',
    chunkIndex: 0,
  });

  assert.ok(result.transcriptText.length > 50, 'Must produce a non-empty transcript');
  assert.match(result.transcriptText, /Anthropic/);
  assert.match(result.transcriptText, /Sarah Chen/);
  assert.ok(result.executionMs >= 0);
  assert.ok(['GROQ_API', 'DETERMINISTIC_FALLBACK'].includes(result.source));
});

test('UT-AUDIO-03: Structured interview notes extraction parses QnAs, Actions, and Next Steps', () => {
  const sampleTranscript = `
    [00:00] Sarah Chen: How did you scale prompt evaluation?
    [00:30] Hardi Jain: We cut query latency by 42% across 1.2M prompts.
    [01:00] Sarah Chen: Please send your portfolio deck by Friday.
  `;

  const notes = extractStructuredNotesFromTranscript(
    sampleTranscript,
    'int-sample-123',
    'Anthropic',
    'Senior PM, Systems',
    'HIRING_MANAGER'
  );

  assert.strictEqual(notes.company, 'Anthropic');
  assert.strictEqual(notes.roleTitle, 'Senior PM, Systems');
  assert.ok(notes.qnaPairs.length >= 1, 'Must extract QnA pairs');
  assert.ok(notes.myActionItems.length >= 1, 'Must extract candidate action items');
  assert.ok(notes.theirActionItems.length >= 1, 'Must extract interviewer commitments');
  assert.ok(notes.nextSteps.length >= 1, 'Must extract next steps');
  assert.strictEqual(notes.overallSentiment, 'STRONG_HIRE');
});

test('UT-AUDIO-04: Rule R5 Metric Verification — preserved metrics in extracted notes', () => {
  const transcript = `
    [00:00] Sarah Chen: Tell me about your accuracy and latency numbers.
    [00:30] Hardi Jain: We achieved 42% latency reduction across 1.2M prompts and 94.6% retrieval precision.
  `;

  const notes = extractStructuredNotesFromTranscript(
    transcript,
    'int-metrics-audit',
    'Anthropic',
    'Staff PM',
    'HIRING_MANAGER'
  );

  // Check that summary and QnA answers preserve exact numbers
  const combinedText = JSON.stringify(notes);
  assert.match(combinedText, /42%/, 'Must preserve 42% metric');
  assert.match(combinedText, /94\.6%/, 'Must preserve 94.6% metric');
});

test('UT-AUDIO-05: Thank-You email draft payload generation with Rule R1 compliance', () => {
  const sampleTranscript = 'Mock transcript content';
  const notes = extractStructuredNotesFromTranscript(
    sampleTranscript,
    'int-thank-you',
    'Anthropic',
    'Senior PM',
    'HIRING_MANAGER'
  );

  const draft = generateThankYouDraftPayload(notes, 'sarah.chen@anthropic.com');

  assert.strictEqual(draft.toEmail, 'sarah.chen@anthropic.com');
  assert.match(draft.subject, /Anthropic Product Discussion - Hardi Jain/);
  assert.match(draft.body, /Hi Sarah/);
  assert.match(draft.body, /Thank you for taking the time to speak today/);
  assert.match(draft.body, /Hardi Jain/);
  assert.match(draft.suggestedSendWindow, /Within 2 hours/);
});
