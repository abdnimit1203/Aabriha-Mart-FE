import { apiFetch } from "@/lib/api";
import { MarketingSettings } from "@/types/storefront";

// GET is public (see lib/catalog.ts's getMarketingSettings) — a Pixel ID
// isn't a secret. Only the write needs auth, so that's all this file has.
export async function updateMarketingSettings(
  idToken: string,
  input: { facebookPixelEnabled: boolean; facebookPixelId: string }
) {
  return apiFetch<MarketingSettings>(
    "/api/marketing-settings",
    { method: "PUT", body: JSON.stringify(input) },
    idToken
  );
}
