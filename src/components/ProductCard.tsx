"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCartPlus } from "react-icons/fa";
import { Product } from "@/types/catalog";
import { QuickAddModal } from "@/components/QuickAddModal";

function priceRange(product: Product): { price: number; discountPrice?: number } {
  if (product.variants.length > 0) {
    const prices = product.variants.map((v) => v.discountPrice ?? v.price);
    return { price: Math.min(...prices) };
  }
  return { price: product.price ?? 0, discountPrice: product.discountPrice };
}

function variantSummary(product: Product): string | null {
  if (product.variants.length === 0) return null;
  const values = product.attributeNames.map((attr) => {
    const unique = Array.from(new Set(product.variants.map((v) => v.attributes[attr]).filter(Boolean)));
    return unique.join("/");
  });
  return values.filter(Boolean).join(" • ");
}

function isAvailable(product: Product): boolean {
  if (product.variants.length > 0) {
    return product.variants.some((v) => v.status === "active" && v.stock > 0);
  }
  return (product.stock ?? 0) > 0;
}

export function ProductCard({ product }: { product: Product }) {
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const { price, discountPrice } = priceRange(product);
  const summary = variantSummary(product);
  const isOnSale = discountPrice !== undefined && discountPrice < price;
  const image = product.images[0];
  const available = isAvailable(product);

  return (
    <>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.15 }}
        className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
      >
        <Link href={`/products/${product.slug}`} className="absolute inset-0 z-0" aria-label={product.name} />

        <div className="pointer-events-none relative aspect-square bg-background">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image.url} alt={image.alt ?? product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
          )}
          {isOnSale && (
            <span className="absolute left-2 top-2 rounded-full bg-danger px-2 py-0.5 text-xs font-medium text-white">
              Sale
            </span>
          )}
        </div>

        <div className="pointer-events-none space-y-1 p-3 pr-9">
          <p className="truncate text-sm font-medium">{product.name}</p>
          {summary && <p className="truncate text-xs text-muted-foreground">{summary}</p>}
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">৳{(isOnSale ? discountPrice! : price).toLocaleString()}</span>
            {isOnSale && (
              <span className="text-xs text-muted-foreground line-through">৳{price.toLocaleString()}</span>
            )}
          </div>
          {product.ratingCount > 0 && (
            <p className="text-xs text-muted-foreground">★ {product.ratingAverage.toFixed(1)}</p>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (available) setQuickAddOpen(true);
          }}
          disabled={!available}
          aria-label={`Add ${product.name} to cart`}
          className="pointer-events-auto absolute bottom-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FaCartPlus className="h-4 w-4" />
        </button>
      </motion.div>

      {quickAddOpen && <QuickAddModal product={product} onClose={() => setQuickAddOpen(false)} />}
    </>
  );
}
