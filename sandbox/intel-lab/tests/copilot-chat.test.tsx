/**
 * Test Suite: tests/frontend/copilot-chat.test.tsx
 * Verifies SCR-T09: In-Drawer AI Copilot Panel & Role Sparring
 */

import { test } from 'node:test';
import assert from 'node:assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import fs from 'node:fs';
import path from 'node:path';
import { CopilotPanel } from '../../src/components/dossier/CopilotPanel';
import { POST as CopilotChatRoute } from '../../src/app/api/copilot/chat/route';
import { NextRequest } from 'next/server';

test('IT-COPILOT-01: CopilotPanel renders header, prompt chips, and input controls when open', () => {
  const html = renderToString(
    <CopilotPanel
      isOpen={true}
      onClose={() => {}}
      companyName="Stripe"
      roleTitle="Staff PM"
      scopedProduct="Stripe Connect"
      jobId="job-stripe-01"
      fitScore={88}
    />
  );

  assert.match(html, /Role Sparring Copilot/);
  assert.match(html, /Cmd\+K/);
  assert.match(html, /Case Question: Top Customer Complaint/);
  assert.match(html, /Objection Handling Playbook/);
  assert.match(html, /Verified Proof Points \(Rule R5\)/);
  assert.match(html, /Ask anything about Stripe/);
});

test('IT-COPILOT-02: CopilotPanel renders null when isOpen is false', () => {
  const html = renderToString(
    <CopilotPanel
      isOpen={false}
      onClose={() => {}}
      companyName="Stripe"
      roleTitle="Staff PM"
      jobId="job-stripe-02"
    />
  );

  assert.strictEqual(html, '');
});

test('IT-COPILOT-03: Rule R7 Color Blacklist AST Scanner on CopilotPanel.tsx', () => {
  const filePath = path.join(__dirname, '..', '..', 'src', 'components', 'dossier', 'CopilotPanel.tsx');
  assert.strictEqual(fs.existsSync(filePath), true, 'CopilotPanel.tsx must exist');

  const content = fs.readFileSync(filePath, 'utf8');

  // Rule R7 Banned Tokens: indigo, violet, orange, amber, terracotta
  const bannedKeywords = [
    /\bindigo\b/i,
    /\bviolet\b/i,
    /\borange\b/i,
    /\bamber\b/i,
    /\bterracotta\b/i,
    /#6366f1/i, // indigo-500
    /#f97316/i, // orange-500
    /#f59e0b/i, // amber-500
  ];

  for (const regex of bannedKeywords) {
    const match = content.match(regex);
    assert.strictEqual(
      match,
      null,
      `Rule R7 Violation: Forbidden token "${match?.[0]}" found in CopilotPanel.tsx`
    );
  }
});

test('IT-COPILOT-04: Streaming SSE Copilot endpoint streams token chunks and terminates with [DONE]', async () => {
  const req = new NextRequest('http://localhost:3000/api/copilot/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Simulate a 5-minute case interview question on our top customer complaint.',
      context: {
        company: 'Uber',
        title: 'Staff Product Manager',
        scopedProduct: 'Uber Freight',
        jobId: 'job-uber-01',
      },
    }),
  });

  const res = await CopilotChatRoute(req);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.headers.get('Content-Type'), 'text/event-stream');

  const reader = res.body?.getReader();
  assert.ok(reader, 'Response must have readable stream');

  const decoder = new TextDecoder();
  let fullPayload = '';

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    fullPayload += decoder.decode(value);
  }

  assert.match(fullPayload, /data: /);
  assert.match(fullPayload, /data: \[DONE\]/);

  // Reassemble stream chunks
  let assembledText = '';
  for (const line of fullPayload.split('\n')) {
    if (line.startsWith('data: ') && !line.includes('[DONE]')) {
      try {
        const parsed = JSON.parse(line.slice(6));
        if (parsed.chunk) assembledText += parsed.chunk;
      } catch {}
    }
  }

  assert.match(assembledText, /Uber Freight/);
  assert.match(assembledText, /Diagnostic Challenge/);
  assert.match(assembledText, /Architected multi-agent prompt evaluation/);
});
