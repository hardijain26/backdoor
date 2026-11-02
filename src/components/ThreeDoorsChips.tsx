import React from 'react';

export interface ThreeDoorsChipsProps {
  door1?: { name: string; title?: string; verified?: boolean };
  door2?: { name: string; title?: string };
  door3?: { name: string; title?: string };
}

/**
 * Backdoor Segmented Indicator Chips (Runbook §3.6)
 * Rendered on Bento Cards and table rows to provide instant Door telemetry.
 */
export function ThreeDoorsChips({ door1, door2, door3 }: ThreeDoorsChipsProps) {
  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap" aria-label="Backdoor Pathway Contacts">
      {/* Pathway 1: Hiring Manager / Founder */}
      {door1 ? (
        <span
          title="🛤️ Pathway 1: Hiring Manager / Founder"
          className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#161F33] text-teal-400 border border-teal-500/20 flex items-center gap-1"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span>
          P1: {door1.title || 'Founder'}
        </span>
      ) : (
        <span
          title="🛤️ Pathway 1: Not Found"
          className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#161F33]/60 text-slate-500 border border-white/5"
        >
          P1: None
        </span>
      )}

      {/* Pathway 2: Recruiter */}
      {door2 ? (
        <span
          title="🛤️ Pathway 2: Recruiter / Talent Lead"
          className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#161F33] text-slate-300 border border-white/10"
        >
          P2: {door2.title || 'Recruiter'}
        </span>
      ) : (
        <span
          title="🛤️ Pathway 2: Not Found"
          className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#161F33]/60 text-slate-500 border border-white/5"
        >
          P2: None
        </span>
      )}

      {/* Pathway 3: Peer / Team */}
      {door3 ? (
        <span
          title="🛤️ Pathway 3: Peer Ally / Staff PM"
          className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#161F33] text-slate-400 border border-white/5"
        >
          P3: {door3.title || 'Peer'}
        </span>
      ) : (
        <span
          title="🛤️ Pathway 3: Not Found"
          className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-[#161F33]/60 text-slate-500 border border-white/5"
        >
          P3: None
        </span>
      )}
    </div>
  );
}

