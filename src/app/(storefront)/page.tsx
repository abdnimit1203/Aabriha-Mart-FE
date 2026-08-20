import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { HeroSlider } from "@/components/HeroSlider";
import { CategoryQuickLinks } from "@/components/CategoryQuickLinks";
import { PromotionalBanner } from "@/components/PromotionalBanner";
import { WhyAabrihaMart } from "@/components/WhyAabrihaMart";
import {
  getTopLevelCategories,
  getFeaturedProducts,
  getHeroBanners,
  getActivePromotion,
  getNewArrivals,
  getSpecialOffers,
} from "@/lib/catalog";
import { HeroBanner, Promotion } from "@/types/storefront";
import { Product } from "@/types/catalog";

// Re-fetch categories/products at most once a minute instead of freezing
// them at build time — admin changes should show up without a redeploy.
export const revalidate = 60;

// Each homepage data source is fetched independently and allowed to fail on
// its own — one section's backend hiccup must not take the whole homepage
// down (Section 21 of the CMS spec).
async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise;
  } catch {
    return fallback;
  }
}

export default async function HomePage() {
  const [categories, products, heroBanners, promotion, newArrivals, specialOffers] = await Promise.all([
    safe(getTopLevelCategories(), []),
    safe(getFeaturedProducts(), []),
    safe<HeroBanner[] | undefined>(getHeroBanners(), undefined),
    safe<Promotion | null>(getActivePromotion(), null),
    safe<Product[]>(getNewArrivals(), []),
    safe<Product[]>(getSpecialOffers(), []),
  ]);

  // HeroSlider.tsx (untouched, per spec) keys/types its banners with `id`,
  // not the backend's `_id` — mapped here rather than changing that component.
  const sliderBanners = heroBanners?.map((b) => ({ ...b, id: b._id }));

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-14">
      <section className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
          Everyday essentials, delivered.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Clothing, shoes, bags & electronics — picked for everyday Bangladesh.
        </p>
      </section>

      <section className="mt-8 overflow-hidden rounded-3xl sm:mt-10">
        {/* Omitting the prop (heroBanners undefined, i.e. the fetch itself
            failed) lets HeroSlider fall back to its own built-in default
            banners rather than showing a blank hero. An empty array (fetch
            succeeded, admin just hasn't activated any) correctly shows nothing. */}
        <HeroSlider banners={sliderBanners} />
      </section>

      <CategoryQuickLinks categories={categories} />

      <section className="mt-16">
        <h2 className="text-lg font-semibold">Popular products</h2>
        {products.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No products found. Check back soon, or explore another category.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>

      <PromotionalBanner promotion={promotion} />

      {newArrivals.length > 0 && (
        <section className="mt-16">
          <h2 className="text-lg font-semibold">New arrivals</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-16">
        <h2 className="text-lg font-semibold">Shop by category</h2>
        {categories.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            No categories yet. They will appear here once added in the admin dashboard.
          </p>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/categories/${category.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-border bg-surface text-center shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
              >
                {category.image ? (
                  <div className="relative aspect-4/3 w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={category.image}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                    <span className="absolute inset-x-0 bottom-0 p-3 text-sm font-medium text-white">{category.name}</span>
                  </div>
                ) : (
                  <span className="block px-4 py-6 text-sm font-medium">{category.name}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      {specialOffers.length > 0 && (
        <section className="mt-16">
          <h2 className="text-lg font-semibold">Special offers</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {specialOffers.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      <WhyAabrihaMart />
    </main>
  );
}
