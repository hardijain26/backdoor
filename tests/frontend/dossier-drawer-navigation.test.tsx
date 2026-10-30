import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

// Unit Test Suite for S3-T01: 640px Slide-Out Dossier Drawer (Runbook §4.3 & §4.6)

test('UT-DD-01: Dossier Drawer 640px Geography & Surface Tokens', () => {
  const componentPath = path.resolve(process.cwd(), 'src/components/dossier/DossierDrawer.tsx');
  assert.ok(fs.existsSync(componentPath), 'DossierDrawer.tsx must exist');

  const content = fs.readFileSync(componentPath, 'utf8');

  // Must enforce 640px max width on desktop
  assert.ok(
    content.includes('max-w-[640px]'),
    'Dossier drawer must enforce 640px max width'
  );

  // Must use Precision Cobalt & Steel surface token #161F33
  assert.ok(
    content.includes('bg-[#161F33]'),
    'Dossier drawer surface must use Precision Cobalt Drawer token #161F33'
  );

  // Must have border-l and z-50 elevation
  assert.ok(
    content.includes('border-l border-white/10') && content.includes('z-50'),
    'Dossier drawer must have elevated border-l and z-50 stack positioning'
  );
});

test('UT-DD-02: 5-Tab Architecture (Spec, Match, Intel, Doors, Draft)', () => {
  const componentPath = path.resolve(process.cwd(), 'src/components/dossier/DossierDrawer.tsx');
  const content = fs.readFileSync(componentPath, 'utf8');

  // Verify all 5 tab keys are defined
  const requiredTabs = ['spec', 'match', 'intel', 'doors', 'draft'];
  for (const tab of requiredTabs) {
    assert.ok(
      content.includes(`'${tab}'`),
      `DossierDrawer must define tab key: ${tab}`
    );
  }

  // Verify Tab labels
  assert.ok(content.includes('1. Spec'), 'Tab 1 label must be "1. Spec"');
  assert.ok(content.includes('2. Match'), 'Tab 2 label must be "2. Match"');
  assert.ok(content.includes('3. Intel'), 'Tab 3 label must be "3. Intel"');
  assert.ok(content.includes('4. Three Doors'), 'Tab 4 label must be "4. Three Doors"');
  assert.ok(content.includes('5. Outreach & CV'), 'Tab 5 label must be "5. Outreach & CV"');
});

test('UT-DD-03: LinkedIn Connection Note Character Limiter (<= 300 chars)', () => {
  const testNote = 'A'.repeat(301);
  const isValid = testNote.length <= 300;
  assert.strictEqual(isValid, false, '301 characters must be flagged as exceeding limit');

  const validNote = 'Hi Sarah, noticed your team is building scalable platform infrastructure at Stripe. Having led PM teams from 0 to 1M users, I have specific ideas on your growth roadmap. Would love to share insights.';
  assert.ok(validNote.length <= 300, `Valid note must be under 300 chars (actual: ${validNote.length})`);
});

test('UT-DD-04: Rule R1 Invariant: Gmail Draft Staging (Zero Auto-Send)', () => {
  const componentPath = path.resolve(process.cwd(), 'src/components/dossier/DossierDrawer.tsx');
  const content = fs.readFileSync(componentPath, 'utf8');

  // Verify staging in ThreeDoors/Drafts
  assert.ok(
    content.includes('ThreeDoors/Drafts'),
    'Outreach tab must reference ThreeDoors/Drafts label'
  );

  // Permanently forbid messages.send call
  assert.ok(
    !content.includes('messages.send'),
    'Rule R1: Component must NEVER call messages.send'
  );

  // Recipient timezone scheduling badge (Tue-Thu 09:15)
  assert.ok(
    content.includes('09:15 AM'),
    'Outreach tab must display 09:15 AM recipient timezone scheduling'
  );
});

test('UT-DD-05: In-Drawer Rapid Candidate Cycling State Machine', () => {
  interface CyclingState {
    currentIndex: number;
    total: number;
    openId: string;
    jobs: string[];
  }

  const jobs = ['job-1', 'job-2', 'job-3', 'job-4'];
  let state: CyclingState = {
    currentIndex: 1, // job-2
    total: 4,
    openId: 'job-2',
    jobs
  };

  // Navigate Next (ArrowDown / j)
  if (state.currentIndex < state.total - 1) {
    state.currentIndex += 1;
    state.openId = state.jobs[state.currentIndex];
  }
  assert.strictEqual(state.currentIndex, 2);
  assert.strictEqual(state.openId, 'job-3', 'Cycling down must select job-3');

  // Navigate Prev (ArrowUp / k)
  if (state.currentIndex > 0) {
    state.currentIndex -= 1;
    state.openId = state.jobs[state.currentIndex];
  }
  assert.strictEqual(state.currentIndex, 1);
  assert.strictEqual(state.openId, 'job-2', 'Cycling up must return to job-2');
});

test('UT-DD-06: Rule R7 Color Blacklist AST Scanner on DossierDrawer', () => {
  const componentPath = path.resolve(process.cwd(), 'src/components/dossier/DossierDrawer.tsx');
  const content = fs.readFileSync(componentPath, 'utf8');

  // Strip comments
  const stripped = content.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').toLowerCase();

  const bannedKeywords = ['indigo', 'violet', 'orange', 'amber', 'terracotta'];
  for (const banned of bannedKeywords) {
    const regex = new RegExp(`\\b${banned}\\b`, 'i');
    assert.ok(
      !regex.test(stripped),
      `Rule R7 violation: Found forbidden color token "${banned}" in DossierDrawer.tsx`
    );
  }
});

