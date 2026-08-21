"use client";

import { Category } from "@/types/catalog";
import { CategoryFilterPanel } from "@/components/CategoryFilterPanel";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ProductFilterTransitionProvider, useProductFilterTransition } from "@/context/ProductFilterTransitionContext";

/** Fades the listing area the instant a category/sort/in-stock change is
 * triggered (React's transition-pending state, not a fetch-in-progress
 * flag) and back in once the new products have actually rendered — a quiet
 * "something is happening" cue instead of an abrupt swap or a full skeleton
 * flash. Load-more (a separate, in-grid action) already has its own
 * "Loading…" button state and isn't part of this. */
function FadingContent({ children }: { children: React.ReactNode }) {
  const { pending } = useProductFilterTransition();
  return <div className={`transition-opacity duration-200 ${pending ? "opacity-50" : "opacity-100"}`}>{children}</div>;
}

/** Shared shell for every product-browsing page (all products — filterable
 * by category — search results, offers, new arrivals) — sidebar on the left
 * (drawer on mobile), whatever the page fetched on the right. Categories are
 * a filter here, not a separate destination: there's no dedicated category
 * page anymore, so this is the one place category browsing happens. */
export function ProductListingLayout({
  categories,
  children,
}: {
  categories: Category[];
  children: React.ReactNode;
}) {
  return (
    <ProductFilterTransitionProvider>
      <div className="mt-6 sm:flex sm:items-start sm:gap-8">
        <CategoryFilterPanel categories={categories} />
        <ScrollReveal className="min-w-0 flex-1">
          <FadingContent>{children}</FadingContent>
        </ScrollReveal>
      </div>
    </ProductFilterTransitionProvider>
  );
}
