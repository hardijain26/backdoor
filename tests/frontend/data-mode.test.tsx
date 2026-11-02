import React from 'react';
import test from 'node:test';
import assert from 'node:assert';
import { renderToString } from 'react-dom/server';
import { DataModeToggle } from '../../src/components/DataModeToggle';
import {
  getDataMode,
  setDataMode,
  getLiveJobs,
  saveLiveJobs,
  appendLiveJob,
  getLivePipelineJobs,
  saveLivePipelineJobs,
  DATA_MODE_STORAGE_KEY,
  LIVE_JOBS_STORAGE_KEY,
} from '../../src/engine/data-mode';

test('UT-DM-01: Data Mode defaults to live mode in SSR and clean environments', () => {
  // In Node SSR environment (where window is undefined or mock), getDataMode returns 'live'
  const mode = getDataMode();
  assert.strictEqual(mode, 'live', 'Data mode must default to live');
});

test('UT-DM-02: DataModeToggle SSR renders without crashing', () => {
  const html = renderToString(<DataModeToggle />);
  assert.ok(html.length > 0, 'DataModeToggle must render HTML in SSR');
});

test('UT-DM-03: Data mode engine functions handle empty and invalid states gracefully', () => {
  // In SSR (typeof window === 'undefined')
  assert.deepStrictEqual(getLiveJobs(), []);
  assert.deepStrictEqual(getLivePipelineJobs(), []);

  // Calling setters does not crash in SSR
  assert.doesNotThrow(() => {
    setDataMode('demo');
    setDataMode('live');
    saveLiveJobs([]);
    saveLivePipelineJobs([]);
    appendLiveJob({ id: 'test-1', title: 'Staff PM' } as any);
  });
});

