'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { CadenceCard } from '@/components/outreach/CadenceCard';
import {
  CadenceItem,
  CadenceSwimlane,
  OutreachDoor,
} from '@/engine/cadence-lifecycle';

const SWIMLANE_CONFIG: {
  key: CadenceSwimlane;
  title: string;
  badgeColor: string;
  dotColor: string;
}[] = [
  {
    key: 'DRAFT_READY',
    title: 'Draft Ready in Gmail',
    badgeColor: 'bg-[#2563EB]/15 text-[#38BDF8] border-[#2563EB]/30',
    dotColor: 'bg-[#38BDF8]',
  },
  {
    key: 'SENT',
    title: 'Sent (Awaiting Reply)',
    badgeColor: 'bg-white/5 text-slate-300 border-white/10',
    dotColor: 'bg-slate-400',
  },
  {
    key: 'FOLLOW_UP_DUE',
    title: 'Follow-Up Due (Day 3/5)',
    badgeColor: 'bg-[#0284C7]/15 text-[#38BDF8] border-[#0284C7]/30',
    dotColor: 'bg-[#0284C7]',
  },
  {
    key: 'IN_CONVERSATION',
    title: 'In Conversation',
    badgeColor: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
    dotColor: 'bg-[#10B981]',
  },
  {
    key: 'CLOSED',
    title: 'Bounced / Archived',
    badgeColor: 'bg-white/5 text-slate-400 border-white/5',
    dotColor: 'bg-slate-500',
  },
];

