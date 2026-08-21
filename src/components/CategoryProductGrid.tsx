"use client";

import { useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { apiFetch } from "@/lib/api";
import { Product } from "@/types/catalog";

const PAGE_SIZE = 24;

/** Client-side "Load more" over the same /api/products endpoint the server
 * component already used for page 1 — no new backend capability, just a
 * second call for page 2+. A sort/filter change re-runs the server
 * component fresh (new page 1), which naturally resets this. */
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

  const hasMore = products.length < total;

  async function loadMore() {
    setLoading(true);
    setError(false);
    try {
      const nextPage = page + 1;
      const { products: more } = await apiFetch<{ products: Product[] }>(
        `/api/products?${baseQuery}&page=${nextPage}&limit=${PAGE_SIZE}`
      );
      setProducts((prev) => [...prev, ...more]);
      setPage(nextPage);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
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
