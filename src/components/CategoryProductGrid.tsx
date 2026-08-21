"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { apiFetch } from "@/lib/api";
import { Product } from "@/types/catalog";

const PAGE_SIZE = 24;

/** Client-side "Load more" over the same /api/products endpoint the server
 * component already used for page 1 — no new backend capability, just a
 * second call for page 2+.
 *
 * `baseQuery` is the complete, faithful query string (category/sort/inStock)
 * — whenever it changes, that's a genuinely new query, and the effect below
 * resyncs `products`/`page` to the fresh `initialProducts`/`total` the
 * server already fetched for it. Without this, React keeps this component's
 * own state alive across the parent's re-render (same position in the tree,
 * same instance), and a `useState(initialProducts)` initializer that only
 * ran once on mount would keep showing whatever was first loaded — category,
 * sort, and search changes would all silently keep the old grid on screen
 * while just the count/heading updated. `epoch` guards the flip side: a
 * "load more" request already in flight when the query changes must not
 * apply its (now-stale, wrong-query) page-2+ results on top of the freshly
 * reset list once it resolves. */
export function CategoryProductGrid({
  initialProducts,
  total,
  baseQuery,
}: {
  initialProducts: Product[];
  total: number;
  /** Query string for category/status/sort/inStock — no page or limit. */
  baseQuery: string;
}) {
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const epoch = useRef(0);

  useEffect(() => {
    epoch.current += 1; // invalidates any in-flight "load more" for the previous query
    // Genuine exception to the "no setState in an effect" rule: this is
    // React's own documented pattern for resetting state when an identifying
    // prop changes (the alternative to a remount-via-key, which was
    // deliberately not used here) — not a sign the effect is unnecessary.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setProducts(initialProducts);
    setPage(1);
    setLoading(false);
    setError(false);
    // Deliberately keyed on baseQuery alone: it's the complete identity of
    // "which products are being shown," so it's the only thing that should
    // reset the grid. initialProducts/total are read fresh from the closure
    // for this same query — they don't need to be separate dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseQuery]);

  const hasMore = products.length < total;

  async function loadMore() {
    const thisEpoch = epoch.current;
    setLoading(true);
    setError(false);
    try {
      const nextPage = page + 1;
      const { products: more } = await apiFetch<{ products: Product[] }>(
        `/api/products?${baseQuery}&page=${nextPage}&limit=${PAGE_SIZE}`
      );
      if (thisEpoch !== epoch.current) return; // the query changed while this was in flight
      setProducts((prev) => [...prev, ...more]);
      setPage(nextPage);
    } catch {
      if (thisEpoch !== epoch.current) return;
      setError(true);
    } finally {
      if (thisEpoch === epoch.current) setLoading(false);
    }
  }

  if (products.length === 0) {
    return <p className="mt-8 text-sm text-muted-foreground">No products found. Try another category or filter.</p>;
  }

  return (
    <>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex flex-col items-center gap-2">
          {error && <p className="text-sm text-danger">Couldn&apos;t load more products.</p>}
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="rounded-full border border-border px-6 py-2.5 text-sm font-medium hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </>
  );
}
