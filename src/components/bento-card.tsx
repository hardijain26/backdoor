import React from "react";

export function BentoCard({ title, children }: { title?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border-subtle bg-card p-5">
      {title && <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-2">{title}</h3>}
      {children}
    </div>
  );
}
