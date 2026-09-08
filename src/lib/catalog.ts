import { apiFetch } from "@/lib/api";
import { Category, Product } from "@/types/catalog";
import {
  Announcement,
  HeroBanner,
  MarketingSettings,
  PaymentSettings,
  Promotion,
  Testimonial,
  ThemeSettings,
  WelcomePopup,
} from "@/types/storefront";

export async function getAllCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/categories");
}

/** Leaf-level product counts by category id, active products only. A
 * parent category's own total is the sum across itself + its descendants —
 * computed by the caller (via collectIds), not duplicated here. */
export async function getCategoryCounts(): Promise<Record<string, number>> {
  return apiFetch<Record<string, number>>("/api/categories/counts");
}

/** The catalog's whole active-product price range — used as the price
 * slider's outer track bounds, deliberately independent of any currently
 * applied filter so the track itself doesn't shift around. */
export async function getPriceRange(): Promise<{ min: number; max: number }> {
  return apiFetch<{ min: number; max: number }>("/api/products/price-range");
}

/** Ranked by real units sold, not a fake "featured" flag — see the backend's
 * getPopularProducts for why. Empty when the store has no sales history yet;
 * never backfilled with unrelated products just to fill the section. */
export async function getPopularProducts(limit = 8): Promise<Product[]> {
  const { products } = await apiFetch<{ products: Product[] }>(`/api/products/popular?limit=${limit}`);
  return products;
}

/** "Genuinely newest" on a small catalog otherwise means "almost the whole
 * catalog" — excludeIds lets the homepage keep this section from just
 * repeating what Popular Products/Special Offers already showed above it.
 * Fetches a wider pool than `limit` so filtering still leaves enough; if it
 * doesn't, this correctly returns fewer than `limit` rather than backfilling
 * with excluded products. */
export async function getNewArrivals(excludeIds: string[] = [], limit = 8): Promise<Product[]> {
  const { products } = await apiFetch<{ products: Product[] }>(
    `/api/products?status=active&sort=newest&limit=${limit + excludeIds.length}`
  );
  return products.filter((p) => !excludeIds.includes(p._id)).slice(0, limit);
}

export async function getSpecialOffers(): Promise<Product[]> {
  const { products } = await apiFetch<{ products: Product[] }>("/api/products?status=active&onSale=true&limit=8");
  return products;
}

export async function getHeroBanners(): Promise<HeroBanner[]> {
  return apiFetch<HeroBanner[]>("/api/hero-banners");
}

export async function getPromotions(): Promise<Promotion[]> {
  return apiFetch<Promotion[]>("/api/promotions");
}

/** Every currently-active promotion (within its date window, if set), sorted
 * by admin-chosen order — the homepage picks which slots to fill from this
 * list (campaign banner = the 1st, editorial banner = the 2nd) rather than
 * needing a second CMS model for "the other kind of banner." Empty when
 * nothing is active; callers render nothing in that case. */
export async function getActivePromotions(): Promise<Promotion[]> {
  const promotions = await getPromotions();
  const now = Date.now();
  return promotions
    .filter((p) => p.isActive)
    .filter((p) => !p.startDate || new Date(p.startDate).getTime() <= now)
    .filter((p) => !p.endDate || new Date(p.endDate).getTime() >= now)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getAnnouncement(): Promise<Announcement> {
  return apiFetch<Announcement>("/api/announcement");
}

export async function getWelcomePopup(): Promise<WelcomePopup> {
  return apiFetch<WelcomePopup>("/api/welcome-popup");
}

export async function getMarketingSettings(): Promise<MarketingSettings> {
  return apiFetch<MarketingSettings>("/api/marketing-settings");
}

export async function getPaymentSettings(): Promise<PaymentSettings> {
  return apiFetch<PaymentSettings>("/api/payment-settings");
}

export async function getTestimonials(): Promise<Testimonial[]> {
  return apiFetch<Testimonial[]>("/api/testimonials");
}

/** Active testimonials only, admin-chosen order — same "list has everything,
 * caller filters" split as getActivePromotions. */
export async function getActiveTestimonials(): Promise<Testimonial[]> {
  const testimonials = await getTestimonials();
  return testimonials.filter((t) => t.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getThemeSettings(): Promise<ThemeSettings> {
  return apiFetch<ThemeSettings>("/api/theme-settings");
}

export async function subscribeNewsletter(email: string): Promise<void> {
  await apiFetch<{ message: string }>("/api/newsletter/subscribe", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}
