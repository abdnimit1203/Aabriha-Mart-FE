import { apiFetch } from "@/lib/api";
import { AdminOrder, OrderStatus, PaymentStatus } from "@/types/order";

export interface AdminOrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  source?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export async function listOrdersAdmin(idToken: string, filters: AdminOrderFilters = {}) {
  const query = new URLSearchParams();
  if (filters.status) query.set("status", filters.status);
  if (filters.paymentStatus) query.set("paymentStatus", filters.paymentStatus);
  if (filters.source) query.set("source", filters.source);
  if (filters.search) query.set("search", filters.search);
  query.set("page", String(filters.page ?? 1));
  query.set("limit", String(filters.limit ?? 20));

  return apiFetch<{ orders: AdminOrder[]; total: number; page: number; limit: number }>(
    `/api/orders/admin?${query.toString()}`,
    {},
    idToken
  );
}

export async function getOrderAdmin(idToken: string, id: string) {
  return apiFetch<AdminOrder>(`/api/orders/admin/${id}`, {}, idToken);
}

export async function updateOrderStatus(idToken: string, id: string, status: OrderStatus) {
  return apiFetch<AdminOrder>(
    `/api/orders/admin/${id}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
    idToken
  );
}

export async function updateOrderPayment(
  idToken: string,
  id: string,
  input: { paymentStatus: PaymentStatus; refundAmount?: number; refundReference?: string }
) {
  return apiFetch<AdminOrder>(
    `/api/orders/admin/${id}/payment`,
    { method: "PATCH", body: JSON.stringify(input) },
    idToken
  );
}
