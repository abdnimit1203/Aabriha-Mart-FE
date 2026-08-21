"use client";

import { useState } from "react";
import { Category } from "@/types/catalog";
import { CategorySidebar } from "@/components/CategorySidebar";
import { useDismissableOverlay } from "@/hooks/useDismissableOverlay";
import { FilterIcon, CloseIcon } from "@/components/icons";

export function CategoryFilterPanel({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useDismissableOverlay<HTMLDivElement>({ open, onDismiss: () => setOpen(false), outsideClick: false });

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-4 flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium sm:hidden"
      >
        <FilterIcon className="h-4 w-4" />
        Filters
      </button>

      <div
        className={`fixed inset-0 z-40 transition-opacity duration-300 sm:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        aria-hidden={!open}
      >
        <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
        <div
          ref={rootRef}
          role="dialog"
          aria-label="Filter by category"
          aria-modal="true"
          className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] overflow-y-auto bg-surface p-4 shadow-xl transition-transform duration-300 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm font-semibold">Filter</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="rounded-full p-1.5 hover:bg-background">
              <CloseIcon className="h-4 w-4" />
            </button>
          </div>
          <CategorySidebar categories={categories} />
        </div>
      </div>

      <div className="hidden sm:block sm:w-56 sm:shrink-0">
        <CategorySidebar categories={categories} />
      </div>
    </>
  );
}
