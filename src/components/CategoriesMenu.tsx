"use client";

import { useState } from "react";
import Link from "next/link";
import { Category } from "@/types/catalog";
import { useDismissableOverlay } from "@/hooks/useDismissableOverlay";

export function CategoriesMenu({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useDismissableOverlay<HTMLDivElement>({ open, onDismiss: () => setOpen(false) });

  if (categories.length === 0) return null;

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full px-3 py-2 text-sm font-medium transition-colors hover:bg-background focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-strong"
      >
        Categories
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 top-full z-20 mt-2 w-56 rounded-2xl border border-border bg-surface p-2 shadow-lg"
        >
          {categories.map((category) => (
            <Link
              key={category._id}
              href={`/categories/${category.slug}`}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-xl px-3 py-2 text-sm hover:bg-background"
            >
              {category.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
