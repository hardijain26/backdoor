'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DossierJobData } from '../dossier/DossierDrawer';

interface UniversalIngestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobIngested: (job: DossierJobData) => void;
}

type IngestMode = 'url' | 'text' | 'manual';

export function UniversalIngestModal({
  isOpen,
  onClose,
  onJobIngested
}: UniversalIngestModalProps) {
  const [mode, setMode] = useState<IngestMode>('url');
  const [url, setUrl] = useState('');
  const [rawText, setRawText] = useState('');
  const [track, setTrack] = useState('Senior / Staff PM');

  // Manual fields
  const [manualCompany, setManualCompany] = useState('');
  const [manualTitle, setManualTitle] = useState('');
  const [manualLocation, setManualLocation] = useState('Remote (US)');
  const [manualSalary, setManualSalary] = useState('$180,000 - $220,000');
  const [manualDescription, setManualDescription] = useState('');

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resultMessage, setResultMessage] = useState<string | null>(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const urlInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      setResultMessage(null);
      setIsDuplicate(false);
      setTimeout(() => {
        if (mode === 'url' && urlInputRef.current) {
          urlInputRef.current.focus();
        }
      }, 50);
    }
  }, [isOpen, mode]);

  // Esc keyboard handler for modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setResultMessage(null);
    setIsLoading(true);

    try {
      setLoadingStep('Validating SSRF safety (Rule R6)...');
      await new Promise((r) => setTimeout(r, 200));

      setLoadingStep('Extracting job description & requirements...');
      await new Promise((r) => setTimeout(r, 300));

      setLoadingStep('Checking canonical deduplication & calculating scores...');

      const payload = {
        mode,
        url: mode === 'url' ? url.trim() : undefined,
        rawText: mode === 'text' ? rawText.trim() : undefined,
        manual:
          mode === 'manual'
            ? {
                company: manualCompany.trim(),
                title: manualTitle.trim(),
                location: manualLocation.trim(),
                salary: manualSalary.trim(),
                description: manualDescription.trim()
              }
            : undefined,
        track
      };

      const res = await fetch('/api/ingest/universal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Ingestion failed');
      }

      setIsDuplicate(data.isDuplicate);
      setResultMessage(data.message);

      // Brief visual confirmation before opening drawer
      setTimeout(() => {
        setIsLoading(false);
        onClose();
        if (data.job) {
          onJobIngested(data.job);
        }
      }, 700);
    } catch (err: unknown) {
      setIsLoading(false);
      setErrorMessage(err instanceof Error ? err.message : 'Failed to ingest role.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-label="Universal Ingest Modal"
    >
      <div className="w-full max-w-xl bg-[#0F1523] border border-white/12 rounded-xl shadow-2xl text-[#F8FAFC] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-[#161F33]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#2563EB]">
                Universal Ingest Engine
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-white/10 text-slate-300">
                Shift + I
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-0.5">
              Ingest & Evaluate Opportunity
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-white/10 bg-[#080B11]/50 px-5 gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMode('url')}
            className={`py-2.5 px-3 font-medium border-b-2 -mb-px transition-colors ${
              mode === 'url'
                ? 'border-[#2563EB] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            URL Auto-Scrape
          </button>
          <button
            type="button"
            onClick={() => setMode('text')}
            className={`py-2.5 px-3 font-medium border-b-2 -mb-px transition-colors ${
              mode === 'text'
                ? 'border-[#2563EB] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Raw Text / Message
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`py-2.5 px-3 font-medium border-b-2 -mb-px transition-colors ${
              mode === 'manual'
                ? 'border-[#2563EB] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Manual Entry
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Target Track */}
          <div>
            <label className="block font-medium text-slate-300 mb-1.5">
              Target Candidate Track
            </label>
            <select
              value={track}
              onChange={(e) => setTrack(e.target.value)}
              className="w-full p-2.5 rounded bg-[#161F33] border border-white/10 text-white focus:outline-none focus:border-[#2563EB]"
            >
              <option value="Senior / Staff PM">Senior / Staff PM (Platform & SaaS)</option>
              <option value="AI Product Lead">AI Product Lead (GenAI & LLM Infra)</option>
              <option value="Founding PM">Founding PM (0-to-1 Venture)</option>
              <option value="Technical Product Manager">Technical Product Manager (DevTools)</option>
            </select>
          </div>

          {/* Mode 1: URL Input */}
          {mode === 'url' && (
            <div>
              <label className="block font-medium text-slate-300 mb-1.5">
                Job Posting URL (Greenhouse, Lever, Ashby, or Direct ATS)
              </label>
              <input
                ref={urlInputRef}
                type="url"
                required
                placeholder="https://boards.greenhouse.io/company/jobs/12345"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2.5 rounded bg-[#161F33] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Automatically parses JSON-LD metadata, runs SSRF security inspection, and computes Tier 1 & 2 scores.
              </p>
            </div>
          )}

          {/* Mode 2: Raw Text */}
          {mode === 'text' && (
            <div>
              <label className="block font-medium text-slate-300 mb-1.5">
                Paste Slack, Twitter, or Email Job Snippet
              </label>
              <textarea
                required
                rows={5}
                placeholder="We're hiring a Senior PM at Acme Corp! Remote (US), $180k-$210k. Lead our core data platform..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                className="w-full p-2.5 rounded bg-[#161F33] border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB] resize-none"
              />
            </div>
          )}

          {/* Mode 3: Manual Entry */}
          {mode === 'manual' && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    placeholder="Acme Corp"
                    value={manualCompany}
                    onChange={(e) => setManualCompany(e.target.value)}
                    className="w-full p-2 rounded bg-[#161F33] border border-white/10 text-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Job Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="Senior Product Manager"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    className="w-full p-2 rounded bg-[#161F33] border border-white/10 text-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    placeholder="Remote (US)"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    className="w-full p-2 rounded bg-[#161F33] border border-white/10 text-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Salary Range</label>
                  <input
                    type="text"
                    placeholder="$180k - $220k"
                    value={manualSalary}
                    onChange={(e) => setManualSalary(e.target.value)}
                    className="w-full p-2 rounded bg-[#161F33] border border-white/10 text-white focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Short Description</label>
                <textarea
                  rows={3}
                  placeholder="Key responsibilities and roadmap..."
                  value={manualDescription}
                  onChange={(e) => setManualDescription(e.target.value)}
                  className="w-full p-2 rounded bg-[#161F33] border border-white/10 text-white focus:outline-none focus:border-[#2563EB] resize-none"
                />
              </div>
            </div>
          )}

          {/* Feedback & Loading State */}
          {isLoading && (
            <div className="p-3 rounded bg-[#161F33] border border-white/10 flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin shrink-0" />
              <span className="text-slate-300 font-mono text-[11px]">{loadingStep}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {errorMessage}
            </div>
          )}

          {resultMessage && (
            <div
              className={`p-3 rounded border text-xs font-medium flex items-center justify-between ${
                isDuplicate
                  ? 'bg-sky-500/10 border-sky-500/20 text-sky-300'
                  : 'bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]'
              }`}
            >
              <span>{resultMessage}</span>
              <span className="text-[11px] font-mono">Opening Dossier...</span>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-3 py-2 rounded text-slate-400 hover:text-white transition-colors"
            >
              Cancel (Esc)
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 rounded font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 text-white shadow-md transition-colors flex items-center gap-2"
            >
              {isLoading ? 'Ingesting...' : 'Ingest & Open Dossier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
