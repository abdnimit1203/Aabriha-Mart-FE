"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { listProductsAdmin, adjustProductStock } from "@/lib/admin/products";
import { listStockIntakes } from "@/lib/admin/stockIntakes";
import { getAllCategories } from "@/lib/catalog";
import { Product, Variant, Category, StockIntake } from "@/types/catalog";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { Pagination } from "@/components/Pagination";
import { StockBadge } from "@/components/StockBadge";
import { StockIntakeModal } from "@/components/StockIntakeModal";
import { levelForStock, productLevel, totalStock } from "@/lib/stockLevel";
import { ChevronIcon, BoxesIcon, ReceiptIcon } from "@/components/icons";

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
        className="h-6 w-6 rounded border border-border text-sm leading-none hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
      >
        −
      </button>
      <button
        type="button"
        onClick={() => apply(1)}
        disabled={saving}
        aria-label={`Increase ${label} stock by 1`}
        className="h-6 w-6 rounded border border-border text-sm leading-none hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
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
        className="w-16 rounded border border-border bg-surface px-2 py-1 text-xs outline-none focus-visible:outline-2 focus-visible:outline-primary-strong disabled:opacity-50"
      />
      <button
        type="button"
        onClick={() => apply(Number(value))}
        disabled={saving || !value.trim() || Number.isNaN(Number(value))}
        className="rounded border border-border px-2.5 py-1 text-xs font-medium hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
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
  const [intakeOpen, setIntakeOpen] = useState(false);
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
    <div className="flex flex-wrap items-center gap-3 border-t border-border py-2 pl-8 pr-3 sm:flex-nowrap sm:justify-between sm:pl-12">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{label}</p>
        <StockBadge level={levelForStock(variant.stock)} />
      </div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
        <StockAdjuster label={label} stock={variant.stock} onAdjust={handleAdjust} />
        <button
          type="button"
          onClick={() => setIntakeOpen(true)}
          className="rounded border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-background hover:text-foreground"
        >
          Log intake
        </button>
      </div>
      {intakeOpen && (
        <StockIntakeModal
          product={product}
          variantId={variant._id}
          variantLabel={label}
          onClose={() => setIntakeOpen(false)}
          onSaved={onChanged}
        />
      )}
    </div>
  );
}

