'use client';

import React, { useState, useEffect } from 'react';
import {
  getSettingsWorkspace,
  SettingsWorkspaceState,
  ByokKeyItem,
  DynamicTrackConfig,
  POPULAR_REGIONAL_JOB_APIS,
  PopularJobApi,
  searchRegionalJobApis,
} from '@/engine/settings';
import DataModeToggle from '@/components/DataModeToggle';

type SettingsTab = 'profile' | 'sources' | 'negative_filters' | 'tracks' | 'byok' | 'google';

export default function SettingsWorkspace({ initialTab = 'profile' }: { initialTab?: SettingsTab } = {}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);
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

  // Source Fleet Tri-Segmented state (S6-T07)
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [emailCopied, setEmailCopied] = useState(false);
  const [newTwitterHandle, setNewTwitterHandle] = useState('');
  const [newSlackChannel, setNewSlackChannel] = useState('');
  const [newSlackWorkspace, setNewSlackWorkspace] = useState('');

  // Custom ATS & Feed Modal State
  const [showAddAtsModal, setShowAddAtsModal] = useState(false);
  const [customAtsName, setCustomAtsName] = useState('');
  const [customAtsUrl, setCustomAtsUrl] = useState('');
  const [customAtsType, setCustomAtsType] = useState<'REST_API' | 'RSS_FEED' | 'JSON_LD'>('REST_API');
  const [customAtsRole, setCustomAtsRole] = useState<string>('all');
  const [isSavingCustomAts, setIsSavingCustomAts] = useState(false);
  const [customAtsError, setCustomAtsError] = useState<string | null>(null);

  // Platform Category & Dynamic Role Scoping (S6-T08)
  const [platformCategoryFilter, setPlatformCategoryFilter] = useState<'all' | 'remote' | 'startup' | 'product_dynamic' | 'aggregator'>('all');
  const [onlyShowTargetPmRoles, setOnlyShowTargetPmRoles] = useState(true);

  // Regional Job API Directory & Paid Integration State (S6-T08)
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [apiRegionFilter, setApiRegionFilter] = useState('all');
  const [apiRoleFilter, setApiRoleFilter] = useState('all');
  const [selectedApiToIntegrate, setSelectedApiToIntegrate] = useState<PopularJobApi | null>(null);
  const [integrateApiKeyInput, setIntegrateApiKeyInput] = useState('');
  const [integrateApiEndpointInput, setIntegrateApiEndpointInput] = useState('');
  const [isIntegratingApi, setIsIntegratingApi] = useState(false);
  const [integrateApiError, setIntegrateApiError] = useState<string | null>(null);

  // Direct Gmail Alert Ingestion State (S6-T09)
  const [isSyncingGmailAlerts, setIsSyncingGmailAlerts] = useState(false);
  const [gmailSyncResult, setGmailSyncResult] = useState<{ count: number; sources: string[] } | null>(null);

  // Reddit Subreddit Tracker State
  const [newRedditSubreddit, setNewRedditSubreddit] = useState('');

  // Custom Platform Modal State
  const [showAddPlatformModal, setShowAddPlatformModal] = useState(false);
  const [customPlatformName, setCustomPlatformName] = useState('');
  const [customPlatformUrl, setCustomPlatformUrl] = useState('');
  const [customPlatformCategory, setCustomPlatformCategory] = useState<'remote' | 'startup' | 'product_dynamic' | 'aggregator'>('remote');
  const [customPlatformType, setCustomPlatformType] = useState<'REST_API' | 'RSS_FEED' | 'JSON_LD'>('REST_API');
  const [customPlatformRole, setCustomPlatformRole] = useState<string>('all');
  const [isSavingCustomPlatform, setIsSavingCustomPlatform] = useState(false);
  const [customPlatformError, setCustomPlatformError] = useState<string | null>(null);

  // Contribute Open-Source API / GitHub Link Modal State
  const [showContributeApiModal, setShowContributeApiModal] = useState(false);
  const [contribApiName, setContribApiName] = useState('');
  const [contribApiProvider, setContribApiProvider] = useState('');
  const [contribApiDescription, setContribApiDescription] = useState('');
  const [contribApiGithubUrl, setContribApiGithubUrl] = useState('');
  const [contribApiEndpointUrl, setContribApiEndpointUrl] = useState('');
  const [contribApiRegion, setContribApiRegion] = useState('Global Remote');
  const [contribApiRole, setContribApiRole] = useState<'product' | 'engineering' | 'all'>('all');
  const [contribApiTier, setContribApiTier] = useState<'Free / Open Source (GitHub)' | 'Free Tier Available' | 'Paid / BYOK'>('Free / Open Source (GitHub)');
  const [isSavingContribApi, setIsSavingContribApi] = useState(false);
  const [contribApiError, setContribApiError] = useState<string | null>(null);

  // Gmail Filter Guide Toggle
  const [showGmailFilterGuide, setShowGmailFilterGuide] = useState(true);

  // Visual Theme Preference state (Savile Forest Light vs Obsidian Void Dark)
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('backdoor-theme') as 'dark' | 'light' | null;
      if (saved === 'dark') {
        setCurrentTheme('dark');
      } else {
        setCurrentTheme('light');
      }
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as SettingsTab | null;
      if (tabParam && ['profile', 'sources', 'negative_filters', 'tracks', 'byok', 'google'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    }
  }, []);

  const handleSetTheme = (newTheme: 'dark' | 'light') => {
    setCurrentTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('backdoor-theme', newTheme);
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
    }
    setSaveMessage(`Theme changed to ${newTheme === 'light' ? 'Precision Cobalt (Light)' : 'Obsidian Cobalt (Dark)'}.`);
    setTimeout(() => setSaveMessage(null), 3000);
  };

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

  const handleToggleAllAts = async () => {
    const atsSources = state.sources.filter((s) => s.section === 'ATS');
    const allEnabled = atsSources.every((s) => s.enabled);
    const nextEnabled = !allEnabled;

    setState((prev) => ({
      ...prev,
      sources: prev.sources.map((s) => (s.section === 'ATS' ? { ...s, enabled: nextEnabled } : s)),
    }));

    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toggleAllAts: { enabled: nextEnabled } }),
      });
      setSaveMessage(`All Popular ATS systems have been ${nextEnabled ? 'enabled' : 'disabled'}.`);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Failed to toggle all ATS:', err);
    }
  };

  const handleAddTwitterHandle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTwitterHandle.trim()) return;

    const formatted = newTwitterHandle.trim().startsWith('@')
      ? newTwitterHandle.trim()
      : `@${newTwitterHandle.trim()}`;

    if (state.monitoredTwitterHandles.includes(formatted)) {
      setNewTwitterHandle('');
      return;
    }

    const updated = [...state.monitoredTwitterHandles, formatted];
    setState((prev) => ({ ...prev, monitoredTwitterHandles: updated }));
    setNewTwitterHandle('');

    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twitterHandles: updated }),
      });
      setSaveMessage(`Added ${formatted} to monitored Twitter accounts.`);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Failed to add twitter handle:', err);
    }
  };

  const handleRemoveTwitterHandle = async (handleToRemove: string) => {
    const updated = state.monitoredTwitterHandles.filter((h) => h !== handleToRemove);
    setState((prev) => ({ ...prev, monitoredTwitterHandles: updated }));

    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twitterHandles: updated }),
      });
    } catch (err) {
      console.error('Failed to remove twitter handle:', err);
    }
  };

  const handleAddRedditSubreddit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRedditSubreddit.trim()) return;

    const raw = newRedditSubreddit.trim().replace(/^\/?r\//i, '');
    if (!raw) return;
    const formatted = `r/${raw}`;

    if (state.monitoredSubreddits?.includes(formatted)) {
      setNewRedditSubreddit('');
      return;
    }

    const updated = [...(state.monitoredSubreddits || []), formatted];
    setState((prev) => ({ ...prev, monitoredSubreddits: updated }));
    setNewRedditSubreddit('');

    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subreddits: updated }),
      });
      setSaveMessage(`Added ${formatted} to monitored Reddit communities.`);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Failed to add subreddit:', err);
    }
  };

  const handleRemoveRedditSubreddit = async (sub: string) => {
    const updated = (state.monitoredSubreddits || []).filter((s) => s !== sub);
    setState((prev) => ({ ...prev, monitoredSubreddits: updated }));

    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subreddits: updated }),
      });
      setSaveMessage(`Removed ${sub} from monitored communities.`);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Failed to remove subreddit:', err);
    }
  };

  const handleToggleSlackChannel = async (channelId: string, currentEnabled: boolean) => {
    const nextEnabled = !currentEnabled;
    setState((prev) => ({
      ...prev,
      slackCommunityChannels: prev.slackCommunityChannels.map((c) =>
        c.id === channelId ? { ...c, enabled: nextEnabled } : c
      ),
    }));

    try {
      await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slackChannelToggle: { channelId, enabled: nextEnabled },
        }),
      });
    } catch (err) {
      console.error('Failed to toggle slack channel:', err);
    }
  };

  const handleAddSlackChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlackChannel.trim()) return;

    const channelName = newSlackChannel.trim().startsWith('#')
      ? newSlackChannel.trim()
      : `#${newSlackChannel.trim()}`;
    const workspace = newSlackWorkspace.trim() || 'Community Slack';

    const newChannel = {
      name: channelName,
      workspace,
      enabled: true,
    };

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addSlackChannel: newChannel }),
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setState(data.settings);
      }
      setNewSlackChannel('');
      setNewSlackWorkspace('');
      setSaveMessage(`Added ${channelName} (${workspace}) to Slack listeners.`);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Failed to add slack channel:', err);
    }
  };

  const handleAddCustomAts = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomAtsError(null);

    const name = customAtsName.trim();
    const url = customAtsUrl.trim();

    if (!name) {
      setCustomAtsError('Please enter a platform or ATS name.');
      return;
    }
    if (!url) {
      setCustomAtsError('Please enter a valid API or feed URL.');
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setCustomAtsError('URL must begin with http:// or https://');
      return;
    }

    setIsSavingCustomAts(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addCustomAts: {
            name,
            endpointUrl: url,
            feedType: customAtsType,
            applicableRole: customAtsRole,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add custom ATS source.');
      }
      if (data.settings) {
        setState(data.settings);
      }
      setShowAddAtsModal(false);
      setCustomAtsName('');
      setCustomAtsUrl('');
      setCustomAtsType('REST_API');
      setCustomAtsRole('all');
      setSaveMessage(`Successfully added "${name}" to active ATS fleet.`);
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error adding custom ATS source.';
      setCustomAtsError(message);
    } finally {
      setIsSavingCustomAts(false);
    }
  };

  const handleRemoveCustomSource = async (sourceId: string, sourceName: string) => {
    if (!confirm(`Are you sure you want to remove "${sourceName}"?`)) return;

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          removeCustomSource: { sourceId },
        }),
      });
      const data = await res.json();
      if (data.success && data.settings) {
        setState(data.settings);
      }
      setSaveMessage(`Removed "${sourceName}" from sources.`);
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (err) {
      console.error('Failed to remove custom source:', err);
    }
  };

  const handleAddCustomPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomPlatformError(null);

    const name = customPlatformName.trim();
    const url = customPlatformUrl.trim();

    if (!name) {
      setCustomPlatformError('Please enter a platform or board name.');
      return;
    }
    if (!url) {
      setCustomPlatformError('Please enter a valid API or feed URL.');
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setCustomPlatformError('URL must begin with http:// or https://');
      return;
    }

    setIsSavingCustomPlatform(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addCustomPlatform: {
            name,
            endpointUrl: url,
            feedType: customPlatformType,
            applicableRole: customPlatformRole,
            platformCategory: customPlatformCategory,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to add custom platform feed.');
      }
      if (data.settings) {
        setState(data.settings);
      }
      setShowAddPlatformModal(false);
      setCustomPlatformName('');
      setCustomPlatformUrl('');
      setCustomPlatformType('REST_API');
      setCustomPlatformCategory('remote');
      setCustomPlatformRole('all');
      setSaveMessage(`Successfully added "${name}" to active platform feeds.`);
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error adding platform source.';
      setCustomPlatformError(message);
    } finally {
      setIsSavingCustomPlatform(false);
    }
  };

  const handleAddContribApi = async (e: React.FormEvent) => {
    e.preventDefault();
    setContribApiError(null);

    const name = contribApiName.trim();
    const desc = contribApiDescription.trim();

    if (!name) {
      setContribApiError('Please enter an API or project name.');
      return;
    }
    if (!desc) {
      setContribApiError('Please enter a short description.');
      return;
    }

    setIsSavingContribApi(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addMarketplaceApi: {
            name,
            provider: contribApiProvider.trim() || 'Community Contributor',
            description: desc,
            githubUrl: contribApiGithubUrl.trim() || undefined,
            endpointUrl: contribApiEndpointUrl.trim() || undefined,
            regions: [contribApiRegion],
            roleAffinity: [contribApiRole],
            pricingTier: contribApiTier,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to contribute API to marketplace.');
      }
      if (data.settings) {
        setState(data.settings);
      }
      setShowContributeApiModal(false);
      setContribApiName('');
      setContribApiProvider('');
      setContribApiDescription('');
      setContribApiGithubUrl('');
      setContribApiEndpointUrl('');
      setContribApiRegion('Global Remote');
      setContribApiRole('all');
      setContribApiTier('Free / Open Source (GitHub)');
      setSaveMessage(`Successfully added "${name}" to Job API Marketplace.`);
      setTimeout(() => setSaveMessage(null), 3500);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error contributing API.';
      setContribApiError(message);
    } finally {
      setIsSavingContribApi(false);
    }
  };

  const handleIntegratePaidApi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedApiToIntegrate) return;
    if (!integrateApiKeyInput.trim()) {
      setIntegrateApiError(`Please provide a valid API Key for ${selectedApiToIntegrate.name}.`);
      return;
    }

    setIsIntegratingApi(true);
    setIntegrateApiError(null);

    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          integratePaidJobApi: {
            apiId: selectedApiToIntegrate.id,
            apiKey: integrateApiKeyInput.trim(),
            customEndpoint: integrateApiEndpointInput.trim() || undefined,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to integrate API');
      }
      if (data.settings) {
        setState(data.settings);
      }
      setSaveMessage(`Successfully integrated ${selectedApiToIntegrate.name} into your active ingestion fleet.`);
      setSelectedApiToIntegrate(null);
      setIntegrateApiKeyInput('');
      setIntegrateApiEndpointInput('');
      setTimeout(() => setSaveMessage(null), 4000);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to integrate API';
      setIntegrateApiError(message);
    } finally {
      setIsIntegratingApi(false);
    }
  };

  const handleSyncGmailAlerts = async () => {
    setIsSyncingGmailAlerts(true);
    try {
      const res = await fetch('/api/ingest/gmail-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lookbackHours: 24 }),
      });
      const data = await res.json();
      if (data.success) {
        setGmailSyncResult({ count: data.count, sources: data.sources });
        setSaveMessage(`✓ Ingested ${data.count} new roles from LinkedIn & Naukri alert digests.`);
        setTimeout(() => setSaveMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to sync Gmail alerts:', err);
    } finally {
      setIsSyncingGmailAlerts(false);
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
              className={`px-4 py-2.5 rounded-t-lg transition-colors whitespace-nowrap ${activeTab === tab.id
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

            {/* Visual Appearance & Theme Experience Card */}
            <div className="bg-[#0F1523] border border-white/10 rounded-xl p-6 space-y-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-white">Visual Appearance &amp; Executive Theme</h2>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    LIVE TOGGLE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Choose your visual experience. The signature Savile Forest Light theme features an Alabaster Eucalyptus canvas (#F7F9F7) and deep British Racing Forest (#183D2B) accents with zero fluorescent glare (WCAG AAA).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {/* 1. Light Mode: Savile Forest Green (Recommended Sovereign Theme) */}
                <div
                  onClick={() => handleSetTheme('light')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    currentTheme === 'light'
                      ? 'bg-[#161F33] border-[#183D2B] ring-2 ring-[#183D2B]/40 shadow-lg'
                      : 'bg-[#161F33]/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌿</span>
                      <span className="text-sm font-semibold text-white">Savile Forest Light (Default)</span>
                    </div>
                    {currentTheme === 'light' && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#183D2B] text-white">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Crisp white cards on soothing Alabaster Eucalyptus (#F7F9F7) with British Racing Forest accents. Clean, calm, and zero eye fatigue.
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="w-4 h-4 rounded bg-[#F7F9F7] border border-slate-300" title="Canvas #F7F9F7"></span>
                    <span className="w-4 h-4 rounded bg-[#FFFFFF] border border-slate-300" title="Card #FFFFFF"></span>
                    <span className="w-4 h-4 rounded bg-[#183D2B]" title="Accent #183D2B"></span>
                    <span className="w-4 h-4 rounded bg-[#EDF4EF] border border-[#D2E3D8]" title="Pill #EDF4EF"></span>
                    <span className="text-slate-400 ml-1">Forest Light</span>
                  </div>
                </div>

                {/* 2. Dark Mode: Obsidian Void */}
                <div
                  onClick={() => handleSetTheme('dark')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    currentTheme === 'dark'
                      ? 'bg-[#161F33] border-emerald-500/50 ring-2 ring-emerald-500/30 shadow-lg'
                      : 'bg-[#161F33]/40 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🌙</span>
                      <span className="text-sm font-semibold text-white">Obsidian Void (Dark)</span>
                    </div>
                    {currentTheme === 'dark' && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-600 text-white">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Deep void #080B11 canvas with desaturated sage green highlights. Ideal for low-light night-shift triage.
                  </p>
                  <div className="flex items-center gap-2 text-[10px] font-mono">
                    <span className="w-4 h-4 rounded bg-[#080B11] border border-white/20" title="Canvas #080B11"></span>
                    <span className="w-4 h-4 rounded bg-[#0F1523] border border-white/20" title="Card #0F1523"></span>
                    <span className="w-4 h-4 rounded bg-[#3D6E57]" title="Accent #3D6E57"></span>
                    <span className="w-4 h-4 rounded bg-[#8BB49E]" title="Pill #8BB49E"></span>
                    <span className="text-slate-400 ml-1">Obsidian Void</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Platform Operating Data Mode (Live vs Demo Showcase) */}
            <div className="bg-[#0F1523] border border-white/10 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-semibold text-white">Platform Operating Data Mode</h2>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      LIVE DEFAULT
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Toggle between real ingested opportunities (synced directly via Gmail alerts, Universal Ingest, and Web Clipper) and pre-seeded demonstration data.
                  </p>
                </div>
                <div className="shrink-0">
                  <DataModeToggle />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Source Toggles (35) - Tri-Segmented Source Fleet (S6-T07) */}
        {activeTab === 'sources' && (
          <div className="space-y-8">
            {/* Sections 1 (Popular ATS Systems) & 2 (Platform & Community Feeds) temporarily removed */}
            {/* SECTION 3: Public Social, Community & Inbound Messaging Streams */}
            <div className="bg-[#0F1523] border border-white/10 rounded-xl p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-2.5">
                    <h2 className="text-lg font-semibold text-white">3. Public Social, Community & Inbound Messaging Streams</h2>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      Inbound & Webhooks
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct email routing, Indian tech alert webhooks, community Slack channel monitoring, and Twitter / X hiring radar.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 0. Direct Gmail Inbox Ingest Card (S6-T09) */}
                <div className="p-4 bg-[#161F33]/60 border border-emerald-500/30 rounded-xl space-y-3 lg:col-span-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                        ⚡
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white flex items-center gap-2">
                          <span>Direct Gmail Inbox Ingest (LinkedIn &amp; Naukri)</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            READONLY CONNECTED
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">
                          Autonomous ingestion scanning for LinkedIn &amp; Naukri daily alerts via authorized <span className="font-mono text-sky-400">gmail.readonly</span> token for <span className="text-white font-medium">{state.googleOAuth.email || 'hardi.jain@backdoor.ai'}</span>.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleSyncGmailAlerts}
                      disabled={isSyncingGmailAlerts}
                      className="px-4 py-2 bg-[#2563EB] hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center justify-center gap-2 transition-colors shrink-0"
                    >
                      {isSyncingGmailAlerts ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Scanning Inbox...</span>
                        </>
                      ) : (
                        <span>⚡ Sync Inbox Now</span>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10 text-xs">
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                      <span className="text-sky-400">Query 1:</span>
                      <span className="bg-[#080B11] px-2 py-1 rounded border border-white/5 truncate">
                        from:(jobalerts-noreply@linkedin.com) newer_than:1d
                      </span>
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
                      <span className="text-emerald-400">Query 2:</span>
                      <span className="bg-[#080B11] px-2 py-1 rounded border border-white/5 truncate">
                        from:(alerts@naukri.com) newer_than:1d
                      </span>
                    </div>
                  </div>

                  {/* Gmail Filter & Label Setup Guide (Interactive) */}
                  <div className="pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setShowGmailFilterGuide(!showGmailFilterGuide)}
                      className="text-xs font-semibold text-[#38BDF8] hover:text-sky-300 flex items-center gap-1.5 transition-colors"
                    >
                      <span>{showGmailFilterGuide ? '▾' : '▸'}</span>
                      <span>Gmail Setup Guide: Auto-Filter &amp; Label LinkedIn &amp; Naukri Alerts</span>
                    </button>

                    {showGmailFilterGuide && (
                      <div className="mt-2.5 p-3.5 bg-[#080B11] border border-white/10 rounded-lg text-xs space-y-2.5 text-slate-300">
                        <div className="font-medium text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#2563EB]/20 text-[#38BDF8] flex items-center justify-center text-[11px] font-bold">1</span>
                          <span>Create an automated filter in Gmail (30 seconds, no code or forwarding needed):</span>
                        </div>
                        <ol className="list-decimal list-inside space-y-1.5 pl-2 text-slate-400 text-[11px] leading-relaxed">
                          <li>Open Gmail and click the <strong className="text-slate-200">Search options</strong> icon on the right side of the top search bar.</li>
                          <li>In the <strong className="text-slate-200">From</strong> field, paste:
                            <code className="ml-1 px-1.5 py-0.5 bg-[#161F33] text-sky-400 border border-white/10 rounded font-mono select-all">
                              jobalerts-noreply@linkedin.com OR alerts@naukri.com
                            </code>
                          </li>
                          <li>Click <strong className="text-slate-200">Create filter</strong> at the bottom of the search dialog.</li>
                          <li>Check <strong className="text-slate-200">Apply the label</strong> → click Choose label → create new label named <code className="px-1 py-0.5 bg-[#161F33] text-emerald-400 rounded font-mono">Backdoor/Jobs</code>.</li>
                          <li>Check <strong className="text-slate-200">Never send it to Spam</strong> (and optionally <em>Categorize as: Updates</em>).</li>
                          <li>Click <strong className="text-slate-200">Create filter</strong>. Backdoor reads these incoming alerts safely without forwarding codes!</li>
                        </ol>
                        <div className="flex items-center gap-2 pt-1 text-[10px] text-slate-400 font-mono">
                          <span className="text-emerald-400">✓ Security Invariant:</span> Uses strict <code className="text-slate-300">gmail.readonly</code> OAuth scope. Backdoor can never send or delete emails.
                        </div>
                      </div>
                    )}
                  </div>

                  {gmailSyncResult && (
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300 flex items-center justify-between">
                      <span>✓ Ingestion complete: {gmailSyncResult.count} roles ingested across [{gmailSyncResult.sources.join(', ')}].</span>
                      <span className="font-mono text-[10px] text-slate-400">Rule R1 Verified (Zero auto-send)</span>
                    </div>
                  )}
                </div>

                {/* 2. Reddit Job & Hiring Communities Card */}
                <div className="p-4 bg-[#161F33]/40 border border-white/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      <span>🤖 Reddit Job &amp; Hiring Communities</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2563EB]/15 text-[#38BDF8] border border-[#2563EB]/30">
                      {(state.monitoredSubreddits || []).length} Subreddits
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Monitors hiring megathreads, founder calls, and high-signal community posts across curated subreddits.
                  </p>

                  {/* Subreddit Chips */}
                  <div className="bg-[#080B11] border border-white/10 rounded-lg p-3 min-h-[58px] flex items-center gap-2 flex-wrap">
                    {(state.monitoredSubreddits || []).map((sub) => (
                      <span
                        key={sub}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161F33] border border-white/10 text-xs font-mono text-[#38BDF8]"
                      >
                        {sub}
                        <button
                          type="button"
                          onClick={() => handleRemoveRedditSubreddit(sub)}
                          className="text-slate-400 hover:text-rose-400 text-xs leading-none transition-colors"
                          title={`Remove ${sub}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add Subreddit Input Form */}
                  <form onSubmit={handleAddRedditSubreddit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. r/MachineLearning or r/startups"
                      value={newRedditSubreddit}
                      onChange={(e) => setNewRedditSubreddit(e.target.value)}
                      className="flex-1 bg-[#080B11] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
                    >
                      + Add Subreddit
                    </button>
                  </form>
                </div>

                {/* 3. Slack Community Channels Connector */}
                <div className="p-4 bg-[#161F33]/40 border border-white/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      <span>💬 Slack Community Channels</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2563EB]/15 text-[#38BDF8] border border-[#2563EB]/30">
                      {state.slackCommunityChannels.filter((c) => c.enabled).length} Active
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Monitors job channels across invite-only Slack communities using bot event streams and webhook relays.
                  </p>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {state.slackCommunityChannels.map((channel) => (
                      <div
                        key={channel.id}
                        className="bg-[#080B11] border border-white/5 rounded-lg px-3 py-2 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-mono font-semibold text-white">{channel.name}</div>
                          <div className="text-[10px] text-slate-400">{channel.workspace}</div>
                        </div>
                        <button
                          onClick={() => handleToggleSlackChannel(channel.id, channel.enabled)}
                          className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${
                            channel.enabled ? 'bg-[#2563EB]' : 'bg-slate-700'
                          }`}
                        >
                          <span
                            className={`inline-block h-2.5 w-2.5 transform rounded-full bg-white transition-transform ${
                              channel.enabled ? 'translate-x-3.5' : 'translate-x-0.5'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Slack Channel Inline Form */}
                  <form onSubmit={handleAddSlackChannel} className="flex gap-2 pt-1 border-t border-white/5">
                    <input
                      type="text"
                      placeholder="#channel"
                      value={newSlackChannel}
                      onChange={(e) => setNewSlackChannel(e.target.value)}
                      className="w-1/2 bg-[#080B11] border border-white/10 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
                    />
                    <input
                      type="text"
                      placeholder="Workspace Name"
                      value={newSlackWorkspace}
                      onChange={(e) => setNewSlackWorkspace(e.target.value)}
                      className="w-1/2 bg-[#080B11] border border-white/10 rounded px-2.5 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
                    />
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-[#161F33] hover:bg-white/10 border border-white/10 rounded text-xs text-white transition-colors"
                    >
                      + Add
                    </button>
                  </form>
                </div>

                {/* 4. Public Twitter / X Hiring Manager */}
                <div className="p-4 bg-[#161F33]/40 border border-white/5 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      <span>🐦 Public Twitter / X Hiring Feeds</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {state.monitoredTwitterHandles.length} Accounts
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Listens to founder and tech leader hiring tweets matching active target roles and evaluates suitability.
                  </p>

                  {/* Handle Chips */}
                  <div className="bg-[#080B11] border border-white/10 rounded-lg p-3 min-h-[58px] flex items-center gap-2 flex-wrap">
                    {state.monitoredTwitterHandles.map((handle) => (
                      <span
                        key={handle}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#161F33] border border-white/10 text-xs font-mono text-[#38BDF8]"
                      >
                        {handle}
                        <button
                          type="button"
                          onClick={() => handleRemoveTwitterHandle(handle)}
                          className="text-slate-400 hover:text-rose-400 text-xs leading-none transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  {/* Add Handle Input */}
                  <form onSubmit={handleAddTwitterHandle} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. @sama or @levelsio"
                      value={newTwitterHandle}
                      onChange={(e) => setNewTwitterHandle(e.target.value)}
                      className="flex-1 bg-[#080B11] border border-white/10 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
                    />
                    <button
                      type="submit"
                      className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-600 text-white rounded text-xs font-medium transition-colors"
                    >
                      + Add Handle
                    </button>
                  </form>
                </div>
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
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border ${key.status === 'CONFIGURED' || key.status === 'TEST_PASSED'
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
                          className={`text-xs font-mono p-2 rounded border ${testRes.success
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

      {/* ADD CUSTOM ATS / PLATFORM FEED MODAL */}
      {showAddAtsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => {
            setShowAddAtsModal(false);
            setCustomAtsError(null);
          }}
        >
          <div
            className="bg-[#0F1523] border border-white/15 rounded-xl max-w-lg w-full p-6 shadow-2xl relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2563EB]/20 border border-[#2563EB]/40 flex items-center justify-center text-[#38BDF8]">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Add Custom ATS or Platform Feed</h3>
                  <p className="text-xs text-slate-400">Connect a custom public REST API, RSS/Atom feed, or career page JSON-LD.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAddAtsModal(false);
                  setCustomAtsError(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Error Message */}
            {customAtsError && (
              <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300 flex items-start gap-2">
                <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{customAtsError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAddCustomAts} className="space-y-4">
              {/* Source Name */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Platform / Source Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={customAtsName}
                  onChange={(e) => setCustomAtsName(e.target.value)}
                  placeholder="e.g. Acme Corp Careers, Linear Ashby, Tech Jobs RSS"
                  className="w-full px-3 py-2 bg-[#161F33] border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              {/* Feed / Endpoint Type */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Ingestion Format / Protocol <span className="text-rose-400">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'REST_API', label: 'REST API / JSON', desc: 'Job listings JSON endpoint' },
                    { id: 'RSS_FEED', label: 'RSS / XML Feed', desc: 'Public RSS or Atom feed' },
                    { id: 'JSON_LD', label: 'Careers (JSON-LD)', desc: 'Schema.org crawl target' },
                  ].map((fmt) => (
                    <button
                      key={fmt.id}
                      type="button"
                      onClick={() => setCustomAtsType(fmt.id as any)}
                      className={`p-2.5 rounded-lg border text-left transition-colors ${
                        customAtsType === fmt.id
                          ? 'bg-[#2563EB]/15 border-[#2563EB] text-white'
                          : 'bg-[#161F33]/60 border-white/5 text-slate-400 hover:border-white/15'
                      }`}
                    >
                      <div className="text-xs font-medium text-white">{fmt.label}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5 leading-snug">{fmt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Endpoint URL */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Endpoint URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  value={customAtsUrl}
                  onChange={(e) => setCustomAtsUrl(e.target.value)}
                  placeholder={
                    customAtsType === 'RSS_FEED'
                      ? 'https://example.com/jobs/feed.xml'
                      : customAtsType === 'JSON_LD'
                      ? 'https://careers.example.com'
                      : 'https://boards-api.greenhouse.io/v1/boards/{company}/jobs'
                  }
                  className="w-full px-3 py-2 bg-[#161F33] border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 font-mono text-xs focus:outline-none focus:border-[#2563EB]"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                  <span className="text-emerald-400">SSRF-protected (Rule R6):</span> Private RFC-1918 &amp; loopback IPs rejected.
                </p>
              </div>

              {/* Applicable Role */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Applicable Role Track
                </label>
                <select
                  value={customAtsRole}
                  onChange={(e) => setCustomAtsRole(e.target.value)}
                  className="w-full px-3 py-2 bg-[#161F33] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="all">All Role Tracks</option>
                  <option value="product">Product Management</option>
                  <option value="engineering">Engineering</option>
                  <option value="design">Design &amp; UX</option>
                  <option value="legal">Legal &amp; Compliance</option>
                  <option value="finance">Finance &amp; Accounting</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAtsModal(false);
                    setCustomAtsError(null);
                  }}
                  className="px-4 py-2 bg-[#161F33] hover:bg-white/10 border border-white/10 rounded-lg text-xs font-medium text-slate-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCustomAts}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-2 shadow-sm"
                >
                  {isSavingCustomAts ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Validating...</span>
                    </>
                  ) : (
                    <span>Save &amp; Add Source</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INTEGRATE PAID / REGIONAL JOB API MODAL (S6-T08) */}
      {selectedApiToIntegrate && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
          onClick={() => {
            setSelectedApiToIntegrate(null);
            setIntegrateApiError(null);
          }}
        >
          <div
            className="bg-[#0F1523] border border-white/15 rounded-xl max-w-lg w-full p-6 shadow-2xl relative text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
              <div>
                <h3 className="text-base font-semibold text-white">Integrate {selectedApiToIntegrate.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Supply your API credential or token to connect this feed directly into your ingestion pipeline.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApiToIntegrate(null)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            {integrateApiError && (
              <div className="mb-4 p-2.5 bg-rose-500/10 border border-rose-500/30 rounded text-xs text-rose-300">
                {integrateApiError}
              </div>
            )}

            <form onSubmit={handleIntegratePaidApi} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  API Key / Access Token <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  value={integrateApiKeyInput}
                  onChange={(e) => setIntegrateApiKeyInput(e.target.value)}
                  placeholder={`Enter your ${selectedApiToIntegrate.provider} API Key`}
                  className="w-full px-3 py-2 bg-[#161F33] border border-white/10 rounded-lg text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#2563EB]"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Encrypted securely in AES-256 Vault (Rule R6 / R8).
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Custom Endpoint URL (Optional)
                </label>
                <input
                  type="url"
                  value={integrateApiEndpointInput}
                  onChange={(e) => setIntegrateApiEndpointInput(e.target.value)}
                  placeholder={selectedApiToIntegrate.defaultEndpoint || 'https://api.example.com'}
                  className="w-full px-3 py-2 bg-[#161F33] border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setSelectedApiToIntegrate(null)}
                  className="px-4 py-2 bg-[#161F33] hover:bg-white/10 border border-white/10 rounded-lg text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isIntegratingApi}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-xs font-medium flex items-center gap-2"
                >
                  {isIntegratingApi ? 'Saving to Vault...' : 'Save & Enable API Feed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Custom Platform Feed Modal */}
      {showAddPlatformModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowAddPlatformModal(false)}
        >
          <div
            className="w-full max-w-lg bg-[#0F1523] border border-white/10 rounded-xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-semibold text-white">Add Custom Platform or Public API Feed</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Connect any publicly accessible job API, RSS feed, or custom board directly into your morning radar.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddPlatformModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            {customPlatformError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded text-xs text-rose-300">
                {customPlatformError}
              </div>
            )}

            <form onSubmit={handleAddCustomPlatform} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Platform / Feed Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={customPlatformName}
                  onChange={(e) => setCustomPlatformName(e.target.value)}
                  placeholder="e.g. RemoteOK RSS, DevJob.cz, or Custom Workday Feed"
                  className="w-full px-3 py-2 bg-[#161F33] border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Public API / Feed Endpoint URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="url"
                  value={customPlatformUrl}
                  onChange={(e) => setCustomPlatformUrl(e.target.value)}
                  placeholder="https://example.com/api/jobs or https://example.com/feed.xml"
                  className="w-full px-3 py-2 bg-[#161F33] border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#2563EB]"
                  required
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Safe URL validation (Rule R6): Loopback (127.0.0.1) and private RFC-1918 networks are strictly blocked.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Feed Format</label>
                  <select
                    value={customPlatformType}
                    onChange={(e) => setCustomPlatformType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-[#161F33] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="REST_API">REST API (JSON)</option>
                    <option value="RSS_FEED">RSS / Atom Feed (XML)</option>
                    <option value="JSON_LD">JSON-LD / Schema.org</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Category Tab</label>
                  <select
                    value={customPlatformCategory}
                    onChange={(e) => setCustomPlatformCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-[#161F33] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="remote">Remote-First Hubs</option>
                    <option value="startup">Startup Ecosystems</option>
                    <option value="product_dynamic">Product &amp; Dynamic</option>
                    <option value="aggregator">Global Aggregators</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Role Affinity Focus</label>
                <select
                  value={customPlatformRole}
                  onChange={(e) => setCustomPlatformRole(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-[#161F33] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="all">All Tech Disciplines</option>
                  <option value="product">Product Management &amp; Strategy</option>
                  <option value="engineering">Software Engineering &amp; AI</option>
                  <option value="design">Design &amp; Creative</option>
                  <option value="gtm">Growth &amp; GTM</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowAddPlatformModal(false)}
                  className="px-4 py-2 bg-[#161F33] hover:bg-white/10 border border-white/10 rounded-lg text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingCustomPlatform}
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2"
                >
                  {isSavingCustomPlatform ? 'Adding Feed...' : '+ Add Platform Feed'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contribute Open-Source API / GitHub Link Modal */}
      {showContributeApiModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setShowContributeApiModal(false)}
        >
          <div
            className="w-full max-w-lg bg-[#0F1523] border border-white/10 rounded-xl p-6 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-semibold text-white">Contribute to Job API Marketplace</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Share a free public API, GitHub repository, or curated open-source feed with the Backdoor community.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowContributeApiModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            {contribApiError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 rounded text-xs text-rose-300">
                {contribApiError}
              </div>
            )}

            <form onSubmit={handleAddContribApi} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Feed / API Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={contribApiName}
                    onChange={(e) => setContribApiName(e.target.value)}
                    placeholder="e.g. OpenTech Jobs"
                    className="w-full px-3 py-2 bg-[#161F33] border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Contributor / Author</label>
                  <input
                    type="text"
                    value={contribApiProvider}
                    onChange={(e) => setContribApiProvider(e.target.value)}
                    placeholder="e.g. GitHub Community or your handle"
                    className="w-full px-3 py-2 bg-[#161F33] border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Description <span className="text-rose-400">*</span>
                </label>
                <textarea
                  value={contribApiDescription}
                  onChange={(e) => setContribApiDescription(e.target.value)}
                  placeholder="Summary of what roles and companies this feed covers..."
                  rows={2}
                  className="w-full px-3 py-2 bg-[#161F33] border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  GitHub Repository Link (Optional)
                </label>
                <input
                  type="url"
                  value={contribApiGithubUrl}
                  onChange={(e) => setContribApiGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/project"
                  className="w-full px-3 py-2 bg-[#161F33] border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Direct API / JSON Endpoint URL (Optional)
                </label>
                <input
                  type="url"
                  value={contribApiEndpointUrl}
                  onChange={(e) => setContribApiEndpointUrl(e.target.value)}
                  placeholder="https://raw.githubusercontent.com/.../jobs.json or API endpoint"
                  className="w-full px-3 py-2 bg-[#161F33] border border-white/10 rounded-lg text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Pricing / Access</label>
                  <select
                    value={contribApiTier}
                    onChange={(e) => setContribApiTier(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-[#161F33] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="Free / Open Source (GitHub)">Free / Open Source (GitHub)</option>
                    <option value="Free Tier Available">Free Tier Available</option>
                    <option value="Paid / BYOK">Paid / BYOK</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Target Region</label>
                  <select
                    value={contribApiRegion}
                    onChange={(e) => setContribApiRegion(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-[#161F33] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="Global Remote">Global Remote</option>
                    <option value="India & APAC">India &amp; APAC</option>
                    <option value="North America">North America</option>
                    <option value="Europe / EMEA">Europe / EMEA</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowContributeApiModal(false)}
                  className="px-4 py-2 bg-[#161F33] hover:bg-white/10 border border-white/10 rounded-lg text-xs text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingContribApi}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center gap-2"
                >
                  {isSavingContribApi ? 'Publishing...' : 'Publish to Marketplace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

