import { apiFetch } from "@/lib/api";
import { Category, Product } from "@/types/catalog";
import { Announcement, HeroBanner, Promotion, WelcomePopup } from "@/types/storefront";

export async function getAllCategories(): Promise<Category[]> {
  return apiFetch<Category[]>("/api/categories");
}

export async function getTopLevelCategories(): Promise<Category[]> {
  const categories = await getAllCategories();
  return categories.filter((c) => !c.parent && c.isActive);
}

/** Ranked by real units sold, not a fake "featured" flag — see the backend's
 * getPopularProducts for why. Empty when the store has no sales history yet;
 * never backfilled with unrelated products just to fill the section. */
export async function getPopularProducts(limit = 8): Promise<Product[]> {
  const { products } = await apiFetch<{ products: Product[] }>(`/api/products/popular?limit=${limit}`);
  return products;
}

/** The category itself plus its direct children's ids — a parent category
 * page should show products from both, not just ones tagged to the parent. */
export function categoryAndChildrenIds(category: Category, allCategories: Category[]): string[] {
  const childIds = allCategories.filter((c) => c.parent === category._id).map((c) => c._id);
  return [category._id, ...childIds];
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
