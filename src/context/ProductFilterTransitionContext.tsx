"use client";

import { createContext, useContext, useTransition, type ReactNode } from "react";

interface ProductFilterTransitionValue {
  /** True from the instant a filter/sort navigation starts until the new
   * Server Component data has actually arrived and rendered. */
  pending: boolean;
  startFilterTransition: (callback: () => void) => void;
}

const ProductFilterTransitionContext = createContext<ProductFilterTransitionValue | null>(null);

/** Shared per-page-shell pending state for category/sort/in-stock changes —
 * one useTransition() owned by ProductListingLayout, read by the grid (to
 * fade while waiting) and written by whatever control triggers a
 * router.push (the category sidebar, the sort bar). Kept as a context
 * rather than prop-drilling since the trigger and the fade target are
 * siblings under the layout, not parent/child. */
export function ProductFilterTransitionProvider({ children }: { children: ReactNode }) {
  const [pending, startTransition] = useTransition();
  return (
    <ProductFilterTransitionContext.Provider value={{ pending, startFilterTransition: startTransition }}>
      {children}
    </ProductFilterTransitionContext.Provider>
  );
}

/** Falls back to a plain (never-pending) passthrough outside the provider,
 * so a control that uses this hook doesn't need a separate code path for
 * contexts that don't wrap it in ProductFilterTransitionProvider. */
export function useProductFilterTransition(): ProductFilterTransitionValue {
  const ctx = useContext(ProductFilterTransitionContext);
  return ctx ?? { pending: false, startFilterTransition: (callback) => callback() };
}
