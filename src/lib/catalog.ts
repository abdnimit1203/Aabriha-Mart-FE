import { apiFetch } from "@/lib/api";
import { Category, Product } from "@/types/catalog";

export async function getTopLevelCategories(): Promise<Category[]> {
  const categories = await apiFetch<Category[]>("/api/categories");
  return categories.filter((c) => !c.parent && c.isActive);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const { products } = await apiFetch<{ products: Product[] }>("/api/products?status=active&limit=8");
  return products;
}
