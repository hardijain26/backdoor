import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getCadenceBoard,
  transitionCadence,
  mapStatusToSwimlane,
  addStagedCadence,
  getDecisionAuditEvents,
  resetCadenceBoard,
} from '../src/engine/cadence-lifecycle';

test('UT-LC-01: Lifecycle state machine initialization & Kanban swimlane mappings', () => {
  resetCadenceBoard();

  assert.equal(mapStatusToSwimlane('DRAFT_PENDING'), 'DRAFT_READY');
  assert.equal(mapStatusToSwimlane('DRAFT_CREATED'), 'DRAFT_READY');
  assert.equal(mapStatusToSwimlane('SENT'), 'SENT');
  assert.equal(mapStatusToSwimlane('FOLLOW_UP_DUE'), 'FOLLOW_UP_DUE');
  assert.equal(mapStatusToSwimlane('REPLIED'), 'IN_CONVERSATION');
  assert.equal(mapStatusToSwimlane('IN_CONVERSATION'), 'IN_CONVERSATION');
  assert.equal(mapStatusToSwimlane('BOUNCED'), 'CLOSED');
  assert.equal(mapStatusToSwimlane('CANCELLED'), 'CLOSED');

  const board = getCadenceBoard();
  assert.ok(board.metrics.totalActive > 0);
  assert.equal(board.swimlanes.DRAFT_READY.length, 1);
  assert.equal(board.swimlanes.SENT.length, 1);
  assert.equal(board.swimlanes.FOLLOW_UP_DUE.length, 1);
  assert.equal(board.swimlanes.IN_CONVERSATION.length, 1);
  assert.equal(board.swimlanes.CLOSED.length, 1);
});

test('UT-LC-02: Manual transition MARK_SENT sets sentAt and schedules Day 3 follow-up', () => {
  resetCadenceBoard();

  const result = transitionCadence('cadence-figma-01', 'MARK_SENT', 'hardi');
  assert.equal(result.success, true);
  assert.equal(result.cadence.status, 'SENT');
  assert.equal(result.cadence.swimlane, 'SENT');
  assert.ok(result.cadence.sentAt);
  assert.ok(result.cadence.followUpDueDate);

  // Check board reflects change
  const board = getCadenceBoard();
  assert.equal(board.swimlanes.DRAFT_READY.length, 0);
  assert.equal(board.swimlanes.SENT.length, 2);
});

test('UT-LC-03: Inbound Gmail reply auto-halts reminders and advances to IN_CONVERSATION', () => {
  resetCadenceBoard();

  const result = transitionCadence(
    'cadence-openai-02',
    'INBOUND_REPLY',
    'thread_watcher',
    'Recruiter replied: Lets set up a call'
  );

  assert.equal(result.success, true);
  assert.equal(result.cadence.status, 'IN_CONVERSATION');
  assert.equal(result.cadence.swimlane, 'IN_CONVERSATION');
  assert.ok(result.cadence.repliedAt);
  assert.ok(result.cadence.lastEventNote?.includes('Inbound'));

  const board = getCadenceBoard();
  assert.equal(board.swimlanes.IN_CONVERSATION.length, 2);
});

test('UT-LC-04: Candidate marking REPLIED_LINKEDIN advances touchpoint to IN_CONVERSATION', () => {
  resetCadenceBoard();

  const result = transitionCadence('cadence-stripe-03', 'REPLIED_LINKEDIN', 'hardi');
  assert.equal(result.success, true);
  assert.equal(result.cadence.status, 'IN_CONVERSATION');
  assert.equal(result.cadence.swimlane, 'IN_CONVERSATION');
  assert.ok(result.cadence.repliedAt);
  assert.ok(result.cadence.lastEventNote?.includes('LinkedIn'));
});

test('UT-LC-05: Immutable decision audit trail generation on every state mutation', () => {
  resetCadenceBoard();

  transitionCadence('cadence-figma-01', 'MARK_SENT', 'hardi');
  transitionCadence('cadence-figma-01', 'INBOUND_REPLY', 'thread_watcher');

  const events = getDecisionAuditEvents('cadence-figma-01');
  assert.equal(events.length, 2);
  assert.equal(events[0].action, 'MARK_SENT');
  assert.equal(events[0].actor, 'hardi');
  assert.equal(events[0].previousStatus, 'DRAFT_CREATED');
  assert.equal(events[0].newStatus, 'SENT');

  assert.equal(events[1].action, 'INBOUND_REPLY');
  assert.equal(events[1].actor, 'thread_watcher');
  assert.equal(events[1].previousStatus, 'SENT');
  assert.equal(events[1].newStatus, 'IN_CONVERSATION');
});

test('UT-LC-06: Adding staged cadence dynamically from /radar maps to DRAFT_READY', () => {
  resetCadenceBoard();

  const newCadence = addStagedCadence({
    id: 'cadence-new-99',
    jobId: 'job-99',
    company: 'Anthropic',
    jobTitle: 'Product Manager, Alignment',
    location: 'San Francisco, CA',
    contactName: 'Dario Amodei',
    contactTitle: 'CEO',
    contactEmail: 'dario@anthropic.com',
    door: 'door1',
    channel: 'GMAIL',
    stepNumber: 1,
    status: 'DRAFT_CREATED',
    suggestedSendAt: new Date().toISOString(),
    primaryDispatchWindow: 'Tue 22:45 IST (09:15 SF local)',
    gmailDeepLink: 'https://mail.google.com/mail',
    subject: 'Alignment PM',
    bodyText: 'Pitch draft text',
    linkedInNote: 'Hi Dario, tracking your safety roadmap.',
  });

  assert.equal(newCadence.swimlane, 'DRAFT_READY');

  const board = getCadenceBoard();
  assert.equal(board.swimlanes.DRAFT_READY.length, 2);
});