function ProductRow({ product, onChanged }: { product: Product; onChanged: (updated: Product) => void }) {
  const { getIdToken } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [intakeOpen, setIntakeOpen] = useState(false);
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
      <div className="flex flex-wrap items-center gap-3 px-3 py-3 sm:flex-nowrap">
        {hasVariants ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? "Collapse variants" : "Expand variants"}
            className="rounded p-1 text-muted-foreground hover:bg-background"
          >
            <ChevronIcon className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
        ) : (
          <span className="w-6 shrink-0" />
        )}

        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0].url} alt="" className="h-10 w-10 shrink-0 rounded border border-border object-cover" />
        ) : (
          <div className="h-10 w-10 shrink-0 rounded border border-dashed border-border" />
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

        {/* flex-wrap on the row lets this drop to its own full-width line
            on mobile instead of squeezing next to the name — a 5-control
            stock adjuster (number, -, +, input, Apply) never fits on the
            same line as the thumbnail+name at any real phone width. */}
        <div className="flex w-full flex-wrap items-center gap-2 pl-9 sm:w-auto sm:flex-nowrap sm:pl-0">
          {hasVariants ? (
            <span className="text-sm tabular-nums text-muted-foreground sm:w-24 sm:text-right sm:block">
              {totalStock(product)} total
            </span>
          ) : (
            <>
              <StockAdjuster label={product.name} stock={product.stock ?? 0} onAdjust={handleAdjust} />
              <button
                type="button"
                onClick={() => setIntakeOpen(true)}
                className="rounded border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground hover:bg-background hover:text-foreground"
              >
                Log intake
              </button>
            </>
          )}
        </div>
      </div>

      {intakeOpen && (
        <StockIntakeModal product={product} onClose={() => setIntakeOpen(false)} onSaved={onChanged} />
      )}

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

function formatIntakeDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function recordedByName(recordedBy: StockIntake["recordedBy"]): string {
  return typeof recordedBy === "string" ? "—" : recordedBy.username;
}

function IntakeHistoryRow({ intake }: { intake: StockIntake }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-border p-3 last:border-0 sm:flex-nowrap">
      {intake.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={intake.image} alt="" className="h-12 w-12 shrink-0 rounded border border-border object-cover" />
      ) : (
        <div className="h-12 w-12 shrink-0 rounded border border-dashed border-border" />
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {intake.productNameSnapshot}
          {intake.variantLabelSnapshot && ` — ${intake.variantLabelSnapshot}`}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {intake.supplier} · {formatIntakeDate(intake.intakeDate)} · logged by {recordedByName(intake.recordedBy)}
        </p>
        {intake.note && <p className="mt-0.5 truncate text-xs text-muted-foreground">{intake.note}</p>}
      </div>
      <div className="w-full shrink-0 text-left sm:w-auto sm:text-right">
        <p className="text-sm font-medium text-green-700">+{intake.quantity} units</p>
        <p className="text-xs text-muted-foreground">
          ৳{intake.unitCost.toLocaleString()} each · ৳{(intake.quantity * intake.unitCost).toLocaleString()} total
        </p>
      </div>
    </div>
  );
}

const HISTORY_LIMIT = 20;

function IntakeHistoryPanel() {
  const { getIdToken } = useAuth();
  const [intakes, setIntakes] = useState<StockIntake[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const load = useCallback(() => {
    getIdToken()
      .then((idToken) => {
        if (!idToken) return;
        return listStockIntakes(idToken, { page, limit: HISTORY_LIMIT }).then((res) => {
          setIntakes(res.intakes);
          setTotal(res.total);
        });
      })
      .catch(() => setIntakes([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(load, [load]);

  const totalPages = Math.max(1, Math.ceil(total / HISTORY_LIMIT));

  if (!intakes) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (intakes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border bg-surface px-6 py-16 text-center">
        <ReceiptIcon className="h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">No stock intake logged yet</p>
        <p className="text-sm text-muted-foreground">Use &ldquo;Log intake&rdquo; on a product to record stock a supplier delivered.</p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground">
        Showing {intakes.length} of {total} intake{total !== 1 ? "s" : ""}
      </p>
      <div className="overflow-hidden rounded-md border border-border bg-surface">
        {intakes.map((intake) => (
          <IntakeHistoryRow key={intake._id} intake={intake} />
        ))}
      </div>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </>
  );
}

const LIMIT = 20;

export default function AdminInventoryPage() {
  const [view, setView] = useState<"needs_attention" | "all" | "history">("needs_attention");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [products, setProducts] = useState<Product[] | null>(null);
  const [total, setTotal] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getAllCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const load = useCallback(() => {
    if (view === "history") return; // IntakeHistoryPanel fetches its own data
    listProductsAdmin({
      search: search || undefined,
      category: category || undefined,
      stockStatus: view === "needs_attention" ? "needs_attention" : undefined,
      page,
      limit: LIMIT,
    })
      .then((res) => {
        setProducts(res.products);
        setTotal(res.total);
      })
      .catch(() => setProducts([]));
  }, [view, search, category, page]);

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

  function switchView(next: "needs_attention" | "all" | "history") {
    setView(next);
    setPage(1);
  }

  return (
    <div>
      <AdminPageHeader title="Inventory" description="Stock levels across your catalog — adjust counts directly here." />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded border border-border p-0.5">
          <button
            type="button"
            onClick={() => switchView("needs_attention")}
            className={`rounded px-3.5 py-1.5 text-sm font-medium transition-colors ${
              view === "needs_attention" ? "bg-primary text-white" : "text-muted-foreground hover:bg-background"
            }`}
          >
            Needs attention
          </button>
          <button
            type="button"
            onClick={() => switchView("all")}
            className={`rounded px-3.5 py-1.5 text-sm font-medium transition-colors ${
              view === "all" ? "bg-primary text-white" : "text-muted-foreground hover:bg-background"
            }`}
          >
            All products
          </button>
          <button
            type="button"
            onClick={() => switchView("history")}
            className={`rounded px-3.5 py-1.5 text-sm font-medium transition-colors ${
              view === "history" ? "bg-primary text-white" : "text-muted-foreground hover:bg-background"
            }`}
          >
            Intake history
          </button>
        </div>
        {view !== "history" && (
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="rounded border border-border bg-surface px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search products…"
              className="w-full max-w-xs rounded border border-border bg-surface px-4 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong"
            />
          </div>
        )}
      </div>

      {view === "history" ? (
        <IntakeHistoryPanel />
      ) : !products ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-md border border-dashed border-border bg-surface px-6 py-16 text-center">
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
          <p className="mb-3 text-sm text-muted-foreground">
            Showing {products.length} of {total} product{total !== 1 ? "s" : ""}
          </p>

          <div className="overflow-hidden rounded-md border border-border bg-surface">
            {products.map((product) => (
              <ProductRow key={product._id} product={product} onChanged={handleProductUpdated} />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
