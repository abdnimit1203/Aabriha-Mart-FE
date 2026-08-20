import { apiFetch } from "@/lib/api";
import { Announcement, WelcomePopup } from "@/types/storefront";

export async function updateAnnouncement(idToken: string, input: Announcement) {
  return apiFetch<Announcement>("/api/announcement", { method: "PUT", body: JSON.stringify(input) }, idToken);
}

export async function updateWelcomePopup(idToken: string, input: WelcomePopup) {
  return apiFetch<WelcomePopup>("/api/welcome-popup", { method: "PUT", body: JSON.stringify(input) }, idToken);
}
