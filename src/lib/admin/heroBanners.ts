import { apiFetch } from "@/lib/api";
import { HeroBanner } from "@/types/storefront";

export interface HeroBannerInput {
  titleBn: string;
  titleEn: string;
  subtitleBn: string;
  subtitleEn: string;
  ctaLabelBn: string;
  ctaLabelEn: string;
  ctaUrl: string;
  desktopImage: string;
  mobileImage?: string;
  objectPosition?: string;
  isActive: boolean;
  sortOrder: number;
}

export async function createHeroBanner(idToken: string, input: HeroBannerInput) {
  return apiFetch<HeroBanner>("/api/hero-banners", { method: "POST", body: JSON.stringify(input) }, idToken);
}

export async function updateHeroBanner(idToken: string, id: string, input: HeroBannerInput) {
  return apiFetch<HeroBanner>(`/api/hero-banners/${id}`, { method: "PATCH", body: JSON.stringify(input) }, idToken);
}

export async function deleteHeroBanner(idToken: string, id: string) {
  return apiFetch<void>(`/api/hero-banners/${id}`, { method: "DELETE" }, idToken);
}
