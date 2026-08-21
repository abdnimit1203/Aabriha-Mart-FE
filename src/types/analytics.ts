import { OrderStatus } from "@/types/order";

export interface AnalyticsTrendDay {
  date: string;
  orders: number;
  revenue: number;
}

export interface AnalyticsTopProduct {
  _id: string;
  name: string;
  slug: string;
  image: string | null;
  unitsSold: number;
  revenue: number;
}

export interface Analytics {
  range: "days" | "month";
  days: number;
  month?: number;
  year?: number;
  summary: { orders: number; revenue: number; averageOrderValue: number };
  trend: AnalyticsTrendDay[];
  statusCounts: Record<OrderStatus, number>;
  topProducts: AnalyticsTopProduct[];
  newCustomers: number;
  returningCustomers: number;
}
