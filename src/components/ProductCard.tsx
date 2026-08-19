"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Product, Variant } from "@/types/catalog";
import { useCart } from "@/context/CartContext";
import { FaCartPlus } from "react-icons/fa";

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

// The variant a card's "quick add" targets — cheapest in-stock option, so the
// price it adds at always matches the price the card displays.
function cheapestAvailableVariant(variants: Variant[]): Variant | undefined {
  const inStock = variants.filter((v) => v.status === "active" && v.stock > 0);
  if (inStock.length === 0) return undefined;
  return inStock.reduce((min, v) => ((v.discountPrice ?? v.price) < (min.discountPrice ?? min.price) ? v : min));
}

export function ProductCard({ product }: { product: Product }) {
  const { addItem, openDrawer } = useCart();
  const { price, discountPrice } = priceRange(product);
  const summary = variantSummary(product);
  const isOnSale = discountPrice !== undefined && discountPrice < price;
  const image = product.images[0];
  const hasVariants = product.variants.length > 0;

  const defaultVariant = hasVariants ? cheapestAvailableVariant(product.variants) : undefined;
  const available = hasVariants ? Boolean(defaultVariant) : (product.stock ?? 0) > 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    if (!available) return;

    const unitPrice = hasVariants ? (defaultVariant!.discountPrice ?? defaultVariant!.price) : isOnSale ? discountPrice! : price;

    addItem({
      productId: product._id,
      productSlug: product.slug,
      variantId: defaultVariant?._id,
      name: product.name,
      image: (defaultVariant?.images[0] ?? image)?.url,
      attributes: hasVariants ? defaultVariant?.attributes : undefined,
      unitPrice,
      maxStock: hasVariants ? defaultVariant!.stock : (product.stock ?? 0),
    });
    toast.success(`Added ${product.name} to cart`);
    openDrawer();
  }

  return (
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
        onClick={handleAddToCart}
        disabled={!available}
        aria-label={`Add ${product.name} to cart`}
        className="pointer-events-auto absolute bottom-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white shadow-sm transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FaCartPlus className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
