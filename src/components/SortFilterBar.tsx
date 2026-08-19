"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronIcon } from "@/components/icons";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function SortFilterBar({ resultCount }: { resultCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const sort = searchParams.get("sort") ?? "newest";
  const inStock = searchParams.get("inStock") === "true";

  function updateParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <p className="text-sm text-muted-foreground">{resultCount} products</p>
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => updateParam("inStock", e.target.checked ? "true" : null)}
            className="h-4 w-4 rounded border-border accent-primary"
          />
          In stock only
        </label>
        <div className="relative">
          <select
            value={sort}
            onChange={(e) => updateParam("sort", e.target.value === "newest" ? null : e.target.value)}
            className="appearance-none rounded-full border border-border bg-surface py-1.5 pl-3 pr-8 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong"
            aria-label="Sort products"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronIcon className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rotate-90 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}
