import { apiFetch } from "@/lib/api";
import { Product, StockIntake } from "@/types/catalog";

export interface StockIntakeInput {
  product: string;
  variantId?: string;
  supplier: string;
  quantity: number;
  unitCost: number;
  note?: string;
  intakeDate: string;
}

export async function listStockIntakes(idToken: string, params: { product?: string; page?: number; limit?: number } = {}) {
  const query = new URLSearchParams();
  if (params.product) query.set("product", params.product);
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 20));
  return apiFetch<{ intakes: StockIntake[]; total: number; page: number; limit: number }>(
    `/api/stock-intakes?${query.toString()}`,
    {},
    idToken
  );
}

export async function createStockIntake(idToken: string, input: StockIntakeInput) {
  return apiFetch<{ intake: StockIntake; product: Product }>(
    "/api/stock-intakes",
    { method: "POST", body: JSON.stringify(input) },
    idToken
  );
}
