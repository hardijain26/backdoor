/**
 * Backdoor Data Mode Management (Demo Showcase vs. Live Testing)
 * Governs whether the UI presents pre-seeded demo records or clean live data.
 */

export type DataMode = 'demo' | 'live';

export const DATA_MODE_STORAGE_KEY = 'backdoor-data-mode';
export const LIVE_JOBS_STORAGE_KEY = 'backdoor-live-jobs';
export const LIVE_PIPELINE_STORAGE_KEY = 'backdoor-live-pipeline';

/**
 * Returns current data mode. Default is 'live' for real job hunting and testing,
 * or 'demo' when toggled by the user to showcase pre-seeded roles.
 */
export function getDataMode(): DataMode {
  if (typeof window === 'undefined') {
    return 'live';
  }
  const saved = localStorage.getItem(DATA_MODE_STORAGE_KEY);
  if (saved === 'live' || saved === 'demo') {
    return saved;
  }
  return 'live';
}

/**
 * Persists data mode and notifies all listeners in the window.
 */
export function setDataMode(mode: DataMode): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(DATA_MODE_STORAGE_KEY, mode);
  window.dispatchEvent(new CustomEvent('backdoor-data-mode-change', { detail: mode }));
}

/**
 * Retrieves persisted live jobs ingested via Universal Ingest, Clipper, or Bulk Upload.
 */
export function getLiveJobs<T = any>(): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LIVE_JOBS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves live ingested jobs to localStorage and dispatches change event.
 */
export function saveLiveJobs<T = any>(jobs: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LIVE_JOBS_STORAGE_KEY, JSON.stringify(jobs));
    window.dispatchEvent(new CustomEvent('backdoor-live-jobs-change', { detail: jobs }));
  } catch (err) {
    console.error('Failed to save live jobs:', err);
  }
}

/**
 * Appends a new job to live jobs store.
 */
export function appendLiveJob<T extends { id: string }>(job: T): T[] {
  const current = getLiveJobs<T>();
  const filtered = current.filter((j) => j.id !== job.id);
  const updated = [job, ...filtered];
  saveLiveJobs(updated);
  return updated;
}

/**
 * Retrieves live opportunity pipeline jobs.
 */
export function getLivePipelineJobs<T = any>(): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LIVE_PIPELINE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves live pipeline jobs.
 */
export function saveLivePipelineJobs<T = any>(jobs: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LIVE_PIPELINE_STORAGE_KEY, JSON.stringify(jobs));
    window.dispatchEvent(new CustomEvent('backdoor-live-pipeline-change', { detail: jobs }));
  } catch (err) {
    console.error('Failed to save live pipeline:', err);
  }
}
