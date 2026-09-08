"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Category } from "@/types/catalog";
import { buildCategoryTree, collectIds, CategoryTreeNode } from "@/lib/categoryTree";
import { ChevronIcon } from "@/components/icons";
import { useProductFilterTransition } from "@/context/ProductFilterTransitionContext";

function TreeNode({
  node,
  selected,
  onToggle,
  depth,
  counts,
}: {
  node: CategoryTreeNode;
  selected: Set<string>;
  onToggle: (node: CategoryTreeNode, checked: boolean) => void;
  depth: number;
  counts: Record<string, number>;
}) {
  const ids = collectIds(node);
  const checkedCount = ids.filter((id) => selected.has(id)).length;
  const checked = checkedCount === ids.length;
  const indeterminate = checkedCount > 0 && !checked;
  // Rolled-up total across this node + every descendant — matches
  // "selecting this row" semantics (expandCategorySelection includes
  // children too), not just this exact category's own products.
  const count = ids.reduce((sum, id) => sum + (counts[id] ?? 0), 0);
  // Collapsed by default — expands automatically if something inside this
  // branch is already selected (e.g. arriving via a category link/filter).
  const [expanded, setExpanded] = useState(checkedCount > 0);
  const checkboxRef = useRef<HTMLInputElement>(null);
  const checkboxId = `category-${node._id}`;

  useEffect(() => {
    if (checkboxRef.current) checkboxRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div style={{ marginLeft: depth * 14 }}>
      <div
        className={`flex items-center gap-2 rounded-full px-2.5 py-2 transition-colors ${
          checked ? "bg-primary/10" : "hover:bg-background"
        }`}
      >
        {node.children.length > 0 ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse" : "Expand"}
            aria-expanded={expanded}
            className="shrink-0 text-muted-foreground"
          >
            <ChevronIcon className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        ) : (
          <span className="w-3 shrink-0" />
        )}
        <input
          ref={checkboxRef}
          id={checkboxId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggle(node, e.target.checked)}
          className="h-4 w-4 shrink-0 rounded border-border accent-primary-strong"
        />
        {/* A label, not a link — categories filter this same page now, they
           don't navigate to a separate one, so clicking the name just toggles
           the checkbox like clicking any other form label would. */}
        <label
          htmlFor={checkboxId}
          className={`min-w-0 flex-1 cursor-pointer truncate text-sm ${
            checked ? "font-medium text-primary-strong" : "hover:text-primary-strong"
          }`}
        >
          {node.name}
        </label>
        <span
          className={`shrink-0 rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
            checked ? "bg-primary-strong text-white" : "text-muted-foreground"
          }`}
        >
          {count}
        </span>
      </div>
      {node.children.length > 0 && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child._id} node={child} selected={selected} onToggle={onToggle} depth={depth + 1} counts={counts} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategorySidebar({
  categories,
  counts = {},
}: {
  categories: Category[];
  /** Leaf-level product counts by category id, active products only. Omitted
   * entirely (rather than required) so this component still renders fine
   * before counts have loaded or if that fetch ever fails — every row just
   * shows 0 rather than the whole sidebar disappearing. */
  counts?: Record<string, number>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startFilterTransition } = useProductFilterTransition();
  const tree = buildCategoryTree(categories);

  const categoryParam = searchParams.get("category");

  function computeFromUrl() {
    return new Set(categoryParam ? categoryParam.split(",").filter(Boolean) : []);
  }

  // A checkbox driven purely by searchParams doesn't visually update until
  // the router.push below round-trips through the server (a category page
  // is a Server Component) — over a second of no feedback, easily read as
  // "the click didn't register." Local state flips the checkbox instantly;
  // the URL push still happens right after to actually refetch the grid.
  const [selected, setSelected] = useState<Set<string>>(computeFromUrl);

  // While waiting on our own push, the URL can pass through an intermediate
  // state that doesn't match what we most recently asked for — two toggles
  // close enough together overlap two navigations, and the *older* one's
  // now-stale response can land after the newer one was already sent.
  // (useTransition's isPending was tried here first: it isn't atomically
  // synchronized with useSearchParams()'s value, so it doesn't reliably
  // catch this — a plain "what am I actually waiting for" ref does.)
  // waitingFor is undefined when idle (not waiting on our own push, so any
  // URL change is external — e.g. back/forward nav — and should resync).
  const waitingFor = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (waitingFor.current !== undefined && categoryParam !== waitingFor.current) return; // stale or not yet arrived
    waitingFor.current = undefined;
    setSelected(computeFromUrl());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryParam]);

  // Debounced too: no need to kick off a navigation per click while the
  // user is still clicking through several checkboxes in quick succession.
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function pushSelection(next: Set<string>) {
    setSelected(next);
    const value = next.size > 0 ? [...next].join(",") : null;
    waitingFor.current = value;
    if (pushTimer.current) clearTimeout(pushTimer.current);
    pushTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set("category", value);
      else params.delete("category");
      // Wrapped in a transition purely so ProductListingLayout's shared
      // "pending" flag fades the grid while this resolves — unrelated to
      // the waitingFor/computeFromUrl resync above (isPending was already
      // ruled out for that specific job, see the comment near waitingFor).
      startFilterTransition(() => router.push(`${pathname}?${params.toString()}`, { scroll: false }));
    }, 350);
  }

  function toggle(node: CategoryTreeNode, checked: boolean) {
    const ids = collectIds(node);
    const next = new Set(selected);
    ids.forEach((id) => (checked ? next.add(id) : next.delete(id)));
    pushSelection(next);
  }

  function clear() {
    pushSelection(new Set());
  }

  if (tree.length === 0) return null;

  const totalCount = Object.values(counts).reduce((sum, n) => sum + n, 0);
  const noneSelected = selected.size === 0;

  return (
    <nav aria-label="Categories" className="text-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Product Categories</p>
        {selected.size > 0 && (
          <button type="button" onClick={clear} className="text-xs text-primary-strong hover:underline">
            Clear
          </button>
        )}
      </div>
      <div className="mt-3 space-y-0.5">
        <button
          type="button"
          onClick={clear}
          className={`flex w-full items-center gap-2 rounded-full px-2.5 py-2 text-left text-sm transition-colors ${
            noneSelected ? "bg-primary-strong font-medium text-white" : "hover:bg-background"
          }`}
        >
          <span className="min-w-0 flex-1 truncate">All Products</span>
          <span
            className={`shrink-0 rounded-full px-1.5 py-0.5 text-[11px] tabular-nums ${
              noneSelected ? "bg-white/20" : "text-muted-foreground"
            }`}
          >
            {totalCount}
          </span>
        </button>
        {tree.map((node) => (
          <TreeNode key={node._id} node={node} selected={selected} onToggle={toggle} depth={0} counts={counts} />
        ))}
      </div>
    </nav>
  );
}
