"use client";

import { useMemo, useState } from "react";
import { Product, Variant } from "@/types/catalog";

function findMatchingVariant(variants: Variant[], selected: Record<string, string>): Variant | undefined {
  return variants.find((v) => Object.entries(selected).every(([key, value]) => v.attributes[key] === value));
}

/** Attribute selection, active-variant matching, and the price/stock rules
 * that follow from it — shared by the product page's purchase panel and the
 * product-card quick-add modal, so "what does this product cost/have in
 * stock right now" is computed exactly once. */
export function useVariantSelector(product: Product) {
  const hasVariants = product.variants.length > 0;

  const [selected, setSelected] = useState<Record<string, string>>(() => {
    if (!hasVariants) return {};
    const first =
      product.variants.find((v) => v.status === "active" && v.stock > 0) ??
      product.variants.find((v) => v.status === "active") ??
      product.variants[0];
    return { ...first.attributes };
  });
  const [quantity, setQuantity] = useState(1);

  const activeVariant = useMemo(
    () => (hasVariants ? findMatchingVariant(product.variants, selected) : undefined),
    [hasVariants, product.variants, selected]
  );

  function selectAttribute(name: string, value: string) {
    setSelected((prev) => ({ ...prev, [name]: value }));
    setQuantity(1);
  }

  function valuesFor(attributeName: string): string[] {
    return Array.from(new Set(product.variants.map((v) => v.attributes[attributeName]).filter(Boolean)));
  }

  const price = hasVariants ? activeVariant?.price : product.price;
  const discountPrice = hasVariants ? activeVariant?.discountPrice : product.discountPrice;
  const stock = hasVariants ? (activeVariant?.stock ?? 0) : (product.stock ?? 0);
  const isOnSale = discountPrice !== undefined && price !== undefined && discountPrice < price;
  const available = hasVariants ? Boolean(activeVariant) && stock > 0 : stock > 0;
  const unitPrice = isOnSale ? (discountPrice as number) : (price ?? 0);

  return {
    hasVariants,
    selected,
    selectAttribute,
    valuesFor,
    activeVariant,
    quantity,
    setQuantity,
    price,
    discountPrice,
    stock,
    isOnSale,
    available,
    unitPrice,
  };
}
