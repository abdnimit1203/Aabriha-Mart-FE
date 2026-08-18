"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/types/catalog";

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

export function ProductCard({ product }: { product: Product }) {
  const { price, discountPrice } = priceRange(product);
  const summary = variantSummary(product);
  const isOnSale = discountPrice !== undefined && discountPrice < price;
  const image = product.images[0];

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.15 }}>
      <Link
        href={`/products/${product.slug}`}
        className="block overflow-hidden rounded-2xl border border-border bg-surface shadow-sm transition-shadow hover:shadow-md"
      >
        <div className="relative aspect-square bg-background">
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
        <div className="space-y-1 p-3">
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
      </Link>
    </motion.div>
  );
}
