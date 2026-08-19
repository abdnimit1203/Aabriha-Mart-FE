"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Category } from "@/types/catalog";
import { buildCategoryTree, collectIds, findNode, CategoryTreeNode } from "@/lib/categoryTree";
import { ChevronIcon } from "@/components/icons";

function TreeNode({
  node,
  selected,
  onToggle,
  depth,
}: {
  node: CategoryTreeNode;
  selected: Set<string>;
  onToggle: (node: CategoryTreeNode, checked: boolean) => void;
  depth: number;
}) {
  const ids = collectIds(node);
  const checkedCount = ids.filter((id) => selected.has(id)).length;
  const checked = checkedCount === ids.length;
  const indeterminate = checkedCount > 0 && !checked;
  // Collapsed by default — expands automatically if something inside this
  // branch is already selected (e.g. landing directly on a subcategory page).
  const [expanded, setExpanded] = useState(checkedCount > 0);
  const checkboxRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (checkboxRef.current) checkboxRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <div style={{ marginLeft: depth * 14 }}>
      <div className="flex items-center gap-2 py-1.5">
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
          type="checkbox"
          checked={checked}
          onChange={(e) => onToggle(node, e.target.checked)}
          className="h-4 w-4 shrink-0 rounded border-border accent-primary-strong"
        />
        <Link href={`/categories/${node.slug}`} className="truncate text-sm hover:text-primary-strong">
          {node.name}
        </Link>
      </div>
      {node.children.length > 0 && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeNode key={child._id} node={child} selected={selected} onToggle={onToggle} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategorySidebar({
  categories,
  defaultSelectedId,
}: {
  categories: Category[];
  /** Used only while the URL has no explicit `category` param — e.g. a
   * category page's own id, so its checkboxes read as checked on first
   * load without forcing a query-param redirect for a clean URL. */
  defaultSelectedId?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tree = buildCategoryTree(categories);

  const categoryParam = searchParams.get("category");
  const defaultNode = defaultSelectedId ? findNode(tree, defaultSelectedId) : undefined;

  function computeFromUrl() {
    return categoryParam ? new Set(categoryParam.split(",").filter(Boolean)) : new Set(defaultNode ? collectIds(defaultNode) : []);
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
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
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

  return (
    <nav aria-label="Categories" className="text-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Categories</p>
        {selected.size > 0 && (
          <button type="button" onClick={clear} className="text-xs text-primary-strong hover:underline">
            Clear
          </button>
        )}
      </div>
      <div className="mt-3">
        {tree.map((node) => (
          <TreeNode key={node._id} node={node} selected={selected} onToggle={toggle} depth={0} />
        ))}
      </div>
    </nav>
  );
}
