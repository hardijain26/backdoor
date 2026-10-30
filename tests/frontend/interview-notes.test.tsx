import { test } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import {
  getInterviewsWorkspaceState,
  toggleActionItem,
  stageInterviewThankYouDraft,
  resetInterviewsWorkspace,
} from '../../src/engine/interviews-workspace';
import InterviewsPage from '../../src/app/interviews/page';

test('IT-INT-01: Interviews workspace state aggregates metrics and returns seeded rounds', () => {
  resetInterviewsWorkspace();
  const state = getInterviewsWorkspaceState();

  assert.equal(state.totalInterviews, 3);
  assert.equal(state.completedRounds, 2);
  assert.ok(state.openActionItems >= 1);
  assert.equal(state.upcomingRounds, 1);
  assert.ok(state.interviews.some((i) => i.company === 'Anthropic'));
  assert.ok(state.interviews.some((i) => i.company === 'Stripe'));
  assert.ok(state.interviews.some((i) => i.company === 'Linear'));
});

test('IT-INT-02: Action items checkbox toggle updates completion state', () => {
  resetInterviewsWorkspace();
  const interviewId = 'int-anthropic-hm-01';
  const actionItemId = 'act-anthropic-1';

  // Initially incomplete
  let state = getInterviewsWorkspaceState();
  let anthropic = state.interviews.find((i) => i.id === interviewId)!;
  let targetAction = anthropic.myActionItems.find((a) => a.id === actionItemId)!;
  assert.equal(targetAction.isCompleted, false);

  // Toggle to completed
  const toggleRes = toggleActionItem(interviewId, actionItemId);
  assert.equal(toggleRes.success, true);
  assert.equal(toggleRes.item?.isCompleted, true);

  // Verify in state
  state = getInterviewsWorkspaceState();
  anthropic = state.interviews.find((i) => i.id === interviewId)!;
  targetAction = anthropic.myActionItems.find((a) => a.id === actionItemId)!;
  assert.equal(targetAction.isCompleted, true);
});

test('IT-INT-03: Staging a Thank-You note draft updates interview record', () => {
  resetInterviewsWorkspace();
  const interviewId = 'int-linear-case-01';

  const res = stageInterviewThankYouDraft(interviewId, 'founders@linear.app');
  assert.equal(res.success, true);
  assert.ok(res.draftSubject?.includes('Linear'));
  assert.ok(res.draftBody?.includes('Hardi Jain'));

  const state = getInterviewsWorkspaceState();
  const linear = state.interviews.find((i) => i.id === interviewId)!;
  assert.equal(linear.thankYouDraftStaged, true);
});

test('IT-INT-04: InterviewsPage SSR renders header, metrics, and round cards', () => {
  resetInterviewsWorkspace();
  const html = renderToString(<InterviewsPage />);

  assert.ok(html.includes('Interview Notes &amp; Debrief Workspace') || html.includes('Interview Notes & Debrief Workspace'));
  assert.ok(html.includes('Anthropic'));
  assert.ok(html.includes('Stripe'));
  assert.ok(html.includes('Linear'));
  assert.ok(html.includes('My Action Items'));
  assert.ok(html.includes('Verbatim Call Transcript'));
});

test('IT-INT-05: Rule R7 Color Blacklist Audit across Interview Intelligence Subsystem', () => {
  const filesToCheck = [
    'src/engine/audio-transcription.ts',
    'src/engine/interviews-workspace.ts',
    'src/app/interviews/page.tsx',
    'extension/audio-capture.js',
  ];

  const forbiddenColorPatterns = [
    /text-indigo-/i,
    /bg-indigo-/i,
    /border-indigo-/i,
    /text-violet-/i,
    /bg-violet-/i,
    /border-violet-/i,
    /text-amber-/i,
    /bg-amber-/i,
    /border-amber-/i,
    /text-orange-/i,
    /bg-orange-/i,
    /border-orange-/i,
    /#6366f1/i, // Indigo-500
    /#8b5cf6/i, // Violet-500
    /#f59e0b/i, // Amber-500
    /#f97316/i, // Orange-500
  ];

  for (const relativePath of filesToCheck) {
    const fullPath = path.resolve(process.cwd(), relativePath);
    if (!fs.existsSync(fullPath)) continue;
    const content = fs.readFileSync(fullPath, 'utf-8');

    for (const pattern of forbiddenColorPatterns) {
      assert.ok(
        !pattern.test(content),
        `Rule R7 Violation: Forbidden color token ${pattern} found in ${relativePath}`
      );
    }
  }
});
