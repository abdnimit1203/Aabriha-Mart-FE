import { apiFetch } from "@/lib/api";
import { Product, ProductImage } from "@/types/catalog";

export interface VariantInput {
  _id?: string;
  sku: string;
  attributes: Record<string, string>;
  price: number;
  discountPrice?: number;
  stock: number;
  weightGrams?: number;
  images: ProductImage[];
  status: "active" | "inactive";
}

export interface ProductInput {
  name: string;
  slug: string;
  category: string;
  description?: string;
  images: ProductImage[];
  weightGrams: number;
  attributeNames: string[];
  variants: VariantInput[];
  price?: number;
  discountPrice?: number;
  stock?: number;
  status: "active" | "inactive";
}

export async function listProductsAdmin(params: { search?: string; page?: number; limit?: number } = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  return apiFetch<{ products: Product[]; total: number; page: number; limit: number }>(
    `/api/products?${query.toString()}`
  );
}

export async function getProductAdmin(id: string) {
  return apiFetch<Product>(`/api/products/${id}`);
}

export async function createProduct(idToken: string, input: ProductInput) {
  return apiFetch<Product>("/api/products", { method: "POST", body: JSON.stringify(input) }, idToken);
}

export async function updateProduct(idToken: string, id: string, input: ProductInput) {
  return apiFetch<Product>(`/api/products/${id}`, { method: "PATCH", body: JSON.stringify(input) }, idToken);
}

export async function deleteProduct(idToken: string, id: string) {
  return apiFetch<void>(`/api/products/${id}`, { method: "DELETE" }, idToken);
}
