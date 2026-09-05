"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Product, Category } from "@/types/catalog";
import { getAllCategories } from "@/lib/catalog";
import { listProductsAdmin, deleteProduct } from "@/lib/admin/products";
import { TrashIcon } from "@/components/icons";
import { AdminPageHeader } from "@/components/AdminPageHeader";
import { Pagination } from "@/components/Pagination";
import { confirmToast } from "@/lib/confirmToast";

const inputClass =
  "rounded border border-border bg-surface px-3 py-1.5 text-sm outline-none focus-visible:outline-2 focus-visible:outline-primary-strong";

function priceSummary(product: Product): string {
  if (product.variants.length > 0) {
    const prices = product.variants.map((v) => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return min === max ? `৳${min.toLocaleString()}` : `৳${min.toLocaleString()}–${max.toLocaleString()}`;
  }
  return `৳${(product.price ?? 0).toLocaleString()}`;
}

function stockSummary(product: Product): number {
  if (product.variants.length > 0) return product.variants.reduce((sum, v) => sum + v.stock, 0);
  return product.stock ?? 0;
}

// product.category comes back populated ({ name, slug }) from the admin
// listing endpoint, but the shared Product type also allows a bare id
// string (the shape it has right after a create/update response) — guard
// against both rather than assuming the populated shape always holds.
function categoryName(product: Product): string {
  return typeof product.category === "string" ? "—" : (product.category?.name ?? "—");
}

export default function AdminProductsPage() {
  const { getIdToken } = useAuth();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState<"" | "active" | "inactive">("");
  const [stockStatus, setStockStatus] = useState<"" | "in_stock" | "low" | "out">("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 15;

  const hasActiveFilters = Boolean(search || category || status || stockStatus);

  useEffect(() => {
    getAllCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const load = useCallback(() => {
    listProductsAdmin({
      search: search || undefined,
      category: category || undefined,
      status: status || undefined,
      stockStatus: stockStatus || undefined,
      page,
      limit,
    })
      .then((res) => {
        setProducts(res.products);
        setTotal(res.total);
      })
      .catch(() => setProducts([]));
  }, [search, category, status, stockStatus, page]);

  useEffect(load, [load]);

  function withFilterChange<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(1);
    };
  }

  function resetFilters() {
    setSearch("");
    setCategory("");
    setStatus("");
    setStockStatus("");
    setPage(1);
  }

  async function handleDelete(product: Product) {
    if (!(await confirmToast(`Delete "${product.name}"? This cannot be undone.`))) return;
    const idToken = await getIdToken();
    if (!idToken) return;
    try {
      await deleteProduct(idToken, product._id);
      toast.success("Product deleted.");
      load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't delete this product.");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div>
      <AdminPageHeader
        title="Products"
        description="Manage your catalog, variants, and stock."
        actions={
          <Link
            href="/admin/products/new"
            className="whitespace-nowrap rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-strong"
          >
            New Product
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <input
          value={search}
          onChange={(e) => withFilterChange(setSearch)(e.target.value)}
          placeholder="Search products…"
          className={`${inputClass} w-full max-w-xs`}
        />
        <select
          value={category}
          onChange={(e) => withFilterChange(setCategory)(e.target.value)}
          className={inputClass}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => withFilterChange(setStatus)(e.target.value as "" | "active" | "inactive")}
          className={inputClass}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <select
          value={stockStatus}
          onChange={(e) => withFilterChange(setStockStatus)(e.target.value as "" | "in_stock" | "low" | "out")}
          className={inputClass}
        >
          <option value="">All stock levels</option>
          <option value="in_stock">In Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>
        {hasActiveFilters && (
          <button type="button" onClick={resetFilters} className="text-sm text-primary-strong hover:underline">
            Reset filters
          </button>
        )}
      </div>

      {!products ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed border-border bg-surface px-6 py-16 text-center">
          <p className="text-sm font-medium text-foreground">
            {hasActiveFilters ? "No products match your filters" : "No products found"}
          </p>
          {hasActiveFilters && (
            <button type="button" onClick={resetFilters} className="text-sm text-primary-strong hover:underline">
              Reset filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-muted-foreground">
            Showing {products.length} of {total} product{total !== 1 ? "s" : ""}
          </p>

          {/* Table below sm: has to squeeze 5 columns (image+name, price,
              stock, status, actions) into less width than a real narrow
              phone actually renders text at — some Android browsers/OS
              accessibility settings boost body text beyond what desktop
              devtools device emulation shows, which no amount of column
              tightening reliably survives. A stacked card per row sidesteps
              the problem entirely instead of chasing an exact px budget. */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="pb-2 font-medium">Product</th>
                  <th className="pb-2 font-medium">Category</th>
                  <th className="pb-2 font-medium">Price</th>
                  <th className="pb-2 font-medium">Stock</th>
                  <th className="pb-2 font-medium">Status</th>
                  <th className="pb-2" />
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product._id} className="border-b border-border last:border-0">
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-3">
                        {product.images[0] ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={product.images[0].url} alt="" className="h-10 w-10 rounded border border-border object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded border border-dashed border-border" />
                        )}
                        <span className="text-sm font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-2.5 pr-3 text-sm text-muted-foreground">{categoryName(product)}</td>
                    <td className="py-2.5 pr-3 text-sm">{priceSummary(product)}</td>
                    <td className="py-2.5 pr-3 text-sm">{stockSummary(product)}</td>
                    <td className="py-2.5 pr-3">
                      {product.status === "active" ? (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
                      ) : (
                        <span className="rounded bg-border px-2 py-0.5 text-xs font-medium text-muted-foreground">Inactive</span>
                      )}
                    </td>
                    <td className="py-2.5 text-right">
                      <Link href={`/admin/products/${product._id}/edit`} className="mr-3 text-sm text-primary-strong hover:underline">
                        Edit
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        aria-label={`Delete ${product.name}`}
                        className="text-danger hover:opacity-70"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Card list below sm: */}
          <div className="space-y-3 sm:hidden">
            {products.map((product) => (
              <div key={product._id} className="rounded-md border border-border p-3">
                <div className="flex items-center gap-3">
                  {product.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.images[0].url} alt="" className="h-11 w-11 shrink-0 rounded border border-border object-cover" />
                  ) : (
                    <div className="h-11 w-11 shrink-0 rounded border border-dashed border-border" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{product.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {categoryName(product)} · {priceSummary(product)}
                    </p>
                  </div>
                  {product.status === "active" ? (
                    <span className="shrink-0 rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Active</span>
                  ) : (
                    <span className="shrink-0 rounded bg-border px-2 py-0.5 text-xs font-medium text-muted-foreground">Inactive</span>
                  )}
                </div>
                <div className="mt-2.5 flex items-center justify-between border-t border-border pt-2.5 text-sm">
                  <span className="text-muted-foreground">Stock: {stockSummary(product)}</span>
                  <div className="flex items-center gap-4">
                    <Link href={`/admin/products/${product._id}/edit`} className="text-primary-strong hover:underline">
                      Edit
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(product)}
                      aria-label={`Delete ${product.name}`}
                      className="text-danger hover:opacity-70"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
    </div>
  );
}
