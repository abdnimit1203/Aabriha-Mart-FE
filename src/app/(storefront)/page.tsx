import { HeroSlider } from "@/components/HeroSlider";
import { FeaturedCollections } from "@/components/FeaturedCollections";
import { ProductSection } from "@/components/ProductSection";
import { PromotionalBanner } from "@/components/PromotionalBanner";
import { EditorialBanner } from "@/components/EditorialBanner";
import { WhyAabrihaMart } from "@/components/WhyAabrihaMart";
import {
  getTopLevelCategories,
  getPopularProducts,
  getHeroBanners,
  getActivePromotions,
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
  const [categories, popularProducts, heroBanners, activePromotions, specialOffers] = await Promise.all([
    safe(getTopLevelCategories(), []),
    safe(getPopularProducts(), []),
    safe<HeroBanner[] | undefined>(getHeroBanners(), undefined),
    safe<Promotion[]>(getActivePromotions(), []),
    safe<Product[]>(getSpecialOffers(), []),
  ]);

  // New Arrivals is the weakest signal of the three product sections ("newest"
  // is nearly meaningless on a small catalog) — it excludes whatever Popular
  // Products/Special Offers already showed above it instead of repeating them,
  // per the "don't show the same product twice unless it genuinely qualifies
  // for both" requirement. Popular Products and Special Offers can legitimately
  // overlap each other (a bestseller that's also on sale is real, useful
  // information), so no exclusion is applied between those two.
  const excludeFromNewArrivals = [...popularProducts, ...specialOffers].map((p) => p._id);
  const newArrivals = await safe<Product[]>(getNewArrivals(excludeFromNewArrivals), []);

  // HeroSlider.tsx (untouched, per spec) keys/types its banners with `id`,
  // not the backend's `_id` — mapped here rather than changing that component.
  const sliderBanners = heroBanners?.map((b) => ({ ...b, id: b._id }));

  // The Promotion model is a single admin-managed list — the homepage
  // decides which slots to fill from it rather than needing a second CMS
  // model for "the other kind of banner." 1st active promotion = the
  // campaign banner; 2nd = the editorial/collection banner. Either or both
  // sections simply don't render if there aren't enough active promotions.
  const [campaignPromotion, editorialPromotion] = activePromotions;

  return (
    <main className="mx-auto max-w-350 px-4 py-6 sm:px-6 sm:py-10">
      <section className="overflow-hidden rounded-3xl">
        {/* Omitting the prop (heroBanners undefined, i.e. the fetch itself
            failed) lets HeroSlider fall back to its own built-in default
            banners rather than showing a blank hero. An empty array (fetch
            succeeded, admin just hasn't activated any) correctly shows nothing. */}
        <HeroSlider banners={sliderBanners} />
      </section>

      <FeaturedCollections categories={categories} />

      <ProductSection
        title="Popular Products"
        description="Loved by shoppers across Bangladesh."
        products={popularProducts}
        viewAllHref="/products"
      />

      <PromotionalBanner promotion={campaignPromotion ?? null} />

      <ProductSection
        title="New Arrivals"
        description="Just landed — the newest additions to the catalog."
        products={newArrivals}
        viewAllHref="/new-arrivals"
      />

      <EditorialBanner promotion={editorialPromotion ?? null} />

      <ProductSection
        title="Special Offers"
        description="Genuine discounts, while they last."
        products={specialOffers}
        viewAllHref="/offers"
        tone="sale"
      />

      <WhyAabrihaMart />
    </main>
  );
}
