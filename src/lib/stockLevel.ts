import { Product } from "@/types/catalog";

// Mirrors LOW_STOCK_THRESHOLD in the backend's Product model — kept in sync
// manually (same convention as the order-status mirror in orderStatusStyles.ts):
// the backend enforces/computes the real filter, this copy only decides how
// to badge a product/variant already fetched from that filter. Shared by the
// Inventory page and the Dashboard's Needs Attention card — two call sites
// is exactly why this lives here instead of being copied a second time.
export const LOW_STOCK_THRESHOLD = 5;

export type StockLevel = "out" | "low" | "ok";

export function levelForStock(stock: number): StockLevel {
  if (stock <= 0) return "out";
  if (stock <= LOW_STOCK_THRESHOLD) return "low";
  return "ok";
}

export function productLevel(product: Pick<Product, "stock" | "variants">): StockLevel {
  const stocks = product.variants.length > 0 ? product.variants.map((v) => v.stock) : [product.stock ?? 0];
  if (stocks.every((s) => s <= 0)) return "out";
  if (stocks.some((s) => s > 0 && s <= LOW_STOCK_THRESHOLD)) return "low";
  return "ok";
}

export function totalStock(product: Pick<Product, "stock" | "variants">): number {
  if (product.variants.length > 0) return product.variants.reduce((sum, v) => sum + v.stock, 0);
  return product.stock ?? 0;
}

export const STOCK_LEVEL_CLASS: Record<StockLevel, string> = {
  out: "bg-danger/10 text-danger",
  low: "bg-yellow-100 text-yellow-700",
  ok: "bg-green-100 text-green-700",
};

export const STOCK_LEVEL_LABEL: Record<StockLevel, string> = {
  out: "Out of stock",
  low: "Low stock",
  ok: "In stock",
};
