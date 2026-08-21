"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { listProductsAdmin, adjustProductStock } from "@/lib/admin/products";
import { Product, Variant } from "@/types/catalog";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { StockBadge } from "@/components/StockBadge";
import { levelForStock, productLevel, totalStock } from "@/lib/stockLevel";
import { ChevronIcon, BoxesIcon } from "@/components/icons";

function StockAdjuster({
  label,
  stock,
  onAdjust,
}: {
  label: string;
  stock: number;
  onAdjust: (delta: number) => Promise<void>;
}) {
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  async function apply(delta: number) {
    if (delta === 0 || Number.isNaN(delta)) return;
    setSaving(true);
    try {
      await onAdjust(delta);
      setValue("");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="w-8 text-right text-sm font-medium tabular-nums">{stock}</span>
      <button
        type="button"
        onClick={() => apply(-1)}
        disabled={saving || stock <= 0}
        aria-label={`Decrease ${label} stock by 1`}
        className="h-6 w-6 rounded-full border border-border text-sm leading-none hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
      >
        −
      </button>
      <button
        type="button"
        onClick={() => apply(1)}
        disabled={saving}
        aria-label={`Increase ${label} stock by 1`}
        className="h-6 w-6 rounded-full border border-border text-sm leading-none hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
      >
        +
      </button>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            apply(Number(value));
          }
        }}
        placeholder="±qty"
        disabled={saving}
        className="w-16 rounded-lg border border-border bg-surface px-2 py-1 text-xs outline-none focus-visible:outline-2 focus-visible:outline-primary-strong disabled:opacity-50"
      />
      <button
        type="button"
        onClick={() => apply(Number(value))}
        disabled={saving || !value.trim() || Number.isNaN(Number(value))}
        className="rounded-full border border-border px-2.5 py-1 text-xs font-medium hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving ? "…" : "Apply"}
      </button>
    </div>
  );
}

function VariantRow({
  product,
  variant,
  onChanged,
}: {
  product: Product;
  variant: Variant;
  onChanged: (updated: Product) => void;
}) {
  const { getIdToken } = useAuth();
  const label = Object.values(variant.attributes ?? {}).filter(Boolean).join(" • ") || variant.sku;

  async function handleAdjust(delta: number) {
    const idToken = await getIdToken();
    if (!idToken) return;
    try {
      const updated = await adjustProductStock(idToken, product._id, { variantId: variant._id, delta });
      toast.success("Stock updated.");
      onChanged(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update stock.");
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 border-t border-border py-2 pl-12 pr-3">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{label}</p>
        <StockBadge level={levelForStock(variant.stock)} />
      </div>
      <StockAdjuster label={label} stock={variant.stock} onAdjust={handleAdjust} />
    </div>
  );
}

function ProductRow({ product, onChanged }: { product: Product; onChanged: (updated: Product) => void }) {
  const { getIdToken } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const hasVariants = product.variants.length > 0;

  async function handleAdjust(delta: number) {
    const idToken = await getIdToken();
    if (!idToken) return;
    try {
      const updated = await adjustProductStock(idToken, product._id, { delta });
      toast.success("Stock updated.");
      onChanged(updated);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't update stock.");
    }
  }

  return (
    <div className="border-b border-border last:border-0">
      <div className="flex items-center gap-3 px-3 py-3">
        {hasVariants ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse variants" : "Expand variants"}
            className="rounded-lg p-1 text-muted-foreground hover:bg-background"
          >
            <ChevronIcon className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        ) : (
          <span className="w-6 shrink-0" />
        )}

        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0].url} alt="" className="h-10 w-10 shrink-0 rounded-lg border border-border object-cover" />
        ) : (
          <div className="h-10 w-10 shrink-0 rounded-lg border border-dashed border-border" />
        )}

        <div className="min-w-0 flex-1">
          <Link href={`/admin/products/${product._id}/edit`} className="truncate text-sm font-medium hover:underline">
            {product.name}
          </Link>
          <div className="mt-0.5 flex items-center gap-2">
            <StockBadge level={productLevel(product)} />
            {hasVariants && (
              <span className="text-xs text-muted-foreground">
                {product.variants.length} variant{product.variants.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {hasVariants ? (
          <span className="w-24 shrink-0 text-right text-sm tabular-nums text-muted-foreground">{totalStock(product)} total</span>
        ) : (
          <StockAdjuster label={product.name} stock={product.stock ?? 0} onAdjust={handleAdjust} />
        )}
      </div>

      {hasVariants && expanded && (
        <div className="pb-1">
          {product.variants.map((variant) => (
            <VariantRow key={variant._id} product={product} variant={variant} onChanged={onChanged} />
          ))}
        </div>
      )}
    </div>
  );
}

const LIMIT = 20;

export default function AdminInventoryPage() {
  const [view, setView] = useState<"needs_attention" | "all">("needs_attention");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [total, setTotal] = useState(0);

  const load = useCallback(() => {
    listProductsAdmin({
      search: search || undefined,
      stockStatus: view === "needs_attention" ? "needs_attention" : undefined,
      page,
      limit: LIMIT,
    })
      .then((res) => {
        setProducts(res.products);
        setTotal(res.total);
      })
      .catch(() => setProducts([]));
  }, [view, search, page]);

  useEffect(load, [load]);

  // Patches the adjusted product in place using what the API already
  // returned, instead of re-fetching the whole list — the number updates
  // the instant the toast does, rather than lagging a beat behind while a
  // full refetch resolves. On the "needs attention" view specifically, a
  // product that's been restocked past the threshold is dropped from view
  // right away too (computed from data already in hand, no extra request).
  function handleProductUpdated(updated: Product) {
    setProducts((prev) => {
      if (!prev) return prev;
      if (view === "needs_attention" && productLevel(updated) === "ok") {
        setTotal((t) => Math.max(0, t - 1));
        return prev.filter((p) => p._id !== updated._id);
      }
      return prev.map((p) => (p._id === updated._id ? updated : p));
    });
  }

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  function switchView(next: "needs_attention" | "all") {
    setView(next);
    setPage(1);
  }

  return (
    <div>
      <AdminPageHeader title="Inventory" description="Stock levels across your catalog — adjust counts directly here." />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-border p-0.5">
          <button
            type="button"
            onClick={() => switchView("needs_attention")}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              view === "needs_attention" ? "bg-primary text-white" : "text-muted-foreground hover:bg-background"
            }`}
          >
            Needs attention
          </button>
          <button
            type="button"
            onClick={() => switchView("all")}
            className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
              view === "all" ? "bg-primary text-white" : "text-muted-foreground hover:bg-background"
            }`}
          >
            All products
          </button>
        </div>
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search products…"
          className="w-full max-w-xs rounded-full border border-border bg-surface px-4 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong"
        />
      </div>

      {!products ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
          <BoxesIcon className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">
            {view === "needs_attention" ? "Nothing needs attention right now" : "No products found"}
          </p>
          {view === "needs_attention" && (
            <p className="text-sm text-muted-foreground">Every product is above the low-stock threshold.</p>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            {products.map((product) => (
              <ProductRow key={product._id} product={product} onChanged={handleProductUpdated} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-center gap-3 text-sm">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-full border border-border px-3 py-1.5 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-full border border-border px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
