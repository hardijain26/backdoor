import { useEffect, useCallback } from "react";

export interface TableKeyboardNavProps {
  rows: Array<{ id: string; stage?: string }>;
  selectedIndex: number;
  setSelectedIndex: (idx: number | ((prev: number) => number)) => void;
  onOpenDrawer: (rowId: string) => void;
  onSkipRole: (rowId: string) => void;
  onChooseRole: (rowId: string) => void;
  isModalOpen?: boolean;
  onCloseModal?: () => void;
  isDrawerOpen?: boolean;
  onCloseDrawer?: () => void;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

/**
 * Pure keyboard event processor (Runbook §3.5)
 * Dispatches navigation and triage actions with modifier key collision prevention,
 * input suppression, and escape priority hierarchy.
 */
export function handleTableKeyDown(e: KeyboardEvent, {
  rows,
  selectedIndex,
  setSelectedIndex,
  onOpenDrawer,
  onSkipRole,
  onChooseRole,
  isModalOpen = false,
  onCloseModal,
  isDrawerOpen = false,
  onCloseDrawer,
  searchInputRef,
}: TableKeyboardNavProps) {
  // 1. MODIFIER KEY GUARD (Runbook §3.5.2)
  if (e.metaKey || e.ctrlKey || e.altKey) {
    return;
  }

  // 2. INPUT SUPPRESSION:
  const target = e.target as HTMLElement | null;
  const isInputFocused =
    target &&
    (target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable);

  // 3. ESCAPE PRIORITY STACK: Modal -> Drawer -> Search Input -> Clear Selection
  if (e.key === "Escape") {
    e.preventDefault();
    if (isModalOpen && onCloseModal) {
      onCloseModal();
      return;
    }
    if (isDrawerOpen && onCloseDrawer) {
      onCloseDrawer();
      return;
    }
    if (isInputFocused) {
      target?.blur();
      if (searchInputRef?.current) {
        searchInputRef.current.value = "";
      }
      return;
    }
    setSelectedIndex(0);
    return;
  }

  if (isInputFocused) {
    return;
  }

  const totalRows = rows.length;
  if (totalRows === 0) return;

  switch (e.key) {
    case "j": // Down / Next Row
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(totalRows - 1, prev + 1));
      break;

    case "k": // Up / Previous Row
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(0, prev - 1));
      break;

    case "Enter": // Open Dossier Drawer
      e.preventDefault();
      if (rows[selectedIndex]) {
        onOpenDrawer(rows[selectedIndex].id);
      }
      break;

    case "s": // Skip Role with Boundary Clamping (Runbook §3.5.2)
      e.preventDefault();
      if (rows[selectedIndex]) {
        const skippedId = rows[selectedIndex].id;
        onSkipRole(skippedId);
        setSelectedIndex((prev) =>
          Math.min(prev, Math.max(0, totalRows - 2))
        );
      }
      break;

    case "c": // Choose Role
      e.preventDefault();
      if (rows[selectedIndex]) {
        onChooseRole(rows[selectedIndex].id);
      }
      break;

    case "/": // Focus Global Search
      e.preventDefault();
      if (searchInputRef?.current) {
        searchInputRef.current.focus();
        searchInputRef.current.select();
      }
      break;

    default:
      break;
  }
}

/**
 * Centered Keyboard Navigation Hook (Runbook §3.5)
 */
export function useTableKeyboardNav(props: TableKeyboardNavProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      handleTableKeyDown(e, props);
    },
    [props]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
