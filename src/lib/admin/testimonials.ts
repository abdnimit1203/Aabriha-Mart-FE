import { apiFetch } from "@/lib/api";
import { Testimonial } from "@/types/storefront";

export interface TestimonialInput {
  name: string;
  quote: string;
  rating: number;
  photo?: string;
  isActive: boolean;
  sortOrder: number;
}

export async function createTestimonial(idToken: string, input: TestimonialInput) {
  return apiFetch<Testimonial>("/api/testimonials", { method: "POST", body: JSON.stringify(input) }, idToken);
}

export async function updateTestimonial(idToken: string, id: string, input: TestimonialInput) {
  return apiFetch<Testimonial>(`/api/testimonials/${id}`, { method: "PATCH", body: JSON.stringify(input) }, idToken);
}

export async function deleteTestimonial(idToken: string, id: string) {
  return apiFetch<void>(`/api/testimonials/${id}`, { method: "DELETE" }, idToken);
}
