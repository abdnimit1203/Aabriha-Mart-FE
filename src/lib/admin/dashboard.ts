import { apiFetch } from "@/lib/api";
import { OrderStatus } from "@/types/order";

export interface DashboardTrendDay {
  date: string;
  orders: number;
  revenue: number;
}

export interface DashboardSummary {
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  needsAttentionCount: number;
  statusCounts: Record<OrderStatus, number>;
  last7Days: DashboardTrendDay[];
}

export async function getDashboardSummary(idToken: string) {
  return apiFetch<DashboardSummary>("/api/admin/dashboard/summary", {}, idToken);
}
