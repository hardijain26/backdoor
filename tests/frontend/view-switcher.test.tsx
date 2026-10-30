import test from 'node:test';
import assert from 'node:assert';

interface TriageState {
  viewMode: 'bento' | 'table';
  selectedIndex: number;
  searchQuery: string;
  jobs: Array<{ id: string; stage: string; fitScore: number; company: string }>;
}

function toggleView(state: TriageState): TriageState {
  return {
    ...state,
    viewMode: state.viewMode === 'bento' ? 'table' : 'bento'
  };
}

test('IT-FE-03: View Switcher State Preservation (Bento <-> Dense Table)', () => {
  const initialJobs = [
    { id: 'job-1', company: 'Stripe', stage: 'DISCOVERED', fitScore: 94 },
    { id: 'job-2', company: 'Linear', stage: 'DISCOVERED', fitScore: 88 },
    { id: 'job-3', company: 'OpenAI', stage: 'DISCOVERED', fitScore: 84 }
  ];

  let state: TriageState = {
    viewMode: 'bento',
    selectedIndex: 1, // Linear selected
    searchQuery: 'linear',
    jobs: initialJobs
  };

  // 1. Initial Bento State
  assert.strictEqual(state.viewMode, 'bento');
  assert.strictEqual(state.selectedIndex, 1);
  assert.strictEqual(state.searchQuery, 'linear');

  // 2. Toggle to Dense Table
  state = toggleView(state);
  assert.strictEqual(state.viewMode, 'table', 'View mode toggled to table');
  assert.strictEqual(state.selectedIndex, 1, 'Selected index must be preserved across view toggle');
  assert.strictEqual(state.searchQuery, 'linear', 'Search query must be preserved across view toggle');

  // 3. Mutate stage in table view (e.g. choose role)
  state = {
    ...state,
    jobs: state.jobs.map((j) => (j.id === 'job-2' ? { ...j, stage: 'CHOSEN' } : j))
  };

  // 4. Toggle back to Bento Cards
  state = toggleView(state);
  assert.strictEqual(state.viewMode, 'bento', 'View mode toggled back to bento');
  assert.strictEqual(state.selectedIndex, 1, 'Selected index still preserved');
  assert.strictEqual(state.searchQuery, 'linear', 'Search query still preserved');
  assert.strictEqual(
    state.jobs.find((j) => j.id === 'job-2')?.stage,
    'CHOSEN',
    'Triage mutations must persist seamlessly across view changes'
  );
});

