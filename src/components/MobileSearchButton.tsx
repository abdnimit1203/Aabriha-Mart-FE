"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { SearchIcon, CloseIcon } from "@/components/icons";
import { useDismissableOverlay } from "@/hooks/useDismissableOverlay";

/** Universal search entry point (mobile and desktop alike) — a compact icon
 * that expands into a full-width search bar over the header, auto-focused
 * and ready to type into, closing on submit/Escape/backdrop. Desktop used to
 * have its own permanently-visible inline search box instead; this replaced
 * it so both breakpoints share one icon-first pattern rather than two
 * different search UIs. */
export function MobileSearchButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const rootRef = useDismissableOverlay<HTMLFormElement>({ open, onDismiss: () => setOpen(false) });

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    return () => cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    setOpen(false);
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className="rounded-full p-2 hover:bg-background sm:p-2.5"
      >
        <SearchIcon className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute inset-0 bg-black/40"
            />
            <motion.form
              ref={rootRef}
              onSubmit={handleSubmit}
              role="search"
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative flex items-center gap-2 border-b border-border bg-surface px-4 py-3 shadow-lg"
            >
              <SearchIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              {/* type="text" (not "search") so no browser renders its own
                 native clear icon here — inputMode keeps the mobile
                 keyboard's "search"-labeled enter key without that. Our own
                 "Clear" button below is the only clear affordance. */}
              <input
                ref={inputRef}
                type="text"
                inputMode="search"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
              {query.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    inputRef.current?.focus();
                  }}
                  className="shrink-0 rounded-full px-2 py-1 text-xs font-medium text-primary-strong hover:underline"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close search"
                className="shrink-0 rounded-full p-1.5 text-muted-foreground hover:bg-background"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </motion.form>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
