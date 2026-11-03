import test from 'node:test';
import assert from 'node:assert';
import { executeDualPassPipeline, agent2Critic, DraftRequest } from '../src/engine/dual-pass-drafter';

test('UT-DUAL-01: Agent 1 (Drafter) produces Door 1 pitch with conversation hooks', () => {
  const req: DraftRequest = {
    candidateName: 'Hardi Jain',
    targetCompany: 'Perplexity',
    targetRole: 'Staff AI Product Manager',
    doorType: 'DOOR_1_FOUNDER',
    recipientName: 'Aravind Srinivas',
    conversationHooks: ['launch of Sonar search API']
  };

  const result = executeDualPassPipeline(req);

  assert.ok(result.initialDraft.includes('Aravind'));
  assert.ok(result.initialDraft.includes('Sonar search API'));
  assert.ok(result.initialDraft.includes('$18.4M'));
  assert.strictEqual(result.passed, true);
  assert.strictEqual(result.verdict, 'APPROVED');
  assert.ok(result.toneScore >= 80);
});

test('UT-DUAL-02: Agent 2 (Critic) flags and vetos hallucinated metrics not in proof points bank', () => {
  const badDraft = "I am passionate about Perplexity and previously scaled revenue to $99.9M with 95% retention.";
  const req: DraftRequest = {
    candidateName: 'Hardi Jain',
    targetCompany: 'Perplexity',
    targetRole: 'Staff AI Product Manager',
    doorType: 'DOOR_1_FOUNDER'
  };

  const review = agent2Critic(badDraft, req);

  assert.strictEqual(review.passed, false);
  assert.strictEqual(review.verdict, 'REVISION_REQUIRED');
  assert.ok(review.criticFeedback.some((f) => f.includes('Metric Veto') || f.includes('unverified metric')));
  assert.ok(review.flaggedCliches.some((c) => c.includes('passionate about')));
});

test('UT-DUAL-03: Critic strips forbidden cliches and produces sanitized approved final text', () => {
  const req: DraftRequest = {
    candidateName: 'Hardi Jain',
    targetCompany: 'Linear',
    targetRole: 'Lead Product Manager',
    doorType: 'DOOR_2_TALENT',
    recipientName: 'Elena'
  };

  const result = executeDualPassPipeline(req);

  assert.ok(result.finalApprovedText.length > 0);
  assert.strictEqual(result.finalApprovedText.includes('—'), false);
  assert.strictEqual(result.finalApprovedText.includes('passionate about'), false);
  assert.strictEqual(result.finalApprovedText.includes('great fit'), false);
});
