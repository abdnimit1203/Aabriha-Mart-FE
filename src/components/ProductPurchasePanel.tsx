"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Product, Variant } from "@/types/catalog";

function findMatchingVariant(variants: Variant[], selected: Record<string, string>): Variant | undefined {
  return variants.find((v) => Object.entries(selected).every(([key, value]) => v.attributes[key] === value));
}

export function ProductPurchasePanel({ product }: { product: Product }) {
  const hasVariants = product.variants.length > 0;

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    if (!hasVariants) return {};
    const first = product.variants.find((v) => v.status === "active") ?? product.variants[0];
    return { ...first.attributes };
  });
  const [quantity, setQuantity] = useState(1);

  const activeVariant = useMemo(
    () => (hasVariants ? findMatchingVariant(product.variants, selected) : undefined),
    [hasVariants, product.variants, selected]
  );

  const price = hasVariants ? activeVariant?.price : product.price;
  const discountPrice = hasVariants ? activeVariant?.discountPrice : product.discountPrice;
  const stock = hasVariants ? activeVariant?.stock ?? 0 : product.stock ?? 0;
  const isOnSale = discountPrice !== undefined && price !== undefined && discountPrice < price;
  const available = hasVariants ? Boolean(activeVariant) && stock > 0 : stock > 0;

  function selectAttribute(name: string, value: string) {
    setSelected((prev) => ({ ...prev, [name]: value }));
    setQuantity(1);
  }

  function valuesFor(attributeName: string): string[] {
    return Array.from(new Set(product.variants.map((v) => v.attributes[attributeName]).filter(Boolean)));
  }

  function handleAddToCart() {
    toast("Cart is coming soon — you can't add items yet.");
  }

  function handleBuyNow() {
    toast("Checkout is coming soon — you can't order yet.");
  }

  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-baseline gap-2">
          {price !== undefined && (
            <span className="text-2xl font-semibold">৳{(isOnSale ? discountPrice! : price).toLocaleString()}</span>
          )}
          {isOnSale && <span className="text-muted-foreground line-through">৳{price!.toLocaleString()}</span>}
        </div>
        <p className={`mt-1 text-sm ${available ? "text-success" : "text-danger"}`}>
          {hasVariants && !activeVariant
            ? "This combination is not available"
            : available
              ? stock <= 5
                ? `Only ${stock} left in stock`
                : "In stock"
              : "Out of stock"}
        </p>
      </div>

      {product.attributeNames.map((attributeName) => (
        <div key={attributeName}>
          <p className="mb-2 text-sm font-medium capitalize">{attributeName}</p>
          <div className="flex flex-wrap gap-2">
            {valuesFor(attributeName).map((value) => {
              const isSelected = selected[attributeName] === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => selectAttribute(attributeName, value)}
                  aria-pressed={isSelected}
                  className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-primary-strong bg-primary-strong text-white"
                      : "border-border bg-surface hover:border-primary"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="flex items-center gap-3">
        <p className="text-sm font-medium">Quantity</p>
        <div className="flex items-center rounded-full border border-border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="px-3 py-1.5 text-lg disabled:opacity-40"
          >
            −
          </button>
          <span className="min-w-8 text-center text-sm">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(stock || 1, q + 1))}
            disabled={!available || quantity >= stock}
            aria-label="Increase quantity"
            className="px-3 py-1.5 text-lg disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!available}
          className="flex-1 rounded-full border border-primary-strong px-6 py-3 text-sm font-medium text-primary-strong transition-colors hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add to Cart
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!available}
          className="flex-1 rounded-full bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}
