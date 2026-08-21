import { apiFetch } from "@/lib/api";
import { AdminCustomer, Moderator } from "@/types/user";

export interface AdminCustomerFilters {
  search?: string;
  page?: number;
  limit?: number;
}

export async function listCustomersAdmin(idToken: string, filters: AdminCustomerFilters = {}) {
  const query = new URLSearchParams();
  if (filters.search) query.set("search", filters.search);
  query.set("page", String(filters.page ?? 1));
  query.set("limit", String(filters.limit ?? 20));

  return apiFetch<{ customers: AdminCustomer[]; total: number; page: number; limit: number }>(
    `/api/admin/users/customers?${query.toString()}`,
    {},
    idToken
  );
}

export async function listModeratorsAdmin(idToken: string) {
  return apiFetch<{ moderators: Moderator[] }>("/api/admin/users/moderators", {}, idToken);
}

export async function updateUserRoleAdmin(idToken: string, id: string, role: "customer" | "order_manager" | "super_admin") {
  return apiFetch<Moderator>(`/api/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) }, idToken);
}
