import { OrderStatus, PaymentStatus } from "@/types/order";

export const STATUS_OPTIONS: OrderStatus[] = [
  "pending",
  "confirmed",
  "processing",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "returned",
];

export const STATUS_CLASS: Record<OrderStatus, string> = {
  pending: "bg-background text-muted-foreground",
  confirmed: "bg-primary/10 text-primary-strong",
  processing: "bg-primary/10 text-primary-strong",
  packed: "bg-primary/10 text-primary-strong",
  shipped: "bg-primary/10 text-primary-strong",
  out_for_delivery: "bg-primary/10 text-primary-strong",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-danger/10 text-danger",
  returned: "bg-danger/10 text-danger",
};

export const PAYMENT_STATUS_OPTIONS: PaymentStatus[] = ["unpaid", "pending_verification", "paid", "refunded"];

export const PAYMENT_STATUS_CLASS: Record<PaymentStatus, string> = {
  unpaid: "bg-background text-muted-foreground",
  pending_verification: "bg-yellow-100 text-yellow-700",
  paid: "bg-green-100 text-green-700",
  refunded: "bg-danger/10 text-danger",
};

export function formatStatusLabel(value: string): string {
  return value.replace(/_/g, " ");
}
