import React from "react";

export type DoorType = "door1" | "door2" | "door3";

export function DoorChip({ door }: { door: DoorType }) {
  const labels: Record<DoorType, string> = {
    door1: "Door 1: Decision Maker",
    door2: "Door 2: Gatekeeper",
    door3: "Door 3: Peer Ally",
  };
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border border-border-elevated bg-drawer text-slate-200">
      {labels[door]}
    </span>
  );
}
