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

export async function getFeaturedProducts(): Promise<Product[]> {
  const { products } = await apiFetch<{ products: Product[] }>("/api/products?status=active&limit=8");
  return products;
}

/** The category itself plus its direct children's ids — a parent category
 * page should show products from both, not just ones tagged to the parent. */
export function categoryAndChildrenIds(category: Category, allCategories: Category[]): string[] {
  const childIds = allCategories.filter((c) => c.parent === category._id).map((c) => c._id);
  return [category._id, ...childIds];
}

export async function getNewArrivals(): Promise<Product[]> {
  const { products } = await apiFetch<{ products: Product[] }>("/api/products?status=active&sort=newest&limit=8");
  return products;
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

/** First active promotion by sort order, or null if none is active — the
 * homepage section renders nothing in that case rather than an empty card. */
export async function getActivePromotion(): Promise<Promotion | null> {
  const promotions = await getPromotions();
  const now = Date.now();
  const active = promotions
    .filter((p) => p.isActive)
    .filter((p) => !p.startDate || new Date(p.startDate).getTime() <= now)
    .filter((p) => !p.endDate || new Date(p.endDate).getTime() >= now)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return active[0] ?? null;
}

export async function getAnnouncement(): Promise<Announcement> {
  return apiFetch<Announcement>("/api/announcement");
}

export async function getWelcomePopup(): Promise<WelcomePopup> {
  return apiFetch<WelcomePopup>("/api/welcome-popup");
}
