import { apiFetch } from "@/lib/api";
import { ThemeSettings } from "@/types/storefront";

export async function updateThemeSettings(idToken: string, primaryColor: string) {
  return apiFetch<ThemeSettings>("/api/theme-settings", { method: "PUT", body: JSON.stringify({ primaryColor }) }, idToken);
}
