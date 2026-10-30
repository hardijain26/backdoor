'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import {
  getSettingsWorkspace,
  SettingsWorkspaceState,
  ByokKeyItem,
  DynamicTrackConfig,
} from '@/engine/settings';

type SettingsTab = 'profile' | 'sources' | 'negative_filters' | 'tracks' | 'byok' | 'google';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [state, setState] = useState<SettingsWorkspaceState>(getSettingsWorkspace);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  // Profile form state
  const [country, setCountry] = useState(state.profile.country);
  const [stateProvince, setStateProvince] = useState(state.profile.state);

  // BYOK form state
  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({});
  const [showKey, setShowKey] = useState<Record<string, boolean>>({});
  const [testingKeyId, setTestingKeyId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  // Negative filter input states
  const [newCompany, setNewCompany] = useState('');
  const [newTitlePattern, setNewTitlePattern] = useState('');
  const [newIndustry, setNewIndustry] = useState('');

  // Fetch latest settings on mount
  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setState(data.settings);
          setCountry(data.settings.profile.country);
          setStateProvince(data.settings.profile.state);
        }
      })
      .catch((err) => console.error('Failed to load settings:', err));
  }, []);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage(null);

    try {
      const res = await fetch('/api/settings/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country,
          state: stateProvince,
          detectedBrowserTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setState((prev) => ({ ...prev, profile: data.profile }));
        setSaveMessage('Profile timezone preference updated successfully!');
      } else {
        setSaveMessage(`Error: ${data.error}`);
      }
    } catch {
      setSaveMessage('Failed to update profile location.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  const handleToggleSource = async (sourceId: string, currentEnabled: boolean) => {
    const nextEnabled = !currentEnabled;
    // Optimistic update
    setState((prev) => ({
      ...prev,
      sources: prev.sources.map((s) => (s.id === sourceId ? { ...s, enabled: nextEnabled } : s)),
    }));

    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceToggle: { sourceId, enabled: nextEnabled },
        }),
      });
    } catch (err) {
      console.error('Failed to toggle source:', err);
    }
  };

  const handleSaveByokKey = async (keyId: string) => {
    const val = keyInputs[keyId];
    if (val === undefined) return;

    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          byokKey: { id: keyId, value: val },
        }),
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setState(data.settings);
        setKeyInputs((prev) => ({ ...prev, [keyId]: '' }));
        setSaveMessage('Key updated and securely encrypted in AES-256 vault.');
      }
    } catch (err) {
      console.error('Failed to save key:', err);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  const handleTestByokKey = async (keyId: string) => {
    setTestingKeyId(keyId);
    try {
      const res = await fetch('/api/settings/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId }),
      });
      const data = await res.json();
      setTestResults((prev) => ({
        ...prev,
        [keyId]: { success: data.success, message: data.message },
      }));

      // Refresh settings to get updated status
      const ref = await fetch('/api/settings');
      const refData = await ref.json();
      if (refData.success && refData.settings) {
        setState(refData.settings);
      }
    } catch {
      setTestResults((prev) => ({
        ...prev,
        [keyId]: { success: false, message: 'Test execution failed' },
      }));
    } finally {
      setTestingKeyId(null);
    }
  };

  const handleAddExcludedCompany = async () => {
    if (!newCompany.trim()) return;
    const updated = [...state.negativeFilters.excludedCompanies, newCompany.trim()];
    setState((prev) => ({
      ...prev,
      negativeFilters: { ...prev.negativeFilters, excludedCompanies: updated },
    }));
    setNewCompany('');

    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ negativeFilters: { excludedCompanies: updated } }),
    });
  };

  const handleRemoveExcludedCompany = async (co: string) => {
    const updated = state.negativeFilters.excludedCompanies.filter((c) => c !== co);
    setState((prev) => ({
      ...prev,
      negativeFilters: { ...prev.negativeFilters, excludedCompanies: updated },
    }));

    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ negativeFilters: { excludedCompanies: updated } }),
    });
  };

  const handleAddTitlePattern = async () => {
    if (!newTitlePattern.trim()) return;
    const updated = [...state.negativeFilters.excludedTitlePatterns, newTitlePattern.trim()];
    setState((prev) => ({
      ...prev,
      negativeFilters: { ...prev.negativeFilters, excludedTitlePatterns: updated },
    }));
    setNewTitlePattern('');

    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ negativeFilters: { excludedTitlePatterns: updated } }),
    });
  };

  const handleRemoveTitlePattern = async (pat: string) => {
    const updated = state.negativeFilters.excludedTitlePatterns.filter((p) => p !== pat);
    setState((prev) => ({
      ...prev,
      negativeFilters: { ...prev.negativeFilters, excludedTitlePatterns: updated },
    }));

    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ negativeFilters: { excludedTitlePatterns: updated } }),
    });
  };

  const handleAddIndustry = async () => {
    if (!newIndustry.trim()) return;
    const updated = [...state.negativeFilters.blockedIndustries, newIndustry.trim()];
    setState((prev) => ({
      ...prev,
      negativeFilters: { ...prev.negativeFilters, blockedIndustries: updated },
    }));
    setNewIndustry('');

    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ negativeFilters: { blockedIndustries: updated } }),
    });
  };

  const handleRemoveIndustry = async (ind: string) => {
    const updated = state.negativeFilters.blockedIndustries.filter((i) => i !== ind);
    setState((prev) => ({
      ...prev,
      negativeFilters: { ...prev.negativeFilters, blockedIndustries: updated },
    }));

    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ negativeFilters: { blockedIndustries: updated } }),
    });
  };

  const handleUpdateTrackWeight = async (trackId: string, newWeight: number) => {
    const updated = state.dynamicTracks.map((t) =>
      t.id === trackId ? { ...t, weight: newWeight } : t
    );
    setState((prev) => ({ ...prev, dynamicTracks: updated }));

    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dynamicTracks: updated }),
    });
  };

  const handleToggleTrackActive = async (trackId: string) => {
    const updated = state.dynamicTracks.map((t) =>
      t.id === trackId ? { ...t, isActive: !t.isActive } : t
    );
    setState((prev) => ({ ...prev, dynamicTracks: updated }));

    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dynamicTracks: updated }),
    });
  };

  const handleRefreshOAuth = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/oauth/refresh', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.googleOAuth) {
        setState((prev) => ({ ...prev, googleOAuth: data.googleOAuth }));
        setSaveMessage('Google OAuth credentials refreshed.');
      }
    } catch {
      setSaveMessage('Failed to refresh Google OAuth.');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  const totalTrackWeight = state.dynamicTracks.reduce((acc, t) => acc + (t.isActive ? t.weight : 0), 0);

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white">Settings & Vault</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AES-256 Encrypted
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Configure scraping telemetry, negative filters, dynamic track scoring, profile timezone, and BYOK credentials.
            </p>
          </div>

          {/* Quick Status Pill */}
          <div className="flex items-center gap-3">
            <div className="bg-[#0F1523] border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400">Timezone:</span>
              <span className="text-xs font-mono font-semibold text-teal-400">
                {state.profile.timezoneLabel} ({state.profile.resolvedIanaTimezone})
              </span>
            </div>
          </div>
        </div>

        {/* Global Save Alert */}
        {saveMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-xs font-mono flex items-center justify-between">
            <span>✓ {saveMessage}</span>
            <button onClick={() => setSaveMessage(null)} className="text-slate-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1 text-sm font-medium">
          {[
            { id: 'profile', label: 'Candidate Location & Timezone' },
            { id: 'sources', label: 'Source Toggles (35)' },
            { id: 'negative_filters', label: 'Negative Filter Rules' },
            { id: 'tracks', label: 'Dynamic Tracks' },
            { id: 'byok', label: 'BYOK Secrets Vault' },
            { id: 'google', label: 'Google Connection' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`px-4 py-2.5 rounded-t-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-[#161F33] text-white border-b-2 border-[#2563EB] font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: Profile & Timezone */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-[#0F1523] border border-white/10 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-2">Candidate Location & Timezone Preferences</h2>
              <p className="text-xs text-slate-400 mb-6">
                Backdoor uses your home Country and State/Province to resolve your canonical IANA timezone. All outreach draft dispatch windows (Tuesday–Thursday 09:15 AM recipient working hours) are automatically converted into your local timezone display.
              </p>

              <form onSubmit={handleProfileSave} className="space-y-4 max-w-xl">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Country of Residence
                  </label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. India, United States, United Kingdom"
                    className="w-full bg-[#161F33] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#2563EB]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    State / Province / Region
                  </label>
                  <input
                    type="text"
                    value={stateProvince}
                    onChange={(e) => setStateProvince(e.target.value)}
                    placeholder="e.g. Karnataka, California, London, Berlin"
                    className="w-full bg-[#161F33] border border-white/10 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>

                <div className="p-4 bg-[#161F33]/60 border border-white/5 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Resolved IANA Timezone:</span>
                    <span className="font-mono text-teal-400 font-medium">
                      {state.profile.resolvedIanaTimezone}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Display Label:</span>
                    <span className="font-mono text-emerald-400 font-medium">
                      {state.profile.timezoneLabel}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  {saving ? 'Updating...' : 'Save Timezone Preferences'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 2: Source Toggles (1-35) */}
        {activeTab === 'sources' && (
          <div className="space-y-6">
            <div className="bg-[#0F1523] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Ingestion Fleet Switches (35 Sources)</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Toggle individual scrapers on or off. Disabled sources are skipped during Morning Radar runs.
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Active Sources: <span className="text-emerald-400 font-bold">{state.sources.filter((s) => s.enabled).length}</span> / 35
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {state.sources.map((src) => (
                  <div
                    key={src.id}
                    className="p-3 bg-[#161F33]/50 border border-white/5 rounded-lg flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-medium text-white">{src.name}</div>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>{src.category.replace(/_/g, ' ')}</span>
                        {src.requiresKey && (
                          <span className="text-[10px] text-teal-400 bg-teal-500/10 px-1 rounded">
                            BYOK
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggleSource(src.id, src.enabled)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        src.enabled ? 'bg-[#2563EB]' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                          src.enabled ? 'translate-x-4' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Negative Filter Rules */}
        {activeTab === 'negative_filters' && (
          <div className="space-y-6">
            <div className="bg-[#0F1523] border border-white/10 rounded-xl p-6 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-white">Negative Filtering Engine (Runbook §5.2)</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Postings matching any of these criteria are instantly dropped before hitting Morning Radar or database storage.
                </p>
              </div>

              {/* 1. Excluded Companies */}
              <div className="space-y-3">
                <label className="text-xs font-mono uppercase text-slate-400">
                  Excluded Companies ({state.negativeFilters.excludedCompanies.length})
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {state.negativeFilters.excludedCompanies.map((co) => (
                    <span
                      key={co}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161F33] text-xs text-slate-300 border border-white/10"
                    >
                      <span>{co}</span>
                      <button
                        onClick={() => handleRemoveExcludedCompany(co)}
                        className="text-slate-400 hover:text-rose-400 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={newCompany}
                    onChange={(e) => setNewCompany(e.target.value)}
                    placeholder="Add company name..."
                    className="flex-1 bg-[#161F33] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <button
                    onClick={handleAddExcludedCompany}
                    className="px-3 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* 2. Excluded Title Patterns */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="text-xs font-mono uppercase text-slate-400">
                  Excluded Title Patterns ({state.negativeFilters.excludedTitlePatterns.length})
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {state.negativeFilters.excludedTitlePatterns.map((pat) => (
                    <span
                      key={pat}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161F33] text-xs text-slate-300 border border-white/10"
                    >
                      <span>{pat}</span>
                      <button
                        onClick={() => handleRemoveTitlePattern(pat)}
                        className="text-slate-400 hover:text-rose-400 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={newTitlePattern}
                    onChange={(e) => setNewTitlePattern(e.target.value)}
                    placeholder="e.g. intern, scrum master, associate..."
                    className="flex-1 bg-[#161F33] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <button
                    onClick={handleAddTitlePattern}
                    className="px-3 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* 3. Blocked Industries */}
              <div className="space-y-3 pt-4 border-t border-white/5">
                <label className="text-xs font-mono uppercase text-slate-400">
                  Blocked Industries ({state.negativeFilters.blockedIndustries.length})
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {state.negativeFilters.blockedIndustries.map((ind) => (
                    <span
                      key={ind}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-rose-500/10 text-xs text-rose-400 border border-rose-500/20"
                    >
                      <span>{ind}</span>
                      <button
                        onClick={() => handleRemoveIndustry(ind)}
                        className="text-rose-400 hover:text-rose-300 font-bold"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    value={newIndustry}
                    onChange={(e) => setNewIndustry(e.target.value)}
                    placeholder="e.g. gambling, insurance..."
                    className="flex-1 bg-[#161F33] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <button
                    onClick={handleAddIndustry}
                    className="px-3 py-1.5 bg-[#2563EB] text-white rounded-lg text-xs font-medium"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Dynamic Tracks */}
        {activeTab === 'tracks' && (
          <div className="space-y-6">
            <div className="bg-[#0F1523] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Dynamic Candidate Tracks & Scoring Weights</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Adjust the relative weight of candidate tracks to tailor Tier 2 mathematical scoring without migrations.
                  </p>
                </div>
                <div className="text-xs font-mono">
                  Total Active Weight:{' '}
                  <span className={`font-bold ${totalTrackWeight === 100 ? 'text-emerald-400' : 'text-teal-400'}`}>
                    {totalTrackWeight}%
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {state.dynamicTracks.map((track) => (
                  <div
                    key={track.id}
                    className="p-4 bg-[#161F33]/60 border border-white/10 rounded-lg space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={track.isActive}
                          onChange={() => handleToggleTrackActive(track.id)}
                          className="rounded border-slate-700 text-[#2563EB] focus:ring-0"
                        />
                        <span className="font-semibold text-sm text-white">{track.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-400">Weight:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={track.weight}
                          onChange={(e) => handleUpdateTrackWeight(track.id, parseInt(e.target.value) || 0)}
                          className="w-16 bg-[#080B11] border border-white/10 rounded px-2 py-1 text-xs text-right font-mono text-white"
                        />
                        <span className="text-xs font-mono text-slate-400">%</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                      <span className="text-slate-500 font-mono">Titles:</span>
                      {track.targetTitles.map((t) => (
                        <span key={t} className="bg-white/5 px-2 py-0.5 rounded border border-white/5">
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-[11px] text-slate-400">
                      <span className="text-slate-500 font-mono">Skills:</span>
                      {track.skills.map((s) => (
                        <span key={s} className="bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded border border-teal-500/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: BYOK Secrets Vault */}
        {activeTab === 'byok' && (
          <div className="space-y-6">
            <div className="bg-[#0F1523] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">BYOK Secrets Vault (AES-256-GCM)</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Store external API keys with zero cost on Backdoor infrastructure (Rule R3). All keys are encrypted at rest with AES-256-GCM.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {state.byokKeys.map((key) => {
                  const testRes = testResults[key.id];
                  const isTesting = testingKeyId === key.id;

                  return (
                    <div
                      key={key.id}
                      className="p-4 bg-[#161F33]/60 border border-white/10 rounded-lg space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-white">{key.name}</span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                                key.status === 'CONFIGURED' || key.status === 'TEST_PASSED'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : 'bg-slate-700/50 text-slate-400 border-slate-600'
                              }`}
                            >
                              {key.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{key.description}</p>
                        </div>

                        {key.hasKey && (
                          <span className="text-xs font-mono text-slate-400 bg-black/40 px-2.5 py-1 rounded border border-white/5">
                            {key.maskedValue}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showKey[key.id] ? 'text' : 'password'}
                            value={keyInputs[key.id] || ''}
                            onChange={(e) => setKeyInputs((prev) => ({ ...prev, [key.id]: e.target.value }))}
                            placeholder={key.hasKey ? '•••••••••••••••••••••••• (Leave blank to keep current)' : 'Enter API secret...'}
                            className="w-full bg-[#080B11] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white pr-16 focus:outline-none focus:border-[#2563EB]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowKey((prev) => ({ ...prev, [key.id]: !prev[key.id] }))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-400 hover:text-white"
                          >
                            {showKey[key.id] ? 'HIDE' : 'SHOW'}
                          </button>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleSaveByokKey(key.id)}
                            disabled={saving || !keyInputs[key.id]}
                            className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-600 disabled:opacity-40 text-white rounded-lg text-xs font-medium"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => handleTestByokKey(key.id)}
                            disabled={isTesting || !key.hasKey}
                            className="px-3 py-1.5 bg-[#161F33] hover:bg-white/10 disabled:opacity-40 text-slate-200 border border-white/10 rounded-lg text-xs font-mono"
                          >
                            {isTesting ? 'Testing...' : 'Test Key'}
                          </button>
                        </div>
                      </div>

                      {testRes && (
                        <div
                          className={`text-xs font-mono p-2 rounded border ${
                            testRes.success
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {testRes.message}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Google Connection */}
        {activeTab === 'google' && (
          <div className="space-y-6">
            <div className="bg-[#0F1523] border border-white/10 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">Google Workspace OAuth Status</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Managed OAuth token for drafting emails (`gmail.compose`) and staging CV exports (`drive.file`).
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {state.googleOAuth.tokenStatus}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 bg-[#161F33]/50 border border-white/5 rounded-lg space-y-1">
                  <span className="text-xs text-slate-400 font-mono">Connected Email Account</span>
                  <div className="text-sm font-semibold text-white">{state.googleOAuth.email}</div>
                </div>

                <div className="p-4 bg-[#161F33]/50 border border-white/5 rounded-lg space-y-1">
                  <span className="text-xs text-slate-400 font-mono">Token Lifespan Remaining</span>
                  <div className="text-sm font-semibold text-teal-400">
                    {state.googleOAuth.expiresInHours} Hours Active
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <span className="text-xs font-mono uppercase text-slate-400">Granted Scopes (Least Privilege)</span>
                <div className="flex flex-wrap gap-2">
                  {state.googleOAuth.scopes.map((scope) => (
                    <span
                      key={scope}
                      className="px-2.5 py-1 bg-white/5 text-slate-300 rounded text-xs font-mono border border-white/5"
                    >
                      {scope}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Last verified: {new Date(state.googleOAuth.lastRefreshedAt).toLocaleString()}
                </div>
                <button
                  onClick={handleRefreshOAuth}
                  disabled={saving}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium"
                >
                  {saving ? 'Refreshing...' : 'Refresh OAuth Token'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

