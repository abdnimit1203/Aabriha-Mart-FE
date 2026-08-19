import { apiFetch } from "@/lib/api";
import { Category, Product } from "@/types/catalog";

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
