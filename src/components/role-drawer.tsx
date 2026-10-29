import React from "react";

export function RoleDrawer({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children?: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-[640px] border-l border-border-elevated bg-drawer p-6 shadow-2xl">
      <button onClick={onClose} className="text-slate-400 hover:text-white mb-4 text-sm">
        Close Drawer &times;
      </button>
      {children}
    </div>
  );
}
