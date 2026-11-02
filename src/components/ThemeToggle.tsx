'use client';

import React, { useState, useEffect } from 'react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('backdoor-theme') as 'dark' | 'light' | null;
    if (saved === 'dark') {
      setTheme('dark');
      applyTheme('dark');
    } else {
      setTheme('light');
      applyTheme('light');
    }
  }, []);

  const applyTheme = (newTheme: 'dark' | 'light') => {
    const root = document.documentElement;
    if (newTheme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('backdoor-theme', nextTheme);
    applyTheme(nextTheme);
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10" />
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={theme === 'dark' ? 'Switch to Light Theme (Savile Forest Green)' : 'Switch to Dark Theme (Obsidian Dark)'}
      aria-label="Toggle visual theme"
      className="p-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-[#0F1523] hover:bg-[#161F33] text-slate-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono shadow-sm"
    >
      {theme === 'dark' ? (
        <>
          <span className="text-sm">🌿</span>
          <span className="hidden xl:inline text-[11px] text-slate-300">Forest Light</span>
        </>
      ) : (
        <>
          <span className="text-sm">🌙</span>
          <span className="hidden xl:inline text-[11px] text-slate-700">Obsidian Dark</span>
        </>
      )}
    </button>
  );
}

