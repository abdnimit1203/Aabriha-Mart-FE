import { Category } from "@/types/catalog";
import { CategoryFilterPanel } from "@/components/CategoryFilterPanel";

/** Shared shell for every product-browsing page (all products, a single
 * category, search results, offers, new arrivals) — sidebar on the left
 * (drawer on mobile), whatever the page fetched on the right. Keeps the
 * five entry points feeling like one browsing experience instead of five
 * differently-shaped pages. */
export function ProductListingLayout({
  categories,
  defaultSelectedId,
  children,
}: {
  categories: Category[];
  defaultSelectedId?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 sm:flex sm:items-start sm:gap-8">
      <CategoryFilterPanel categories={categories} defaultSelectedId={defaultSelectedId} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
