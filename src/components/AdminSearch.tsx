"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { SearchIcon } from "@/components/icons";

export interface AdminSearchItem {
  href: string;
  label: string;
  group?: string;
}

// Ctrl+K/Cmd+K page search — deliberately scoped to page names only (not
// products/orders/customers content), per the admin-redesign grilling round
// that settled this. Portaled to <body> with its own admin-shell wrapper for
// the same reason OrderActionsMenu's menu is — it renders outside the admin
// layout's own DOM subtree, so it needs its own copy of the scoped token
// override to pick up the admin color palette.
export function AdminSearch({
  items,
  open,
  onClose,
}: {
  items: AdminSearchItem[];
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset query/activeIndex when `open` flips true, and activeIndex whenever
  // the query itself changes — both adjusted during render (React's
  // recommended pattern for "derived state resets when a prop/value
  // changes") rather than via an effect, since neither is a side effect on
  // an external system.
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setQuery("");
      setActiveIndex(0);
    }
  }
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    setActiveIndex(0);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => item.label.toLowerCase().includes(q));
  }, [items, query]);

  // Focusing the input is a genuine imperative side effect (not a setState
  // reset), so this one legitimately belongs in an effect.
  useEffect(() => {
    if (!open) return;
    const raf = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(raf);
  }, [open]);

  function navigate(item: AdminSearchItem) {
    onClose();
    router.push(item.href);
  }

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (event.key === "Enter") {
        event.preventDefault();
        const item = filtered[activeIndex];
        if (item) navigate(item);
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filtered, activeIndex]);

  if (!open) return null;

  return createPortal(
    <div
      className="admin-shell fixed inset-0 z-60 flex items-start justify-center bg-black/40 px-4 pt-24"
      role="dialog"
      aria-modal="true"
      aria-label="Search pages"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-md border border-border bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-2.5">
          <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pages…"
            className="flex-1 bg-transparent text-sm text-foreground outline-none"
          />
          <kbd className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">Esc</kbd>
        </div>

        <div className="max-h-72 overflow-y-auto p-1.5">
          {filtered.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">No pages match &ldquo;{query}&rdquo;</p>
          ) : (
            filtered.map((item, i) => (
              <button
                key={item.href}
                type="button"
                onClick={() => navigate(item)}
                onMouseEnter={() => setActiveIndex(i)}
                className={`flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm ${
                  i === activeIndex ? "bg-primary text-white" : "hover:bg-black/3"
                }`}
              >
                <span>{item.label}</span>
                {item.group && (
                  <span className={`text-xs ${i === activeIndex ? "text-white/70" : "text-muted-foreground"}`}>
                    {item.group}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
