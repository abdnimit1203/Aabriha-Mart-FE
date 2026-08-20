import { apiFetch } from "@/lib/api";
import { Promotion } from "@/types/storefront";

export interface PromotionInput {
  image: string;
  mobileImage?: string;
  titleBn?: string;
  titleEn?: string;
  descriptionBn?: string;
  descriptionEn?: string;
  ctaLabelBn?: string;
  ctaLabelEn?: string;
  ctaUrl: string;
  isActive: boolean;
  sortOrder: number;
  startDate?: string;
  endDate?: string;
}

export async function createPromotion(idToken: string, input: PromotionInput) {
  return apiFetch<Promotion>("/api/promotions", { method: "POST", body: JSON.stringify(input) }, idToken);
}

export async function updatePromotion(idToken: string, id: string, input: PromotionInput) {
  return apiFetch<Promotion>(`/api/promotions/${id}`, { method: "PATCH", body: JSON.stringify(input) }, idToken);
}

export async function deletePromotion(idToken: string, id: string) {
  return apiFetch<void>(`/api/promotions/${id}`, { method: "DELETE" }, idToken);
}
