'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import {
  InterviewRoundRecord,
  InterviewsWorkspaceState,
  getInterviewsWorkspaceState,
} from '@/engine/interviews-workspace';

export default function InterviewsPage() {
  const [workspace, setWorkspace] = useState<InterviewsWorkspaceState>(getInterviewsWorkspaceState);
  const [selectedInterviewId, setSelectedInterviewId] = useState<string>('int-anthropic-hm-01');
  const [transcriptFilter, setTranscriptFilter] = useState('');
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState(false);
  const [isStagingDraft, setIsStagingDraft] = useState(false);
  const [filterCompany, setFilterCompany] = useState<string>('ALL');

  useEffect(() => {
    fetch('/api/interviews')
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.interviews)) {
          setWorkspace(data);
          if (data.interviews.length > 0) {
            setSelectedInterviewId(data.interviews[0].id);
          }
        }
      })
      .catch(() => {
        // Fallback to local synchronous engine for offline/test environments
        const local = getInterviewsWorkspaceState();
        setWorkspace(local);
      });
  }, []);

  const activeInterview: InterviewRoundRecord | undefined = workspace?.interviews.find(
    (i) => i.id === selectedInterviewId
  ) || workspace?.interviews[0];

  const handleToggleActionItem = async (interviewId: string, actionItemId: string) => {
    if (!workspace) return;

    // Optimistic UI update
    const updatedInterviews = workspace.interviews.map((interview) => {
      if (interview.id !== interviewId) return interview;

      const updatedMy = interview.myActionItems.map((item) =>
        item.id === actionItemId ? { ...item, isCompleted: !item.isCompleted } : item
      );
      const updatedTheir = interview.theirActionItems.map((item) =>
        item.id === actionItemId ? { ...item, isCompleted: !item.isCompleted } : item
      );

      return {
        ...interview,
        myActionItems: updatedMy,
        theirActionItems: updatedTheir,
      };
    });

    // Recompute open action count
    let openCount = 0;
    for (const interview of updatedInterviews) {
      for (const item of interview.myActionItems) if (!item.isCompleted) openCount++;
      for (const item of interview.theirActionItems) if (!item.isCompleted) openCount++;
    }

    setWorkspace({
      ...workspace,
      openActionItems: openCount,
      interviews: updatedInterviews,
    });

    try {
      await fetch(`/api/interviews/${interviewId}/actions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionItemId }),
      });
    } catch {
      // Offline fallback already updated in state
    }
  };

  const handleStageThankYou = async (interviewId: string) => {
    if (!workspace) return;
    setIsStagingDraft(true);

    try {
      const res = await fetch(`/api/interviews/${interviewId}/actions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'STAGE_THANK_YOU' }),
      });
      const data = await res.json();

      if (data.success) {
        setWorkspace({
          ...workspace,
          interviews: workspace.interviews.map((i) =>
            i.id === interviewId
              ? {
                  ...i,
                  thankYouDraftStaged: true,
                  thankYouDraftSubject: data.draftSubject,
                  thankYouDraftBody: data.draftBody,
                }
              : i
          ),
        });
      }
    } catch {
      // Local optimistic update
      setWorkspace({
        ...workspace,
        interviews: workspace.interviews.map((i) =>
          i.id === interviewId ? { ...i, thankYouDraftStaged: true } : i
        ),
      });
    } finally {
      setIsStagingDraft(false);
    }
  };

  const companies = Array.from(new Set(workspace?.interviews.map((i) => i.company) || []));
  const filteredInterviews =
    workspace?.interviews.filter((i) => filterCompany === 'ALL' || i.company === filterCompany) || [];

  return (
    <div className="min-h-screen bg-[#080B11] text-[#F8FAFC]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header & Subtitle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2.5">
              <span>Interview Notes &amp; Debrief Workspace</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-[#2563EB]/20 text-[#38BDF8] border border-[#2563EB]/40">
                Audio Intelligence Active
              </span>
            </h1>
            <p className="text-xs text-[#94A3B8] mt-1">
              Structured round logs, verbatim Groq Whisper transcripts, and synchronized action items.
            </p>
          </div>

          {/* Quick Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Filter Company:</span>
            <select
              value={filterCompany}
              onChange={(e) => setFilterCompany(e.target.value)}
              className="bg-[#0F1523] border border-white/10 text-xs rounded-lg px-2.5 py-1.5 text-white focus:outline-none focus:border-[#2563EB]"
            >
              <option value="ALL">All Companies ({workspace?.totalInterviews || 0})</option>
              {companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Workspace Metrics Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[#0F1523] border border-white/8">
            <span className="text-xs text-[#94A3B8] block mb-1">Total Interview Rounds</span>
            <span className="text-xl font-bold font-mono text-white">{workspace?.totalInterviews ?? 3}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0F1523] border border-white/8">
            <span className="text-xs text-[#94A3B8] block mb-1">Completed Rounds</span>
            <span className="text-xl font-bold font-mono text-[#10B981]">{workspace?.completedRounds ?? 2}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0F1523] border border-white/8">
            <span className="text-xs text-[#94A3B8] block mb-1">Open Action Items</span>
            <span className="text-xl font-bold font-mono text-[#38BDF8]">{workspace?.openActionItems ?? 3}</span>
          </div>
          <div className="p-3.5 rounded-xl bg-[#0F1523] border border-white/8">
            <span className="text-xs text-[#94A3B8] block mb-1">Upcoming Rounds</span>
            <span className="text-xl font-bold font-mono text-white">{workspace?.upcomingRounds ?? 1}</span>
          </div>
        </div>

        {/* Main Workspace 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interview Timeline List (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8] px-1">
              Interview Rounds ({filteredInterviews.length})
            </h2>

            <div className="space-y-2.5">
              {filteredInterviews.map((interview) => {
                const isSelected = interview.id === selectedInterviewId;
                const openCount = interview.myActionItems.filter((a) => !a.isCompleted).length;

                return (
                  <button
                    key={interview.id}
                    onClick={() => setSelectedInterviewId(interview.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-[#161F33] border-[#2563EB] shadow-lg'
                        : 'bg-[#0F1523] border-white/8 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-white text-sm">{interview.company}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                          interview.status === 'COMPLETED'
                            ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/30'
                            : 'bg-[#2563EB]/20 text-[#38BDF8] border border-[#2563EB]/30'
                        }`}
                      >
                        {interview.roundType.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-medium truncate mb-2">{interview.roleTitle}</div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>{interview.interviewerNames.join(', ')}</span>
                      {openCount > 0 ? (
                        <span className="text-sky-400 font-mono font-semibold">{openCount} to-do</span>
                      ) : (
                        <span className="text-[#10B981] font-mono">All done &check;</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Debrief & Action Items Workspace (8 cols) */}
          {activeInterview && (
            <div className="lg:col-span-8 space-y-5">
              {/* Active Card Header */}
              <div className="p-5 rounded-xl bg-[#0F1523] border border-white/10 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-white">{activeInterview.company}</h2>
                      <span className="text-xs font-mono text-slate-400">&bull; {activeInterview.durationMinutes} mins</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30">
                        {activeInterview.overallSentiment.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300">
                      {activeInterview.roleTitle} &bull; Interlocutor: {activeInterview.interviewerNames.join(', ')} (
                      {activeInterview.interviewerTitles.join(', ')})
                    </div>
                  </div>

                  {/* Thank You Note Staging Button */}
                  <div>
                    {activeInterview.thankYouDraftStaged ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40">
                        <span>&check; Thank-You Staged in Gmail</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleStageThankYou(activeInterview.id)}
                        disabled={isStagingDraft}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#2563EB] hover:bg-blue-600 text-white transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        <span>{isStagingDraft ? 'Staging Draft...' : 'Stage Thank-You Note'}</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Executive Summary */}
                <div className="p-3.5 rounded-lg bg-[#080B11] border border-white/8 text-xs text-slate-200 leading-relaxed">
                  <span className="font-semibold text-[#38BDF8] block mb-1">AI Executive Debrief:</span>
                  {activeInterview.executiveSummary}
                </div>
              </div>

              {/* ACTION ITEMS CHECKLIST */}
              <div className="p-5 rounded-xl bg-[#0F1523] border border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                    My Action Items &amp; Commitments ({activeInterview.myActionItems.length})
                  </h3>
                  <span className="text-[11px] text-slate-400">Click checkbox to complete</span>
                </div>

                <div className="space-y-2.5">
                  {activeInterview.myActionItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleActionItem(activeInterview.id, item.id)}
                      className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                        item.isCompleted
                          ? 'bg-[#080B11]/50 border-white/5 opacity-60'
                          : 'bg-[#161F33] border-white/10 hover:border-sky-800'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={item.isCompleted}
                        onChange={() => {}}
                        className="mt-0.5 rounded border-white/20 bg-[#080B11] text-[#2563EB] focus:ring-0 cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-xs text-white leading-snug ${
                            item.isCompleted ? 'line-through text-slate-400' : 'font-medium'
                          }`}
                        >
                          {item.description}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
                          {item.dueDate && <span>Due: {item.dueDate}</span>}
                          <span className="text-xs font-mono uppercase px-1.5 py-0.2 rounded bg-sky-950/70 text-sky-400 border border-sky-800/40">
                            {item.category.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Their Action Items */}
                {activeInterview.theirActionItems.length > 0 && (
                  <div className="pt-3 border-t border-white/8 space-y-2">
                    <h4 className="text-xs font-semibold text-slate-300">
                      Interviewer Commitments ({activeInterview.interviewerNames[0] || 'Team'})
                    </h4>
                    <div className="space-y-2">
                      {activeInterview.theirActionItems.map((item) => (
                        <div
                          key={item.id}
                          className="p-3 rounded-lg bg-[#080B11] border border-white/8 flex items-start gap-3 text-xs"
                        >
                          <span className="text-[#38BDF8] font-bold">&bull;</span>
                          <span className="text-slate-200">{item.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* VERBATIM TRANSCRIPT ACCORDION */}
              <div className="p-5 rounded-xl bg-[#0F1523] border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-[#94A3B8]">
                      Verbatim Call Transcript (Groq Whisper)
                    </h3>
                    <span className="text-[11px] text-slate-400">Timestamped audio record</span>
                  </div>
                  <button
                    onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                    className="px-3 py-1 rounded text-xs font-medium bg-[#161F33] hover:bg-slate-800 text-slate-200 transition-colors border border-white/10"
                  >
                    {isTranscriptExpanded ? 'Collapse Transcript' : 'Expand Full Transcript'}
                  </button>
                </div>

                {isTranscriptExpanded && (
                  <div className="space-y-3 pt-2">
                    <input
                      type="text"
                      placeholder="Search within transcript (e.g. latency, vector, pricing)..."
                      value={transcriptFilter}
                      onChange={(e) => setTranscriptFilter(e.target.value)}
                      className="w-full bg-[#080B11] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#2563EB]"
                    />

                    <div className="p-4 rounded-lg bg-[#080B11] border border-white/8 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {activeInterview.verbatimTranscript
                        .split('\n\n')
                        .filter((block) => !transcriptFilter || block.toLowerCase().includes(transcriptFilter.toLowerCase()))
                        .join('\n\n') || 'No matching lines in transcript.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
