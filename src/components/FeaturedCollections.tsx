import Link from "next/link";
import { Category } from "@/types/catalog";
import { ScrollReveal } from "@/components/ScrollReveal";
import { expandCategorySelection } from "@/lib/categoryTree";

/** Category discovery as a merchandised collection grid — image, name, and
 * an explicit "Explore" action per tile — rather than a row of plain
 * pill-shaped links. Replaces both the old CategoryQuickLinks chip row and
 * the mid-page "Shop by category" grid: one strong category section instead
 * of two weaker ones. Tiles link into /products as a category filter —
 * there's no dedicated category page to send them to instead. */
export function FeaturedCollections({ categories, allCategories }: { categories: Category[]; allCategories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mt-14 sm:mt-20">
      <ScrollReveal>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">Featured Collections</h2>
            <p className="mt-1 text-sm text-muted-foreground">Shop by category, curated for everyday Bangladesh.</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {categories.slice(0, 6).map((category) => {
            const ids = expandCategorySelection([category._id], allCategories);
            return (
              <Link
                key={category._id}
                href={`/products?category=${ids.join(",")}`}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-surface shadow-sm transition-shadow hover:shadow-md"
              >
                {category.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={category.image}
                    alt=""
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-linear-to-br from-primary/20 to-primary-strong/20">
                    <span className="text-lg font-semibold text-primary-strong">{category.name}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="text-base font-semibold text-white sm:text-lg">{category.name}</p>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-white/85 transition-colors group-hover:text-white">
                    Explore
                    <span className="transition-transform group-hover:translate-x-0.5">→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </ScrollReveal>
    </section>
  );
}
