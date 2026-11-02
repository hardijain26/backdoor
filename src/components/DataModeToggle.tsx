'use client';

import React, { useState, useEffect } from 'react';
import {
  DataMode,
  getDataMode,
  setDataMode,
  DATA_MODE_STORAGE_KEY,
} from '@/engine/data-mode';

export function useDataMode() {
  const [mode, setModeState] = useState<DataMode>('live');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setModeState(getDataMode());

    const handleModeChange = (e: Event) => {
      const customEvent = e as CustomEvent<DataMode>;
      if (customEvent.detail === 'live' || customEvent.detail === 'demo') {
        setModeState(customEvent.detail);
      } else {
        setModeState(getDataMode());
      }
    };

    window.addEventListener('backdoor-data-mode-change', handleModeChange);
    window.addEventListener('storage', handleModeChange);
    return () => {
      window.removeEventListener('backdoor-data-mode-change', handleModeChange);
      window.removeEventListener('storage', handleModeChange);
    };
  }, []);

  const toggleMode = () => {
    const next = mode === 'demo' ? 'live' : 'demo';
    setDataMode(next);
    setModeState(next);
  };

  return {
    mode,
    isLive: mode === 'live',
    isDemo: mode === 'demo',
    toggleMode,
    setMode: (m: DataMode) => {
      setDataMode(m);
      setModeState(m);
    },
    mounted,
  };
}

export function DataModeToggle({ compact = false }: { compact?: boolean }) {
  const { mode, isLive, toggleMode, mounted } = useDataMode();

  if (!mounted) {
    return (
      <div className="h-7 w-24 rounded-md bg-white/5 border border-white/10 animate-pulse" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleMode}
      title={
        isLive
          ? 'Live Mode Active: Displaying your real ingested opportunities. Click to switch to Demo Mode.'
          : 'Demo Mode Active: Displaying pre-seeded showcase data. Click to switch to clean Live Mode.'
      }
      aria-label="Toggle between Demo Showcase and Live Testing Mode"
      className={`px-2.5 py-1 rounded-md text-xs font-mono font-medium transition-all flex items-center gap-1.5 shadow-sm border ${
        isLive
          ? 'bg-emerald-500/15 border-emerald-500/35 text-emerald-400 hover:bg-emerald-500/25'
          : 'bg-[#2563EB]/15 border-[#2563EB]/35 text-[#38BDF8] hover:bg-[#2563EB]/25'
      }`}
    >
      <span
        className={`w-2 h-2 rounded-full ${
          isLive ? 'bg-emerald-400 animate-pulse' : 'bg-[#38BDF8]'
        }`}
      />
      <span>{isLive ? 'Live Mode' : 'Demo Data'}</span>
      {!compact && (
        <span className="text-[10px] text-slate-400 hidden xl:inline">
          {isLive ? '(Clean Slate)' : '(Showcase)'}
        </span>
      )}
    </button>
  );
}

export default DataModeToggle;
