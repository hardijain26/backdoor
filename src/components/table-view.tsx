import React from "react";

export function TableView({ headers, children }: { headers: string[]; children?: React.ReactNode }) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-border-subtle bg-card">
      <table className="w-full text-left text-sm text-slate-200">
        <thead className="border-b border-border-subtle bg-canvas/50 text-xs uppercase text-slate-400">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">{children}</tbody>
      </table>
    </div>
  );
}
