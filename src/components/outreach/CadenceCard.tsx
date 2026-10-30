'use client';

import React, { useState } from 'react';
import { CadenceItem } from '@/engine/cadence-lifecycle';

interface CadenceCardProps {
  item: CadenceItem;
  onTransition: (
    cadenceId: string,
    action: 'MARK_SENT' | 'ADVANCE_FOLLOW_UP' | 'INBOUND_REPLY' | 'REPLIED_LINKEDIN' | 'CANCEL' | 'BOUNCE'
  ) => Promise<void>;
}

export function CadenceCard({ item, onTransition }: CadenceCardProps) {
  const [copiedNote, setCopiedNote] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleCopyNote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.linkedInNote);
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2000);
    } catch {
      // Fallback
      setCopiedNote(true);
      setTimeout(() => setCopiedNote(false), 2000);
    }
  };

  const handleAction = async (
    action: 'MARK_SENT' | 'ADVANCE_FOLLOW_UP' | 'INBOUND_REPLY' | 'REPLIED_LINKEDIN' | 'CANCEL' | 'BOUNCE'
  ) => {
    setIsUpdating(true);
    try {
      await onTransition(item.id, action);
    } finally {
      setIsUpdating(false);
    }
  };

  const doorConfig = {
    door1: {
      label: 'Door 1: Decision Maker',
      color: 'bg-[#2563EB]/15 text-[#38BDF8] border-[#2563EB]/30',
    },
    door2: {
      label: 'Door 2: Recruiter',
      color: 'bg-[#0284C7]/15 text-[#38BDF8] border-[#0284C7]/30',
    },
    door3: {
      label: 'Door 3: Peer / Ally',
      color: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
    },
  }[item.door];

  return (
    <div className="bg-[#0F1523] border border-white/10 hover:border-white/20 rounded-lg p-4 space-y-3 transition-all duration-150 shadow-sm">
      {/* Top Bar: Door Chip & Step Number */}
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${doorConfig.color}`}
        >
          {doorConfig.label}
        </span>
        <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
          Step {item.stepNumber}/3
        </span>
      </div>

      {/* Role & Company */}
      <div>
        <h4 className="text-sm font-semibold text-[#F8FAFC] tracking-tight line-clamp-1">
          {item.company}
        </h4>
        <p className="text-xs text-slate-300 line-clamp-1 mt-0.5">
          {item.jobTitle}
        </p>
      </div>

      {/* Target Contact */}
      <div className="p-2.5 rounded bg-[#161F33] border border-white/5 text-xs space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-white">{item.contactName}</span>
          <span className="text-[10px] font-mono text-[#10B981] bg-[#10B981]/10 px-1.5 py-0.5 rounded border border-[#10B981]/20">
            Verified
          </span>
        </div>
        <p className="text-[11px] text-slate-400 line-clamp-1">
          {item.contactTitle}
        </p>
      </div>

      {/* Dispatch Window Telemetry Badge */}
      <div className="text-[11px] text-slate-300 bg-white/5 p-2 rounded border border-white/5 flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 truncate">
          <span className="text-slate-400">⏰</span>
          <span className="font-mono text-[11px] text-[#38BDF8] truncate">
            {item.primaryDispatchWindow}
          </span>
        </div>
      </div>

      {/* Status Note (e.g. Inbound reply / milestone) */}
      {item.lastEventNote && (
        <p className="text-[10px] font-mono text-slate-400 bg-[#080B11]/60 px-2 py-1 rounded border border-white/5 line-clamp-2">
          {item.lastEventNote}
        </p>
      )}

      {/* Primary Actions: Open Gmail & Copy LinkedIn Note */}
      <div className="pt-2 border-t border-white/5 space-y-2">
        <div className="flex items-center gap-2">
          <a
            href={item.gmailDeepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center text-xs py-1.5 rounded-md font-semibold bg-[#2563EB] hover:bg-[#1D4ED8] text-white transition-colors shadow-sm"
          >
            Open in Gmail Web &rarr;
          </a>
          <button
            type="button"
            onClick={handleCopyNote}
            className="px-2.5 py-1.5 rounded-md text-xs font-medium bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 transition-colors"
            title="Copy LinkedIn connection note (<= 300 chars)"
          >
            {copiedNote ? '✓ Copied' : 'LinkedIn Note'}
          </button>
        </div>

        {/* State Machine Transition Controls */}
        <div className="flex items-center justify-between gap-1 pt-1 text-[11px]">
          {item.swimlane === 'DRAFT_READY' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleAction('MARK_SENT')}
              className="text-[#10B981] hover:text-emerald-300 font-semibold transition-colors disabled:opacity-50"
            >
              ✓ Mark as Sent
            </button>
          )}

          {item.swimlane === 'SENT' && (
            <>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleAction('INBOUND_REPLY')}
                className="text-[#10B981] hover:text-emerald-300 font-medium transition-colors disabled:opacity-50"
              >
                💬 Mark Replied
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleAction('ADVANCE_FOLLOW_UP')}
                className="text-slate-400 hover:text-slate-200 transition-colors disabled:opacity-50"
              >
                Due Day 3 &rarr;
              </button>
            </>
          )}

          {item.swimlane === 'FOLLOW_UP_DUE' && (
            <>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleAction('MARK_SENT')}
                className="text-[#10B981] hover:text-emerald-300 font-medium transition-colors disabled:opacity-50"
              >
                ✓ Follow-Up Sent
              </button>
              <button
                type="button"
                disabled={isUpdating}
                onClick={() => handleAction('INBOUND_REPLY')}
                className="text-[#38BDF8] hover:text-sky-300 transition-colors disabled:opacity-50"
              >
                💬 Replied
              </button>
            </>
          )}

          {item.swimlane === 'IN_CONVERSATION' && (
            <span className="text-[#10B981] font-semibold flex items-center gap-1 font-mono text-[10px]">
              <span>●</span> Interview Cadence Active
            </span>
          )}

          {item.swimlane !== 'CLOSED' && (
            <button
              type="button"
              disabled={isUpdating}
              onClick={() => handleAction('CANCEL')}
              className="text-slate-500 hover:text-rose-400 transition-colors ml-auto text-[10px]"
            >
              Archive
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