export default function OutreachPage() {
  const [swimlanes, setSwimlanes] = useState<Record<CadenceSwimlane, CadenceItem[]>>({
    DRAFT_READY: [],
    SENT: [],
    FOLLOW_UP_DUE: [],
    IN_CONVERSATION: [],
    CLOSED: [],
  });

  const [metrics, setMetrics] = useState({
    totalActive: 0,
    inConversation: 0,
    followUpsDue: 0,
    draftsReady: 0,
    closed: 0,
    quotaUsedToday: 0,
    quotaRemainingToday: 40,
    quotaCap: 40,
  });

  const [doorFilter, setDoorFilter] = useState<'ALL' | OutreachDoor>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchBoard = async () => {
    try {
      const res = await fetch('/api/cadence/board');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setSwimlanes(data.swimlanes);
          setMetrics(data.metrics);
        }
      }
    } catch (err) {
      console.error('Failed to load cadence board:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  const handleTransition = async (
    cadenceId: string,
    action: 'MARK_SENT' | 'ADVANCE_FOLLOW_UP' | 'INBOUND_REPLY' | 'REPLIED_LINKEDIN' | 'CANCEL' | 'BOUNCE'
  ) => {
    try {
      const res = await fetch('/api/cadence/transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cadenceId, action }),
      });
      if (res.ok) {
        await fetchBoard();
      }
    } catch (err) {
      console.error('Failed to transition cadence:', err);
    }
  };

  // Filter cards per lane by door and search
  const filteredSwimlanes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const result: Record<CadenceSwimlane, CadenceItem[]> = {
      DRAFT_READY: [],
      SENT: [],
      FOLLOW_UP_DUE: [],
      IN_CONVERSATION: [],
      CLOSED: [],
    };

    for (const key of Object.keys(swimlanes) as CadenceSwimlane[]) {
      result[key] = (swimlanes[key] || []).filter((item) => {
        const matchesDoor = doorFilter === 'ALL' || item.door === doorFilter;
        const matchesQuery =
          !q ||
          item.company.toLowerCase().includes(q) ||
          item.contactName.toLowerCase().includes(q) ||
          item.jobTitle.toLowerCase().includes(q);
        return matchesDoor && matchesQuery;
      });
    }

    return result;
  }, [swimlanes, doorFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#080B11] text-[#F8FAFC] p-6 lg:p-8 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-[#F8FAFC]">
              Outreach &amp; Cadence Board
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#2563EB]/15 text-[#38BDF8] border border-[#2563EB]/30">
              Module 7 Lifecycle Engine
            </span>
          </div>
          <p className="text-sm text-[#94A3B8] mt-1">
            Autonomous multi-channel touchpoint watcher across Door 1 (Execs), Door 2 (Recruiters), and Door 3 (Peers).
          </p>
        </div>

        {/* Search & Door Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-[#0F1523] border border-white/10 rounded-md px-3 py-1.5 text-xs text-[#F8FAFC] placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
          />

          <div className="inline-flex bg-[#0F1523] border border-white/10 rounded-md p-0.5 text-xs">
            {(
              [
                { id: 'ALL', label: 'All Doors' },
                { id: 'door1', label: 'Door 1: Execs' },
                { id: 'door2', label: 'Door 2: Recruiters' },
                { id: 'door3', label: 'Door 3: Peers' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setDoorFilter(tab.id)}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${
                  doorFilter === tab.id
                    ? 'bg-[#2563EB] text-white'
                    : 'text-[#94A3B8] hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-[#0F1523] border border-white/8 rounded-lg p-3">
          <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
            Active Campaigns
          </span>
          <span className="text-xl font-bold font-mono text-white mt-1 block">
            {metrics.totalActive}
          </span>
        </div>
        <div className="bg-[#0F1523] border border-white/8 rounded-lg p-3">
          <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
            In Conversation
          </span>
          <span className="text-xl font-bold font-mono text-[#10B981] mt-1 block">
            {metrics.inConversation}
          </span>
        </div>
        <div className="bg-[#0F1523] border border-white/8 rounded-lg p-3">
          <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
            Follow-Ups Due
          </span>
          <span className="text-xl font-bold font-mono text-[#38BDF8] mt-1 block">
            {metrics.followUpsDue}
          </span>
        </div>
        <div className="bg-[#0F1523] border border-white/8 rounded-lg p-3">
          <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
            Drafts Ready
          </span>
          <span className="text-xl font-bold font-mono text-white mt-1 block">
            {metrics.draftsReady}
          </span>
        </div>
        <div className="bg-[#0F1523] border border-white/8 rounded-lg p-3">
          <span className="text-slate-400 block text-[11px] uppercase tracking-wider">
            24h Quota (Rule R8)
          </span>
          <span className="text-xl font-bold font-mono text-[#38BDF8] mt-1 block">
            {metrics.quotaRemainingToday} / {metrics.quotaCap}
          </span>
        </div>
      </div>

      {/* Safety Policy Guard Banner (Rule R1) */}
      <div className="p-3 rounded-lg bg-[#0F1523] border border-white/8 mb-6 flex items-center justify-between flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-semibold text-white">
            Cardinal Rule R1 Invariant: 100% Human Dispatch
          </span>
          <span className="text-slate-400 hidden sm:inline">
            &bull; Zero automated send endpoints. All messages staged in Gmail for candidate review.
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
          <span>Thread Watcher: Active</span>
          <span className="text-[#10B981]">● Auto-Halt on Reply</span>
        </div>
      </div>

      {/* 5-Column Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-start">
        {SWIMLANE_CONFIG.map((col) => {
          const cards = filteredSwimlanes[col.key] || [];
          return (
            <div
              key={col.key}
              className="bg-[#080B11]/50 border border-white/5 rounded-xl p-3 flex flex-col gap-3 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`}></span>
                  <span className="text-xs font-semibold text-white tracking-tight">
                    {col.title}
                  </span>
                </div>
                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${col.badgeColor}`}
                >
                  {cards.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3 flex-1">
                {cards.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500 border border-dashed border-white/5 rounded-lg">
                    No campaigns
                  </div>
                ) : (
                  cards.map((item) => (
                    <CadenceCard
                      key={item.id}
                      item={item}
                      onTransition={handleTransition}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
