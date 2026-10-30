import test from 'node:test';
import assert from 'node:assert';
import { handleTableKeyDown } from '../../src/components/useTableKeyboardNav';

// Mock KeyboardEvent in Node
class MockKeyboardEvent extends Event {
  key: string;
  metaKey: boolean;
  ctrlKey: boolean;
  altKey: boolean;
  target: any;
  defaultPrevented: boolean = false;

  constructor(type: string, init: any = {}) {
    super(type);
    this.key = init.key || '';
    this.metaKey = !!init.metaKey;
    this.ctrlKey = !!init.ctrlKey;
    this.altKey = !!init.altKey;
    this.target = init.target || null;
  }

  preventDefault() {
    this.defaultPrevented = true;
  }
}

test('IT-FE-01: Table j/k Keyboard Navigation Engine', () => {
  const rows = [
    { id: 'job-1', title: 'Senior PM' },
    { id: 'job-2', title: 'Lead PM' },
    { id: 'job-3', title: 'Staff PM' }
  ];

  let selectedIndex = 0;
  const setSelectedIndex = (action: number | ((prev: number) => number)) => {
    if (typeof action === 'function') {
      selectedIndex = action(selectedIndex);
    } else {
      selectedIndex = action;
    }
  };

  let openedDrawerId: string | null = null;
  let skippedId: string | null = null;
  let chosenId: string | null = null;

  const getProps = () => ({
    rows,
    selectedIndex,
    setSelectedIndex,
    onOpenDrawer: (id: string) => { openedDrawerId = id; },
    onSkipRole: (id: string) => { skippedId = id; },
    onChooseRole: (id: string) => { chosenId = id; }
  });

  // 1. Initial State
  assert.strictEqual(selectedIndex, 0);

  // 2. Press 'j' -> Move Down
  handleTableKeyDown(new MockKeyboardEvent('keydown', { key: 'j' }) as any, getProps());
  assert.strictEqual(selectedIndex, 1, 'j must advance selectedIndex from 0 to 1');

  // 3. Press 'j' -> Move Down again
  handleTableKeyDown(new MockKeyboardEvent('keydown', { key: 'j' }) as any, getProps());
  assert.strictEqual(selectedIndex, 2, 'j must advance selectedIndex from 1 to 2');

  // 4. Press 'j' at boundary -> Clamped to totalRows - 1
  handleTableKeyDown(new MockKeyboardEvent('keydown', { key: 'j' }) as any, getProps());
  assert.strictEqual(selectedIndex, 2, 'j must not exceed last index (boundary clamped)');

  // 5. Press 'k' -> Move Up
  handleTableKeyDown(new MockKeyboardEvent('keydown', { key: 'k' }) as any, getProps());
  assert.strictEqual(selectedIndex, 1, 'k must decrement selectedIndex from 2 to 1');

  // 6. Press 'k' -> Move Up again
  handleTableKeyDown(new MockKeyboardEvent('keydown', { key: 'k' }) as any, getProps());
  assert.strictEqual(selectedIndex, 0, 'k must decrement selectedIndex from 1 to 0');

  // 7. Press 'k' at top boundary -> Clamped to 0
  handleTableKeyDown(new MockKeyboardEvent('keydown', { key: 'k' }) as any, getProps());
  assert.strictEqual(selectedIndex, 0, 'k must not decrement below 0');

  // 8. Press 'Enter' -> Open Drawer
  handleTableKeyDown(new MockKeyboardEvent('keydown', { key: 'Enter' }) as any, getProps());
  assert.strictEqual(openedDrawerId, 'job-1', 'Enter must trigger onOpenDrawer for active row');

  // 9. Press 'c' -> Choose Role
  handleTableKeyDown(new MockKeyboardEvent('keydown', { key: 'c' }) as any, getProps());
  assert.strictEqual(chosenId, 'job-1', 'c must trigger onChooseRole for active row');
});

test('IT-FE-02: Role Skip (s) with Boundary Clamping', () => {
  const rows = [
    { id: 'job-1' },
    { id: 'job-2' },
    { id: 'job-3' }
  ];

  let selectedIndex = 2; // At final row (N - 1 = 2)
  const setSelectedIndex = (action: number | ((prev: number) => number)) => {
    if (typeof action === 'function') {
      selectedIndex = action(selectedIndex);
    } else {
      selectedIndex = action;
    }
  };

  let skippedId: string | null = null;

  const props = {
    rows,
    selectedIndex,
    setSelectedIndex,
    onOpenDrawer: () => {},
    onSkipRole: (id: string) => { skippedId = id; },
    onChooseRole: () => {}
  };

  // Skip the final row
  handleTableKeyDown(new MockKeyboardEvent('keydown', { key: 's' }) as any, props);
  assert.strictEqual(skippedId, 'job-3');
  // Clamped to new final row index: Math.min(2, Math.max(0, 3 - 2)) = 1
  assert.strictEqual(selectedIndex, 1, 's on final row must clamp selectedIndex to new boundary (N-2 = 1)');
});

test('IT-FE-01: Modifier Key Collision Prevention (Cmd+C / Cmd+S safety)', () => {
  const rows = [{ id: 'job-1' }, { id: 'job-2' }];
  let skippedCalled = false;
  let chosenCalled = false;

  const props = {
    rows,
    selectedIndex: 0,
    setSelectedIndex: () => {},
    onOpenDrawer: () => {},
    onSkipRole: () => { skippedCalled = true; },
    onChooseRole: () => { chosenCalled = true; }
  };

  // Cmd+C (Copy) must not trigger 'c' (Choose Role)
  handleTableKeyDown(new MockKeyboardEvent('keydown', { key: 'c', metaKey: true }) as any, props);
  assert.strictEqual(chosenCalled, false, 'Cmd+C must not trigger choose role');

  // Ctrl+S (Save) must not trigger 's' (Skip Role)
  handleTableKeyDown(new MockKeyboardEvent('keydown', { key: 's', ctrlKey: true }) as any, props);
  assert.strictEqual(skippedCalled, false, 'Ctrl+S must not trigger skip role');
});

test('IT-FE-01: Escape Priority Stack Hierarchy', () => {
  let modalClosed = false;
  let drawerClosed = false;
  let selectedIndex = 2;

  const props = {
    rows: [{ id: '1' }, { id: '2' }],
    selectedIndex,
    setSelectedIndex: (idx: any) => { selectedIndex = typeof idx === 'function' ? idx(selectedIndex) : idx; },
    onOpenDrawer: () => {},
    onSkipRole: () => {},
    onChooseRole: () => {},
    isModalOpen: true,
    onCloseModal: () => { modalClosed = true; },
    isDrawerOpen: true,
    onCloseDrawer: () => { drawerClosed = true; }
  };

  handleTableKeyDown(new MockKeyboardEvent('keydown', { key: 'Escape' }) as any, props);
  assert.strictEqual(modalClosed, true, 'Escape must prioritize closing open modal first');
  assert.strictEqual(drawerClosed, false, 'Underlying drawer must remain open when modal is dismissed');
});
