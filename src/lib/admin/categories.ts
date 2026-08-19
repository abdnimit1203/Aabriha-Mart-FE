import { apiFetch } from "@/lib/api";
import { Category } from "@/types/catalog";

export interface CategoryInput {
  name: string;
  slug: string;
  parent: string | null;
  image?: string;
  isActive: boolean;
  sortOrder: number;
}

export async function createCategory(idToken: string, input: CategoryInput) {
  return apiFetch<Category>("/api/categories", { method: "POST", body: JSON.stringify(input) }, idToken);
}

export async function updateCategory(idToken: string, id: string, input: CategoryInput) {
  return apiFetch<Category>(`/api/categories/${id}`, { method: "PATCH", body: JSON.stringify(input) }, idToken);
}

export async function deleteCategory(idToken: string, id: string) {
  return apiFetch<void>(`/api/categories/${id}`, { method: "DELETE" }, idToken);
}
