import { apiFetch } from "@/lib/api";
import { PaymentSettings } from "@/types/storefront";

export interface PaymentSettingsInput {
  bkashEnabled: boolean;
  bkashQrImage: string | null;
  nagadEnabled: boolean;
  nagadQrImage: string | null;
  stripeEnabled: boolean;
}

export async function updatePaymentSettings(idToken: string, input: PaymentSettingsInput) {
  return apiFetch<PaymentSettings>("/api/payment-settings", { method: "PUT", body: JSON.stringify(input) }, idToken);
}
